"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Camera,
  Check,
  ClipboardCheck,
  Eye,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  UserCircle,
  UserCog,
  X,
} from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { SiteHeader } from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

type Lodging = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  city: string;
  neighborhood: string;
  approximate_address: string | null;
  nearest_hospital: string | null;
  type: string;
  capacity: number;
  bathroom: string;
  availability: string | null;
  accessibility: boolean;
  available_now: boolean;
  status: string;
  created_at: string;
  host?: ProfileSummary;
  conditions: string[];
  photos: LodgingPhoto[];
};

type StayRequest = {
  id: string;
  requester_id: string;
  responsible_name: string;
  phone: string;
  origin_city: string;
  hospital_name: string;
  hospital_city: string;
  arrival_date: string;
  people_count: number;
  nights: number;
  guest_type: string;
  notes: string | null;
  status: string;
  created_at: string;
};

type ProfileSummary = {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  role: "family" | "host" | "admin";
};

type LodgingPhoto = {
  id: string;
  storage_path: string;
  signed_url?: string;
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_review: "Em revisão",
  approved: "Aprovada",
  rejected: "Rejeitada",
  suspended: "Suspensa",
  matched: "Combinada",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const lodgingTypeLabels: Record<string, string> = {
  room: "Quarto",
  sofa: "Sofá",
  entire_home: "Casa inteira",
  guest_house: "Edícula",
  mattress: "Colchão",
  other: "Outro espaço",
};

const roleLabels: Record<ProfileSummary["role"], string> = {
  family: "Família",
  host: "Anfitrião",
  admin: "Moderador",
};

const compactButton =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-black transition disabled:opacity-40";

export default function AdminPage() {
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [requests, setRequests] = useState<StayRequest[]>([]);
  const [users, setUsers] = useState<ProfileSummary[]>([]);
  const [expandedLodgingId, setExpandedLodgingId] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setError("");
    setLoading(true);

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      setLoading(false);
      return;
    }

    const client = supabase;
    const [lodgingsResult, requestsResult] = await Promise.all([
      client
        .from("lodgings")
        .select(
          "id,host_id,title,description,city,neighborhood,approximate_address,nearest_hospital,type,capacity,bathroom,availability,accessibility,available_now,status,created_at",
        )
        .order("created_at", { ascending: false }),
      client
        .from("stay_requests")
        .select(
          "id,requester_id,responsible_name,phone,origin_city,hospital_name,hospital_city,arrival_date,people_count,nights,guest_type,notes,status,created_at",
        )
        .order("created_at", { ascending: false }),
    ]);

    if (lodgingsResult.error) {
      setError(lodgingsResult.error.message);
      setLoading(false);
      return;
    }

    if (requestsResult.error) {
      setError(requestsResult.error.message);
      setLoading(false);
      return;
    }

    const lodgingRows = lodgingsResult.data ?? [];
    const lodgingIds = lodgingRows.map((lodging) => lodging.id);

    const [conditionsResult, photosResult, profilesResult] = await Promise.all([
      lodgingIds.length > 0
        ? client
            .from("lodging_conditions")
            .select("lodging_id,label")
            .in("lodging_id", lodgingIds)
        : Promise.resolve({ data: [], error: null }),
      lodgingIds.length > 0
        ? client
            .from("lodging_photos")
            .select("id,lodging_id,storage_path")
            .in("lodging_id", lodgingIds)
        : Promise.resolve({ data: [], error: null }),
      client.from("profiles").select("id,full_name,phone,city,state,bio,role"),
    ]);

    if (conditionsResult.error) {
      setError(conditionsResult.error.message);
      setLoading(false);
      return;
    }

    if (photosResult.error) {
      setError(photosResult.error.message);
      setLoading(false);
      return;
    }

    if (profilesResult.error) {
      setError(profilesResult.error.message);
      setLoading(false);
      return;
    }

    const signedPhotos = await Promise.all(
      (photosResult.data ?? []).map(async (photo) => {
        const { data } = await client.storage
          .from("lodging-photos")
          .createSignedUrl(photo.storage_path, 60 * 20);

        return {
          ...photo,
          signed_url: data?.signedUrl,
        };
      }),
    );

    const conditionsByLodging = new Map<string, string[]>();
    for (const condition of conditionsResult.data ?? []) {
      const current = conditionsByLodging.get(condition.lodging_id) ?? [];
      current.push(condition.label);
      conditionsByLodging.set(condition.lodging_id, current);
    }

    const photosByLodging = new Map<string, LodgingPhoto[]>();
    for (const photo of signedPhotos) {
      const current = photosByLodging.get(photo.lodging_id) ?? [];
      current.push({
        id: photo.id,
        storage_path: photo.storage_path,
        signed_url: photo.signed_url,
      });
      photosByLodging.set(photo.lodging_id, current);
    }

    const profileRows = (profilesResult.data ?? []) as ProfileSummary[];
    const profilesById = new Map(profileRows.map((profile) => [profile.id, profile]));

    setLodgings(
      lodgingRows.map((lodging) => ({
        ...lodging,
        host: profilesById.get(lodging.host_id),
        conditions: conditionsByLodging.get(lodging.id) ?? [],
        photos: photosByLodging.get(lodging.id) ?? [],
      })),
    );
    setRequests(requestsResult.data ?? []);
    setUsers(profileRows);
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(id);
  }, [loadData]);

  async function updateLodgingStatus(id: string, status: "approved" | "rejected") {
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      return;
    }

    const { error: updateError } = await supabase
      .from("lodgings")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(status === "approved" ? "Hospedagem aprovada." : "Hospedagem rejeitada.");
    await loadData();
  }

  async function promoteUserToAdmin(user: ProfileSummary) {
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(`${user.full_name || "Usuário"} agora é moderador.`);
    await loadData();
  }

  function toggleLodgingDetails(id: string) {
    setExpandedLodgingId((current) => (current === id ? "" : id));
  }

  function toggleRequestDetails(id: string) {
    setExpandedRequestId((current) => (current === id ? "" : id));
  }

  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="admin" />
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10 lg:px-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
              Moderação
            </p>
            <h1 className="mt-5 text-3xl font-black md:text-5xl">
              Revisar pedidos e ofertas.
            </h1>
            <p className="mt-5 leading-8 text-[var(--muted)]">
              Área interna para acompanhar solicitações, ofertas e revisões
              antes de conectar uma família a um anfitrião.
            </p>
          </div>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 font-black text-[var(--brand-dark)]"
            onClick={loadData}
            type="button"
          >
            <RefreshCw aria-hidden size={18} />
            Atualizar
          </button>
        </div>

        <AuthGate message="Entre com uma conta autorizada para acessar a área de moderação.">
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-[var(--rose-dark)]">
                {lodgings.filter((item) => item.status === "pending").length}
              </p>
              <p className="mt-1 font-bold text-[var(--muted)]">ofertas pendentes</p>
            </div>
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-[var(--rose-dark)]">
                {requests.filter((item) => item.status === "pending").length}
              </p>
              <p className="mt-1 font-bold text-[var(--muted)]">pedidos pendentes</p>
            </div>
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-[var(--rose-dark)]">
                {lodgings.filter((item) => item.status === "approved").length}
              </p>
              <p className="mt-1 font-bold text-[var(--muted)]">hospedagens públicas</p>
            </div>
            <div className="rounded-[2rem] bg-white p-5 shadow-sm">
              <p className="text-3xl font-black text-[var(--rose-dark)]">
                {users.filter((item) => item.role === "admin").length}
              </p>
              <p className="mt-1 font-bold text-[var(--muted)]">moderadores</p>
            </div>
          </div>

          {message ? (
            <div className="mt-6 rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold text-[var(--rose-dark)]">
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mt-6 flex gap-3 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#be123c]">
              <ShieldAlert aria-hidden size={18} />
              {error}
            </div>
          ) : null}

          <section className="soft-shell mt-8 overflow-hidden rounded-[2rem]">
            <div className="border-b border-[var(--line)] bg-white/74 px-5 py-4">
              <h2 className="text-xl font-black">Ofertas de hospedagem</h2>
            </div>
            {loading ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">Carregando...</p>
            ) : lodgings.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhuma oferta cadastrada ainda.
              </p>
            ) : (
              lodgings.map((lodging) => (
                <article
                  className="border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0"
                  key={lodging.id}
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.55fr_0.9fr]">
                    <div>
                      <p className="flex items-center gap-2 text-base font-black">
                        <ClipboardCheck aria-hidden size={16} />
                        {lodging.title}
                      </p>
                      <p className="mt-1 text-[var(--muted)]">
                        {lodging.neighborhood}, {lodging.city} · {lodging.capacity} pessoa
                        {lodging.capacity > 1 ? "s" : ""}
                      </p>
                      <p className="mt-1 text-[var(--muted)]">
                        {lodging.bathroom} · {lodging.nearest_hospital || "Hospital não informado"}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 font-black text-[var(--brand-dark)]">
                        {statusLabels[lodging.status] ?? lodging.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        className={`${compactButton} border border-[var(--line)] bg-white text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]`}
                        onClick={() => toggleLodgingDetails(lodging.id)}
                        type="button"
                      >
                        <Eye aria-hidden size={15} />
                        {expandedLodgingId === lodging.id ? "Ocultar" : "Ver detalhes"}
                      </button>
                      <button
                        className={`${compactButton} bg-[var(--brand-dark)] text-white hover:bg-[var(--brand)]`}
                        disabled={lodging.status === "approved"}
                        onClick={() => updateLodgingStatus(lodging.id, "approved")}
                        type="button"
                      >
                        <Check aria-hidden size={15} />
                        Aprovar
                      </button>
                      <button
                        className={`${compactButton} border border-[var(--line)] bg-white text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]`}
                        disabled={lodging.status === "rejected"}
                        onClick={() => updateLodgingStatus(lodging.id, "rejected")}
                        type="button"
                      >
                        <X aria-hidden size={15} />
                        Rejeitar
                      </button>
                    </div>
                  </div>

                  {expandedLodgingId === lodging.id ? (
                    <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 lg:grid-cols-[1fr_1fr]">
                      <div className="grid gap-4">
                        <div>
                          <h3 className="font-black">Contato do anfitrião</h3>
                          <div className="mt-3 rounded-2xl bg-[var(--surface-soft)] p-4">
                            <p className="flex items-center gap-2 font-black">
                              <UserCircle aria-hidden size={18} />
                              {lodging.host?.full_name || "Nome não informado"}
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-[var(--muted)]">
                              <Phone aria-hidden size={16} />
                              {lodging.host?.phone || "Telefone não informado"}
                            </p>
                            <p className="mt-2 text-[var(--muted)]">
                              {lodging.host?.city
                                ? `${lodging.host.city}${lodging.host.state ? `, ${lodging.host.state}` : ""}`
                                : "Cidade do perfil não informada"}
                            </p>
                            {lodging.host?.bio ? (
                              <p className="mt-3 leading-6 text-[var(--muted)]">
                                {lodging.host.bio}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-black">Dados do espaço</h3>
                          <div className="mt-3 grid gap-2 rounded-2xl bg-[var(--surface-soft)] p-4 text-[var(--muted)]">
                            <p>
                              <strong className="text-[var(--foreground)]">Tipo:</strong>{" "}
                              {lodgingTypeLabels[lodging.type] ?? lodging.type}
                            </p>
                            <p>
                              <strong className="text-[var(--foreground)]">Endereço aproximado:</strong>{" "}
                              {lodging.approximate_address || "Não informado"}
                            </p>
                            <p>
                              <strong className="text-[var(--foreground)]">Hospital próximo:</strong>{" "}
                              {lodging.nearest_hospital || "Não informado"}
                            </p>
                            <p>
                              <strong className="text-[var(--foreground)]">Disponibilidade:</strong>{" "}
                              {lodging.availability || "Não informada"}
                            </p>
                            <p>
                              <strong className="text-[var(--foreground)]">Disponível agora:</strong>{" "}
                              {lodging.available_now ? "Sim" : "Não"}
                            </p>
                            <p>
                              <strong className="text-[var(--foreground)]">Acessibilidade:</strong>{" "}
                              {lodging.accessibility ? "Sim" : "Não"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <div>
                          <h3 className="font-black">Observações</h3>
                          <p className="mt-3 min-h-24 rounded-2xl bg-[var(--surface-soft)] p-4 leading-6 text-[var(--muted)]">
                            {lodging.description || "Nenhuma observação informada."}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-black">Condições</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {lodging.conditions.length > 0 ? (
                              lodging.conditions.map((condition) => (
                                <span
                                  className="rounded-full bg-[var(--surface-soft)] px-3 py-1 font-bold text-[var(--brand-dark)]"
                                  key={condition}
                                >
                                  {condition}
                                </span>
                              ))
                            ) : (
                              <span className="text-[var(--muted)]">
                                Nenhuma condição marcada.
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="flex items-center gap-2 font-black">
                            <Camera aria-hidden size={18} />
                            Fotos
                          </h3>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {lodging.photos.length > 0 ? (
                              lodging.photos.map((photo) =>
                                photo.signed_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    alt="Foto do espaço"
                                    className="aspect-[4/3] w-full rounded-2xl border border-[var(--line)] object-cover"
                                    key={photo.id}
                                    src={photo.signed_url}
                                  />
                                ) : (
                                  <div
                                    className="rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-[var(--muted)]"
                                    key={photo.id}
                                  >
                                    Foto sem URL disponível.
                                  </div>
                                ),
                              )
                            ) : (
                              <p className="text-[var(--muted)]">Nenhuma foto enviada.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </section>

          <section className="soft-shell mt-8 overflow-hidden rounded-[2rem]">
            <div className="border-b border-[var(--line)] bg-white/74 px-5 py-4">
              <h2 className="text-xl font-black">Pedidos de famílias</h2>
            </div>
            {loading ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">Carregando...</p>
            ) : requests.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhum pedido cadastrado ainda.
              </p>
            ) : (
              requests.map((request) => (
                <article
                  className="border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0"
                  key={request.id}
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr_0.7fr]">
                    <div>
                      <p className="font-black">{request.responsible_name}</p>
                      <p className="mt-1 text-[var(--muted)]">
                        {request.origin_city} {"->"} {request.hospital_name},{" "}
                        {request.hospital_city}
                      </p>
                    </div>
                    <p className="leading-6 text-[var(--muted)]">
                      {request.people_count} pessoa{request.people_count > 1 ? "s" : ""} por{" "}
                      {request.nights} noite{request.nights > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-2 font-black text-[var(--brand-dark)]">
                        {statusLabels[request.status] ?? request.status}
                      </span>
                      <button
                        className={`${compactButton} border border-[var(--line)] bg-white text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]`}
                        onClick={() => toggleRequestDetails(request.id)}
                        type="button"
                      >
                        <Eye aria-hidden size={15} />
                        {expandedRequestId === request.id ? "Ocultar" : "Ver detalhes"}
                      </button>
                    </div>
                  </div>

                  {expandedRequestId === request.id ? (
                    <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                        <h3 className="font-black">Contato e viagem</h3>
                        <p className="mt-3 flex items-center gap-2 text-[var(--muted)]">
                          <Phone aria-hidden size={16} />
                          {request.phone}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-[var(--muted)]">
                          <MapPin aria-hidden size={16} />
                          Chegada em {request.arrival_date}
                        </p>
                        <p className="mt-2 text-[var(--muted)]">
                          Hospedagem para: {request.guest_type}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-black">Observações</h3>
                        <p className="mt-3 min-h-24 rounded-2xl bg-[var(--surface-soft)] p-4 leading-6 text-[var(--muted)]">
                          {request.notes || "Nenhuma observação informada."}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </section>

          <section className="soft-shell mt-8 overflow-hidden rounded-[2rem]">
            <div className="border-b border-[var(--line)] bg-white/74 px-5 py-4">
              <h2 className="text-xl font-black">Usuários e moderadores</h2>
            </div>
            {loading ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">Carregando...</p>
            ) : users.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhum usuário encontrado.
              </p>
            ) : (
              users.map((user) => (
                <article
                  className="grid gap-4 border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0 lg:grid-cols-[1fr_0.45fr_auto]"
                  key={user.id}
                >
                  <div>
                    <p className="flex items-center gap-2 text-base font-black">
                      <UserCircle aria-hidden size={16} />
                      {user.full_name || "Nome não informado"}
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {user.phone || "Telefone não informado"}
                      {user.city ? ` · ${user.city}${user.state ? `, ${user.state}` : ""}` : ""}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 font-black text-[var(--brand-dark)]">
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      className={`${compactButton} bg-[var(--brand-dark)] text-white hover:bg-[var(--brand)]`}
                      disabled={user.role === "admin"}
                      onClick={() => promoteUserToAdmin(user)}
                      type="button"
                    >
                      <UserCog aria-hidden size={15} />
                      Tornar moderador
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </AuthGate>
      </section>
    </main>
  );
}
