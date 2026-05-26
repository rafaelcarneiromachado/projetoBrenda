"use client";

import { FormEvent, useEffect, useState } from "react";
import { Edit3, HeartHandshake, Image as ImageIcon } from "lucide-react";
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

const lodgingTypeLabels: Record<string, string> = {
  room: "Quarto",
  sofa: "Sofá",
  entire_home: "Casa inteira",
  guest_house: "Edícula",
  mattress: "Colchão",
  other: "Outro espaço",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_review: "Em análise",
  approved: "Aprovada",
  rejected: "Rejeitada",
  suspended: "Suspensa",
};

const conditionOptions = [
  "Pode chegar a noite",
  "Tem roupa de cama",
  "Tem acesso a cozinha",
  "Tem Wi-Fi",
  "Aceita mais de uma noite",
  "Tem escadas",
];

type HostLodging = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  city: string;
  neighborhood: string;
  approximate_address: string | null;
  nearest_hospital: string | null;
  capacity: number;
  bathroom: string;
  availability: string | null;
  status: string;
  conditions: string[];
  photos: string[];
};

function createPhotoStoragePath(userId: string, lodgingId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "-");
  return `${userId}/${lodgingId}/${Date.now()}-${safeName}`;
}

export default function AnfitrioesPage() {
  const [profile, setProfile] = useState({
    email: "",
    fullName: "",
    phone: "",
    city: "",
    address: "",
  });
  const [hostLodgings, setHostLodgings] = useState<HostLodging[]>([]);
  const [editingId, setEditingId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  async function loadHostLodgings(userId: string) {
    if (!supabase) {
      return;
    }
    const client = supabase;

    const { data: lodgings } = await client
      .from("lodgings")
      .select(
        "id,title,description,type,city,neighborhood,approximate_address,nearest_hospital,capacity,bathroom,availability,status,created_at",
      )
      .eq("host_id", userId)
      .order("created_at", { ascending: false });

    const lodgingRows = (lodgings ?? []) as Omit<HostLodging, "conditions" | "photos">[];
    const lodgingIds = lodgingRows.map((lodging) => lodging.id);

    if (lodgingIds.length === 0) {
      setHostLodgings([]);
      return;
    }

    const [conditionsResult, photosResult] = await Promise.all([
      client
        .from("lodging_conditions")
        .select("lodging_id,label")
        .in("lodging_id", lodgingIds),
      client
        .from("lodging_photos")
        .select("lodging_id,storage_path")
        .in("lodging_id", lodgingIds),
    ]);

    const conditionsByLodging = new Map<string, string[]>();
    for (const condition of conditionsResult.data ?? []) {
      const current = conditionsByLodging.get(condition.lodging_id) ?? [];
      current.push(condition.label);
      conditionsByLodging.set(condition.lodging_id, current);
    }

    const photoUrls = await Promise.all(
      (photosResult.data ?? []).map(async (photo) => {
        const { data } = await client.storage
          .from("lodging-photos")
          .createSignedUrl(photo.storage_path, 60 * 20);

        return {
          lodging_id: photo.lodging_id,
          signed_url: data?.signedUrl ?? "",
        };
      }),
    );
    const photosByLodging = new Map<string, string[]>();
    for (const photo of photoUrls) {
      if (!photo.signed_url) {
        continue;
      }

      const current = photosByLodging.get(photo.lodging_id) ?? [];
      current.push(photo.signed_url);
      photosByLodging.set(photo.lodging_id, current);
    }

    setHostLodgings(
      lodgingRows.map((lodging) => ({
        ...lodging,
        conditions: conditionsByLodging.get(lodging.id) ?? [],
        photos: photosByLodging.get(lodging.id) ?? [],
      })),
    );
  }

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!supabase) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name,phone,city,address,address_number,address_complement")
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
        address: [data?.address, data?.address_number, data?.address_complement]
          .filter(Boolean)
          .join(", "),
      });
      await loadHostLodgings(user.id);
    }

    window.setTimeout(loadProfile, 0);

    return () => {
      mounted = false;
    };
  }, []);

  function updateProfileField(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
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

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? null,
      full_name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      role: currentProfile?.role === "admin" ? "admin" : "host",
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
    await loadHostLodgings(user.id);
    setLoading(false);
  }

  async function uploadLodgingPhotos(userId: string, lodgingId: string, photos: File[]) {
    if (!supabase) {
      return;
    }

    for (const photo of photos) {
      const storagePath = createPhotoStoragePath(userId, lodgingId, photo.name);
      const { error: uploadError } = await supabase.storage
        .from("lodging-photos")
        .upload(storagePath, photo);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: photoError } = await supabase.from("lodging_photos").insert({
        lodging_id: lodgingId,
        storage_path: storagePath,
      });

      if (photoError) {
        throw new Error(photoError.message);
      }
    }
  }

  async function handleEditSubmit(
    event: FormEvent<HTMLFormElement>,
    lodgingId: string,
  ) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setEditMessage("");
    setEditLoading(true);

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      setEditLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Entre novamente para editar o espaço.");
      setEditLoading(false);
      return;
    }

    const spaceType = String(form.get("spaceType") ?? "");
    const photos = form.getAll("photos").filter((item): item is File => {
      return item instanceof File && item.size > 0;
    });

    const { error: updateError } = await supabase.rpc("host_update_lodging", {
      target_lodging_id: lodgingId,
      next_title: String(form.get("title") ?? ""),
      next_description: String(form.get("notes") ?? ""),
      next_type: lodgingTypeMap[spaceType] ?? "other",
      next_city: String(form.get("city") ?? ""),
      next_neighborhood: String(form.get("neighborhood") ?? ""),
      next_approximate_address: String(form.get("address") ?? ""),
      next_nearest_hospital: String(form.get("nearestHospital") ?? ""),
      next_capacity: Number(String(form.get("capacity")).replace(/\D/g, "")) || 1,
      next_bathroom: String(form.get("bathroom") ?? ""),
      next_availability: String(form.get("availability") ?? ""),
      next_conditions: form.getAll("conditions").map(String),
    });

    if (updateError) {
      setError(updateError.message);
      setEditLoading(false);
      return;
    }

    try {
      await uploadLodgingPhotos(user.id, lodgingId, photos);
    } catch (photoError) {
      setError(
        photoError instanceof Error
          ? photoError.message
          : "Não foi possível enviar as fotos.",
      );
      setEditLoading(false);
      return;
    }

    await loadHostLodgings(user.id);
    setEditingId("");
    setEditMessage("Hospedagem atualizada e enviada para nova revisão.");
    setEditLoading(false);
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
        <section className="soft-shell mb-6 rounded-[2rem] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                minhas hospedagens
              </p>
              <h2 className="mt-2 text-2xl font-black">Espaços cadastrados</h2>
            </div>
          </div>
          {editMessage ? (
            <div className="mt-4 rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold text-[var(--rose-dark)]">
              {editMessage}
            </div>
          ) : null}
          <div className="mt-5 grid gap-4">
            {hostLodgings.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 font-bold text-[var(--muted)]">
                Você ainda não cadastrou nenhuma hospedagem.
              </p>
            ) : (
              hostLodgings.map((lodging) => (
                <article
                  className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white"
                  key={lodging.id}
                >
                  <div className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black">{lodging.title}</h3>
                        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-black text-[var(--rose-dark)]">
                          {statusLabels[lodging.status] ?? lodging.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">
                        {lodging.neighborhood}, {lodging.city} · {lodging.capacity} pessoa
                        {lodging.capacity > 1 ? "s" : ""} · banheiro{" "}
                        {lodging.bathroom.toLowerCase()}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Ao editar, a hospedagem volta para revisão da moderação.
                      </p>
                    </div>
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 text-sm font-black transition hover:bg-[var(--surface-soft)]"
                      onClick={() =>
                        setEditingId((current) =>
                          current === lodging.id ? "" : lodging.id,
                        )
                      }
                      type="button"
                    >
                      <Edit3 aria-hidden size={16} />
                      {editingId === lodging.id ? "Fechar edição" : "Editar"}
                    </button>
                  </div>

                  {lodging.photos.length > 0 ? (
                    <div className="grid gap-2 border-t border-[var(--line)] bg-[var(--surface-soft)] p-4 sm:grid-cols-3">
                      {lodging.photos.slice(0, 3).map((photo) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt=""
                          className="h-28 w-full rounded-2xl object-cover"
                          key={photo}
                          src={photo}
                        />
                      ))}
                    </div>
                  ) : null}

                  {editingId === lodging.id ? (
                    <form
                      className="grid gap-5 border-t border-[var(--line)] p-4"
                      onSubmit={(event) => handleEditSubmit(event, lodging.id)}
                    >
                      <TextField
                        defaultValue={lodging.title}
                        label="Título"
                        name="title"
                        required
                      />
                      <div className="grid gap-5 md:grid-cols-2">
                        <TextField
                          defaultValue={lodging.city}
                          label="Cidade"
                          name="city"
                          required
                        />
                        <TextField
                          defaultValue={lodging.neighborhood}
                          label="Bairro"
                          name="neighborhood"
                          required
                        />
                      </div>
                      <TextField
                        defaultValue={lodging.approximate_address ?? ""}
                        hint="Use um endereço aproximado. O endereço completo só deve ser compartilhado após verificação."
                        label="Endereço aproximado"
                        name="address"
                        required
                      />
                      <div className="grid gap-5 md:grid-cols-3">
                        <SelectField
                          defaultValue={lodgingTypeLabels[lodging.type] ?? "Outro espaço"}
                          label="Tipo de espaço"
                          name="spaceType"
                          required
                        >
                          <option>Quarto</option>
                          <option>Sofá</option>
                          <option>Casa inteira</option>
                          <option>Edícula</option>
                          <option>Colchão</option>
                          <option>Outro espaço</option>
                        </SelectField>
                        <SelectField
                          defaultValue={`${lodging.capacity} pessoa${
                            lodging.capacity > 1 ? "s" : ""
                          }`}
                          label="Capacidade"
                          name="capacity"
                          required
                        >
                          <option>1 pessoa</option>
                          <option>2 pessoas</option>
                          <option>3 pessoas</option>
                        </SelectField>
                        <SelectField
                          defaultValue={lodging.bathroom}
                          label="Banheiro"
                          name="bathroom"
                          required
                        >
                          <option>Compartilhado</option>
                          <option>Exclusivo</option>
                        </SelectField>
                      </div>
                      <div className="grid gap-5 md:grid-cols-2">
                        <TextField
                          defaultValue={lodging.availability ?? ""}
                          label="Dias disponíveis"
                          name="availability"
                          required
                        />
                        <TextField
                          defaultValue={lodging.nearest_hospital ?? ""}
                          label="Hospital mais próximo"
                          name="nearestHospital"
                        />
                      </div>
                      <TextAreaField
                        defaultValue={lodging.description ?? ""}
                        label="Observações sobre o espaço"
                        name="notes"
                        required
                      />
                      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                        <p className="text-sm font-black">Condições do local</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {conditionOptions.map((condition) => (
                            <label
                              className="flex items-center gap-2 text-sm font-bold"
                              key={condition}
                            >
                              <input
                                defaultChecked={lodging.conditions.includes(condition)}
                                name="conditions"
                                type="checkbox"
                                value={condition}
                              />
                              {condition}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                        <p className="flex items-center gap-2 text-sm font-black">
                          <ImageIcon aria-hidden size={16} />
                          Adicionar fotos
                        </p>
                        <input
                          accept="image/*"
                          className="mt-4 block w-full rounded-2xl border border-dashed border-[var(--line)] bg-white p-4 text-sm font-bold"
                          multiple
                          name="photos"
                          type="file"
                        />
                      </div>
                      <button
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)] disabled:opacity-60"
                        disabled={editLoading}
                      >
                        {editLoading ? "Salvando..." : "Salvar alterações"}
                      </button>
                    </form>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

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
            <TextField
              label="Nome completo"
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
              label="Cidade"
              name="city"
              onChange={(event) => updateProfileField("city", event.target.value)}
              required
              value={profile.city}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Bairro" name="neighborhood" required />
            <TextField
              hint="Nesta fase, use um endereço aproximado. O endereço completo só deve ser compartilhado após verificação."
              label="Endereço aproximado"
              name="address"
              onChange={(event) => updateProfileField("address", event.target.value)}
              required
              value={profile.address}
            />
          </div>

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
              {conditionOptions.map((condition) => (
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
