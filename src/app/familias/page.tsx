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
    setError("");
    setSubmitted(false);
    setLoading(true);

    if (!supabase) {
      setError("Supabase nao esta configurado neste ambiente.");
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

    const form = new FormData(event.currentTarget);
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
    event.currentTarget.reset();
    setLoading(false);
  }

  return (
    <FormShell
      current="familias"
      eyebrow="Pedido de acolhimento"
      title="Conte para a gente quem precisa ficar perto do hospital."
      description="Este formulario registra uma solicitacao inicial de hospedagem solidaria para familiares de criancas e adolescentes em tratamento oncologico."
    >
      <AuthGate
        message="Para solicitar uma hospedagem solidaria, precisamos confirmar seu acesso e manter um historico seguro do pedido."
      >
        <form
          className="soft-shell rounded-[2rem] p-5 md:p-7"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            {submitted ? (
              <div className="rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold leading-6 text-[var(--rose-dark)]">
                Pedido recebido. A equipe do Projeto Brenda revisara as
                informacoes antes de qualquer combinacao de hospedagem.
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold leading-6 text-[#be123c]">
                {error}
              </div>
            ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Nome do responsavel" name="name" required />
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
              <option>Mae</option>
              <option>Avo ou avo</option>
              <option>Irmao ou irma</option>
              <option>Outro responsavel</option>
            </SelectField>
            <SelectField label="Quantidade de pessoas" name="people" required>
              <option value="">Selecione</option>
              <option>1 pessoa</option>
              <option>2 pessoas</option>
              <option>3 pessoas</option>
            </SelectField>
          </div>

          <TextAreaField
            hint="Nao inclua detalhes medicos desnecessarios. Basta explicar o contexto da viagem e da necessidade de acolhimento."
            label="Observacoes"
            name="notes"
          />

          <label className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            <input className="mt-1 h-4 w-4" name="consent" required type="checkbox" />
            <span>
              Confirmo que entendo que este cadastro sera revisado manualmente
              e que a hospedagem depende de disponibilidade e verificacao.
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
