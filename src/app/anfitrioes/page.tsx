"use client";

import { FormEvent, useState } from "react";
import { FormShell } from "../components/FormShell";
import { SelectField, TextAreaField, TextField } from "../components/Field";

export default function AnfitrioesPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <FormShell
      current="anfitrioes"
      eyebrow="Oferta solidaria"
      title="Ofereca um espaco seguro para uma familia descansar."
      description="Este cadastro e para pessoas que moram perto de hospitais e podem oferecer hospedagem temporaria, gratuita e verificada."
    >
      <form
        className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-sm md:p-7"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5">
          {submitted ? (
            <div className="rounded-md border border-[#86efac] bg-[#f0fdf4] px-4 py-3 text-sm leading-6 text-[#166534]">
              Oferta registrada nesta demonstracao. Na proxima etapa vamos
              salvar essas informacoes no Supabase.
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Nome completo" name="name" required />
            <TextField
              label="Telefone com WhatsApp"
              name="phone"
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Cidade" name="city" required />
            <TextField label="Bairro" name="neighborhood" required />
          </div>

          <TextField
            hint="Nesta fase, use um endereco aproximado. O endereco completo so deve ser compartilhado apos verificacao."
            label="Endereco aproximado"
            name="address"
            required
          />

          <div className="grid gap-5 md:grid-cols-3">
            <SelectField label="Tipo de espaco" name="spaceType" required>
              <option value="">Selecione</option>
              <option>Quarto</option>
              <option>Sofa</option>
              <option>Edicula</option>
              <option>Colchao</option>
              <option>Outro espaco</option>
            </SelectField>
            <SelectField label="Capacidade" name="capacity" required>
              <option value="">Selecione</option>
              <option>1 pessoa</option>
              <option>2 pessoas</option>
              <option>3 pessoas</option>
            </SelectField>
            <SelectField label="Banheiro" name="bathroom" required>
              <option value="">Selecione</option>
              <option>Compartilhado</option>
              <option>Exclusivo</option>
            </SelectField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Dias disponiveis" name="availability" placeholder="Ex.: segunda a sexta" required />
            <TextField label="Hospital mais proximo" name="nearestHospital" />
          </div>

          <TextAreaField
            hint="Informe regras importantes da casa, acessibilidade, animais, horario de entrada e qualquer limite que ajude a moderacao."
            label="Observacoes sobre o espaco"
            name="notes"
            required
          />

          <label className="flex gap-3 rounded-md bg-[var(--background)] p-4 text-sm leading-6 text-[var(--muted)]">
            <input className="mt-1 h-4 w-4" name="consent" required type="checkbox" />
            <span>
              Confirmo que entendo que a oferta sera revisada manualmente antes
              de qualquer contato com uma familia.
            </span>
          </label>

          <button className="min-h-12 rounded-md bg-[var(--brand)] px-6 font-bold text-white transition hover:bg-[var(--brand-dark)]">
            Enviar oferta
          </button>
        </div>
      </form>
    </FormShell>
  );
}
