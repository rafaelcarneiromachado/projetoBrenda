"use client";

import { FormEvent, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { FormShell } from "../components/FormShell";
import { SelectField, TextAreaField, TextField } from "../components/Field";
import { LodgingPhotoCarousel } from "../components/LodgingPhotoCarousel";
import { Stay } from "../data/stays";
import { loadApprovedStays } from "../lib/publicLodgings";
import { supabase } from "../lib/supabase";

export default function FamiliasPage() {
  const [profile, setProfile] = useState({
    email: "",
    fullName: "",
    phone: "",
    city: "",
  });
  const [requestDetails, setRequestDetails] = useState({
    hospital: "",
    hospitalCity: "",
  });
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!supabase) {
        return;
      }

      const lodgingId = new URLSearchParams(window.location.search).get("hospedagem");
      if (lodgingId) {
        const approvedStays = await loadApprovedStays(supabase);
        const stay = approvedStays.find((item) => item.id === lodgingId) ?? null;

        if (mounted && stay) {
          setSelectedStay(stay);
          setRequestDetails({
            hospital: stay.hospital ?? "",
            hospitalCity: stay.city,
          });
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name,phone,city")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      setProfile({
        email: user.email ?? "",
        fullName: data?.full_name ?? user.user_metadata.full_name ?? "",
        phone: data?.phone ?? user.user_metadata.phone ?? "",
        city: data?.city ?? "",
      });
    }

    window.setTimeout(loadProfile, 0);

    return () => {
      mounted = false;
    };
  }, []);

  function updateProfileField(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateRequestField(field: keyof typeof requestDetails, value: string) {
    setRequestDetails((current) => ({ ...current, [field]: value }));
  }

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
      lodging_id: selectedStay?.id ?? null,
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
      description={
        selectedStay
          ? "Revise seus dados e informe as datas para solicitar esta hospedagem. A moderação verificará disponibilidade e segurança antes de conectar vocês."
          : "Escolha uma hospedagem em Buscar Hospedagem para iniciar um pedido vinculado a um anfitrião."
      }
      layout="single"
    >
      {selectedStay ? (
        <article className="mb-6 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-xl shadow-[#19101410]">
          <LodgingPhotoCarousel
            className="h-64 w-full md:h-80"
            images={selectedStay.images ?? [selectedStay.image]}
            title={selectedStay.title}
          />
          <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start md:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                hospedagem selecionada
              </p>
              <h2 className="mt-2 text-2xl font-black">{selectedStay.title}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[var(--muted)]">
                {selectedStay.neighborhood}, {selectedStay.city} ·{" "}
                {selectedStay.capacity} pessoa
                {selectedStay.capacity > 1 ? "s" : ""} · banheiro{" "}
                {selectedStay.bathroom.toLowerCase()}
              </p>
              <p className="mt-3 leading-7 text-[var(--muted)]">
                {selectedStay.notes}
              </p>
            </div>
            <div className="grid gap-2 rounded-2xl bg-[var(--surface-soft)] p-4 text-sm font-black text-[var(--brand-dark)]">
              <span>{selectedStay.distanceKm.toFixed(1)} km do hospital</span>
              <span>{selectedStay.availableTonight ? "Disponível Hoje" : "Sob Consulta"}</span>
            </div>
          </div>
        </article>
      ) : null}
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
            {selectedStay ? (
              <input name="lodgingId" type="hidden" value={selectedStay.id} />
            ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Nome do responsável"
              name="name"
              onChange={(event) => updateProfileField("fullName", event.target.value)}
              required
              value={profile.fullName}
            />
            <TextField
              label="Telefone com WhatsApp"
              name="phone"
              onChange={(event) => updateProfileField("phone", event.target.value)}
              placeholder="(00) 00000-0000"
              required
              value={profile.phone}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="E-mail da conta" name="email" readOnly value={profile.email} />
            <TextField
              label="Cidade de origem"
              name="originCity"
              onChange={(event) => updateProfileField("city", event.target.value)}
              required
              value={profile.city}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="Hospital"
              name="hospital"
              onChange={(event) => updateRequestField("hospital", event.target.value)}
              required
              value={requestDetails.hospital}
            />
            <TextField
              label="Cidade do hospital"
              name="hospitalCity"
              onChange={(event) =>
                updateRequestField("hospitalCity", event.target.value)
              }
              required
              value={requestDetails.hospitalCity}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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
