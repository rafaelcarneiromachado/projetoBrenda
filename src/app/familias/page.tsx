"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { FormShell } from "../components/FormShell";
import { SelectField, TextAreaField, TextField } from "../components/Field";

export default function FamiliasPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <FormShell
      current="familias"
      eyebrow="Pedido de acolhimento"
      title="Conte para a gente quem precisa ficar perto do hospital."
      description="Este formulario registra uma solicitacao inicial de hospedagem solidaria para familiares de criancas e adolescentes em tratamento oncologico."
    >
      <form
        className="soft-shell rounded-[2rem] p-5 md:p-7"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5">
          {submitted ? (
            <div className="rounded-2xl border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-sm leading-6 text-[#166534]">
              Pedido registrado nesta demonstracao. Na proxima etapa vamos
              salvar essas informacoes no Supabase.
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

          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#093f3940] transition hover:bg-[var(--brand)]">
            Enviar pedido
            <Send aria-hidden size={18} />
          </button>
        </div>
      </form>
    </FormShell>
  );
}
