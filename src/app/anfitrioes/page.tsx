"use client";

import { FormEvent, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { FormShell } from "../components/FormShell";
import { SelectField, TextAreaField, TextField } from "../components/Field";
import { supabase } from "../lib/supabase";

const lodgingTypeMap: Record<string, string> = {
  Quarto: "room",
  Sofá: "sofa",
  "Casa inteira": "entire_home",
  Edícula: "guest_house",
  Colchão: "mattress",
  "Outro espaço": "other",
};

export default function AnfitrioesPage() {
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
      setError("Entre novamente para cadastrar o espaço.");
      setLoading(false);
      return;
    }

    const spaceType = String(form.get("spaceType") ?? "");
    const city = String(form.get("city") ?? "");
    const neighborhood = String(form.get("neighborhood") ?? "");
    const conditions = form.getAll("conditions").map(String);
    const photos = form.getAll("photos").filter((item): item is File => {
      return item instanceof File && item.size > 0;
    });

    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      role: "host",
    });

    const { data: lodging, error: lodgingError } = await supabase
      .from("lodgings")
      .insert({
        host_id: user.id,
        title: `${spaceType} em ${neighborhood}`,
        description: String(form.get("notes") ?? ""),
        type: lodgingTypeMap[spaceType] ?? "other",
        city,
        neighborhood,
        approximate_address: String(form.get("address") ?? ""),
        nearest_hospital: String(form.get("nearestHospital") ?? ""),
        capacity: Number(String(form.get("capacity")).replace(/\D/g, "")) || 1,
        bathroom: String(form.get("bathroom") ?? ""),
        availability: String(form.get("availability") ?? ""),
        status: "pending",
      })
      .select("id")
      .single();

    if (lodgingError || !lodging) {
      setError(lodgingError?.message ?? "Não foi possível cadastrar o espaço.");
      setLoading(false);
      return;
    }

    if (conditions.length > 0) {
      const { error: conditionsError } = await supabase
        .from("lodging_conditions")
        .insert(
          conditions.map((label) => ({
            lodging_id: lodging.id,
            label,
          })),
        );

      if (conditionsError) {
        setError(conditionsError.message);
        setLoading(false);
        return;
      }
    }

    for (const photo of photos) {
      const safeName = photo.name.replace(/[^a-zA-Z0-9.-]/g, "-");
      const storagePath = `${user.id}/${lodging.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("lodging-photos")
        .upload(storagePath, photo);

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const { error: photoError } = await supabase.from("lodging_photos").insert({
        lodging_id: lodging.id,
        storage_path: storagePath,
      });

      if (photoError) {
        setError(photoError.message);
        setLoading(false);
        return;
      }
    }

    setSubmitted(true);
    formElement.reset();
    setLoading(false);
  }

  return (
    <FormShell
      current="anfitrioes"
      eyebrow="Oferta solidária"
      title="Ofereça um espaço seguro para uma família descansar."
      description="Este cadastro é para pessoas que moram perto de hospitais e podem oferecer hospedagem temporária, gratuita e verificada."
    >
      <AuthGate
        message="Para cadastrar um espaço, precisamos confirmar seu acesso e proteger as informações do local."
      >
        <form
          className="soft-shell rounded-[2rem] p-5 md:p-7"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            {submitted ? (
              <div className="rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold leading-6 text-[var(--rose-dark)]">
                Oferta recebida. A equipe do Projeto Brenda revisará o cadastro
                antes de disponibilizar o espaço para solicitações.
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold leading-6 text-[#be123c]">
                {error}
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
            hint="Nesta fase, use um endereço aproximado. O endereço completo só deve ser compartilhado após verificação."
            label="Endereço aproximado"
            name="address"
            required
          />

          <div className="grid gap-5 md:grid-cols-3">
            <SelectField label="Tipo de espaço" name="spaceType" required>
              <option value="">Selecione</option>
              <option>Quarto</option>
              <option>Sofá</option>
              <option>Casa inteira</option>
              <option>Edícula</option>
              <option>Colchão</option>
              <option>Outro espaço</option>
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
            <TextField label="Dias disponíveis" name="availability" placeholder="Ex.: segunda a sexta" required />
            <TextField label="Hospital mais próximo" name="nearestHospital" />
          </div>

          <TextAreaField
            hint="Informe regras importantes da casa, acessibilidade, animais, horário de entrada e qualquer limite que ajude a moderação."
            label="Observações sobre o espaço"
            name="notes"
            required
          />

          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-black">Condições do local</p>
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
              Envie fotos claras do espaço, entrada, banheiro e local de
              descanso. As imagens serão revisadas antes da publicação.
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
              Confirmo que entendo que a oferta será revisada manualmente antes
              de qualquer contato com uma família.
            </span>
          </label>

            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)] disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar oferta"}
              <HeartHandshake aria-hidden size={18} />
            </button>
          </div>
        </form>
      </AuthGate>
    </FormShell>
  );
}
