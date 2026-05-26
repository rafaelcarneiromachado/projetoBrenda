"use client";

import { FormEvent, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { AuthGate } from "../components/AuthGate";
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
      <AuthGate
        message="Para cadastrar um espaco, precisamos confirmar seu acesso e proteger as informacoes do local."
      >
        <form
          className="soft-shell rounded-[2rem] p-5 md:p-7"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            {submitted ? (
              <div className="rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold leading-6 text-[var(--rose-dark)]">
                Oferta recebida. A equipe do Projeto Brenda revisara o cadastro
                antes de disponibilizar o espaco para solicitacoes.
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
              <option>Casa inteira</option>
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

          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-black">Condicoes do local</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {[
                "Pode chegar a noite",
                "Tem roupa de cama",
                "Tem acesso a cozinha",
                "Tem Wi-Fi",
                "Aceita mais de uma noite",
                "Tem escadas",
              ].map((condition) => (
                <label className="flex items-center gap-2 text-sm font-bold" key={condition}>
                  <input name="conditions" type="checkbox" value={condition} />
                  {condition}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-black">Fotos do local</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Envie fotos claras do espaco, entrada, banheiro e local de
              descanso. As imagens serao revisadas antes da publicacao.
            </p>
            <input
              accept="image/*"
              className="mt-4 block w-full rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm font-bold"
              multiple
              name="photos"
              type="file"
            />
          </div>

          <label className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-[var(--muted)]">
            <input className="mt-1 h-4 w-4" name="consent" required type="checkbox" />
            <span>
              Confirmo que entendo que a oferta sera revisada manualmente antes
              de qualquer contato com uma familia.
            </span>
          </label>

            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)]">
              Enviar oferta
              <HeartHandshake aria-hidden size={18} />
            </button>
          </div>
        </form>
      </AuthGate>
    </FormShell>
  );
}
