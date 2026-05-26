"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { FormShell } from "../components/FormShell";
import { SelectField, TextAreaField, TextField } from "../components/Field";
import { supabase } from "../lib/supabase";

export default function FamiliasPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError("");
    setSubmitted(false);
    setLoading(true);

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Entre novamente para enviar o pedido.");
      setLoading(false);
      return;
    }

    const people = Number(String(form.get("people")).replace(/\D/g, ""));

    const { error: insertError } = await supabase.from("stay_requests").insert({
      requester_id: user.id,
      responsible_name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      origin_city: String(form.get("originCity") ?? ""),
      hospital_name: String(form.get("hospital") ?? ""),
      hospital_city: String(form.get("hospitalCity") ?? ""),
      arrival_date: String(form.get("arrival") ?? ""),
      nights: Number(form.get("nights") ?? 1),
      guest_type: String(form.get("guestType") ?? ""),
      people_count: people || 1,
      notes: String(form.get("notes") ?? ""),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    formElement.reset();
    setLoading(false);
  }

  return (
    <FormShell
      current="familias"
      eyebrow="Pedido de acolhimento"
      title="Conte para a gente quem precisa ficar perto do hospital."
      description="Este formulário registra uma solicitação inicial de hospedagem solidária para familiares de pessoas em tratamento ou acompanhamento hospitalar."
    >
      <AuthGate
        message="Para solicitar uma hospedagem solidária, precisamos confirmar seu acesso e manter um histórico seguro do pedido."
      >
        <form
          className="soft-shell rounded-[2rem] p-5 md:p-7"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            {submitted ? (
              <div className="rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold leading-6 text-[var(--rose-dark)]">
                Pedido recebido. A equipe do Projeto Brenda revisará as
                informações antes de qualquer combinação de hospedagem.
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold leading-6 text-[#be123c]">
                {error}
              </div>
            ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Nome do responsável" name="name" required />
            <TextField
              label="Telefone com WhatsApp"
              name="phone"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Cidade de origem" name="originCity" required />
            <TextField label="Hospital" name="hospital" required />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <TextField label="Cidade do hospital" name="hospitalCity" required />
            <TextField label="Data de chegada" name="arrival" type="date" required />
            <TextField label="Noites previstas" min="1" name="nights" type="number" required />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <SelectField label="Quem precisa da hospedagem?" name="guestType" required>
              <option value="">Selecione</option>
              <option>Pai</option>
              <option>Mãe</option>
              <option>Avó ou avô</option>
              <option>Irmão ou irmã</option>
              <option>Outro responsável</option>
            </SelectField>
            <SelectField label="Quantidade de pessoas" name="people" required>
              <option value="">Selecione</option>
              <option>1 pessoa</option>
              <option>2 pessoas</option>
              <option>3 pessoas</option>
            </SelectField>
          </div>

          <TextAreaField
            hint="Não inclua detalhes médicos desnecessários. Basta explicar o contexto da viagem e da necessidade de acolhimento."
            label="Observações"
            name="notes"
          />

          <label className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            <input className="mt-1 h-4 w-4" name="consent" required type="checkbox" />
            <span>
              Confirmo que entendo que este cadastro será revisado manualmente
              e que a hospedagem depende de disponibilidade e verificação.
            </span>
          </label>

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)] disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar pedido"}
              <Send aria-hidden size={18} />
            </button>
          </div>
        </form>
      </AuthGate>
    </FormShell>
  );
}
