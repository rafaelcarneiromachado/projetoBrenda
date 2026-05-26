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
  UserX,
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
  lodging_id: string | null;
  status: string;
  created_at: string;
  requester?: ProfileSummary;
};

type ProfileSummary = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  role: "family" | "host" | "admin";
  account_status: "active" | "blocked";
};

type LodgingPhoto = {
  id: string;
  storage_path: string;
  signed_url?: string;
};

type ModerationFilter = "pending" | "approved" | "all";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  in_review: "Em revisão",
  approved: "Aprovada",
  rejected: "Rejeitada",
  suspended: "Suspensa",
  matched: "Conexão Aprovada",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const lodgingTypeLabels: Record<string, string> = {
  room: "Quarto",
  sofa: "Sofá",
  entire_home: "Casa Inteira",
  guest_house: "Edícula",
  mattress: "Colchão",
  other: "Outro espaço",
};

const roleLabels: Record<ProfileSummary["role"], string> = {
  family: "Família",
  host: "Anfitrião",
  admin: "Moderador",
};

const accountStatusLabels: Record<ProfileSummary["account_status"], string> = {
  active: "Ativa",
  blocked: "Bloqueada",
};

const compactButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-black leading-none transition disabled:opacity-40";

const secondaryActionButton =
  `${compactButton} border border-transparent bg-white text-[var(--brand-dark)] shadow-sm hover:bg-[var(--surface-soft)]`;

const primaryActionButton =
  `${compactButton} bg-[var(--brand-dark)] text-white shadow-sm hover:bg-[var(--brand)]`;

const moderationFilters: Array<{ label: string; value: ModerationFilter }> = [
  { label: "Pendentes", value: "pending" },
  { label: "Aprovadas", value: "approved" },
  { label: "Todas", value: "all" },
];

function filterButtonClass(isActive: boolean) {
  return `inline-flex h-7 items-center justify-center gap-1 rounded-full px-2 text-[10px] font-medium leading-none transition disabled:opacity-40 ${
    isActive
      ? "bg-[var(--brand-dark)] text-white shadow-sm"
      : "border border-transparent bg-white text-[var(--brand-dark)] shadow-sm hover:bg-[var(--surface-soft)]"
  }`;
}

export default function AdminPage() {
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [requests, setRequests] = useState<StayRequest[]>([]);
  const [users, setUsers] = useState<ProfileSummary[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [lodgingFilter, setLodgingFilter] = useState<ModerationFilter>("pending");
  const [requestFilter, setRequestFilter] = useState<ModerationFilter>("pending");
  const [currentUserId, setCurrentUserId] = useState("");
  const [accessStatus, setAccessStatus] = useState<"checking" | "allowed" | "denied">(
    "checking",
  );
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
    const authResult = await client.auth.getUser();
    const currentUser = authResult.data.user;
    setCurrentUserId(currentUser?.id ?? "");

    if (!currentUser) {
      setAccessStatus("denied");
      setLoading(false);
      return;
    }

    const { data: currentProfile, error: currentProfileError } = await client
      .from("profiles")
      .select("role,account_status")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (currentProfileError) {
      setError(currentProfileError.message);
      setAccessStatus("denied");
      setLoading(false);
      return;
    }

    if (
      currentProfile?.role !== "admin" ||
      currentProfile.account_status === "blocked"
    ) {
      setAccessStatus("denied");
      setLoading(false);
      return;
    }

    setAccessStatus("allowed");

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
          "id,requester_id,responsible_name,phone,origin_city,hospital_name,hospital_city,arrival_date,people_count,nights,guest_type,notes,lodging_id,status,created_at",
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
      client
        .from("profiles")
        .select("id,email,full_name,phone,city,state,bio,role,account_status"),
    ]);

    let profilesData = profilesResult.data ?? [];
    let profilesError = profilesResult.error;

    if (
      profilesError &&
      (profilesError.message.includes("profiles.email") ||
        profilesError.message.includes("profiles.account_status"))
    ) {
      const fallbackProfilesResult = await client
        .from("profiles")
        .select("id,full_name,phone,city,state,bio,role");

      profilesData = (fallbackProfilesResult.data ?? []).map((profile) => ({
        ...profile,
        email: null,
        account_status: "active",
      }));
      profilesError = fallbackProfilesResult.error;
    } else {
      profilesData = profilesData.map((profile) => ({
        ...profile,
        account_status: profile.account_status ?? "active",
      }));
    }

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

    if (profilesError) {
      setError(profilesError.message);
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

    const profileRows = profilesData as ProfileSummary[];
    const profilesById = new Map(profileRows.map((profile) => [profile.id, profile]));

    setLodgings(
      lodgingRows.map((lodging) => ({
        ...lodging,
        host: profilesById.get(lodging.host_id),
        conditions: conditionsByLodging.get(lodging.id) ?? [],
        photos: photosByLodging.get(lodging.id) ?? [],
      })),
    );
    setRequests(
      (requestsResult.data ?? []).map((request) => ({
        ...request,
        requester: profilesById.get(request.requester_id),
      })),
    );
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

  async function updateRequestStatus(id: string, status: "matched" | "cancelled") {
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      return;
    }

    const { error: updateError } = await supabase
      .from("stay_requests")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(
      status === "matched"
        ? "Conexão aprovada. A equipe já pode aproximar solicitante e anfitrião."
        : "Pedido cancelado.",
    );
    await loadData();
  }

  async function promoteUserToAdmin(user: ProfileSummary) {
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      return;
    }

    const { error: rpcError } = await supabase.rpc("admin_promote_user", {
      target_user_id: user.id,
    });

    const updateError =
      rpcError &&
      (rpcError.message.includes("admin_promote_user") ||
        rpcError.message.includes("Could not find the function"))
        ? (
            await supabase
              .from("profiles")
              .update({ role: "admin" })
              .eq("id", user.id)
          ).error
        : rpcError;

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(`${user.full_name || "Usuário"} agora é moderador.`);
    await loadData();
  }

  async function updateUserAccountStatus(
    user: ProfileSummary,
    accountStatus: ProfileSummary["account_status"],
  ) {
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase não está configurado neste ambiente.");
      return;
    }

    if (user.id === currentUserId) {
      setError("Você não pode bloquear a própria conta administrativa.");
      return;
    }

    const { error: rpcError } = await supabase.rpc("admin_set_account_status", {
      target_user_id: user.id,
      next_status: accountStatus,
    });

    const updateError =
      rpcError &&
      (rpcError.message.includes("admin_set_account_status") ||
        rpcError.message.includes("Could not find the function"))
        ? (
            await supabase
              .from("profiles")
              .update({ account_status: accountStatus })
              .eq("id", user.id)
          ).error
        : rpcError;

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(
      accountStatus === "blocked"
        ? `${user.full_name || "Usuário"} foi bloqueado.`
        : `${user.full_name || "Usuário"} foi desbloqueado.`,
    );
    await loadData();
  }

  function toggleLodgingDetails(id: string) {
    setExpandedLodgingId((current) => (current === id ? "" : id));
  }

  function toggleRequestDetails(id: string) {
    setExpandedRequestId((current) => (current === id ? "" : id));
  }

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = userSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return [user.full_name, user.phone, user.email]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedSearch));
  });

  const filteredLodgings = lodgings.filter((lodging) => {
    if (lodgingFilter === "all") {
      return true;
    }

    return lodging.status === lodgingFilter;
  });

  const filteredRequests = requests.filter((request) => {
    if (requestFilter === "all") {
      return true;
    }

    return requestFilter === "approved"
      ? request.status === "matched"
      : request.status === "pending";
  });

  function getLodgingFilterCount(filter: ModerationFilter) {
    if (filter === "all") {
      return lodgings.length;
    }

    return lodgings.filter((lodging) => lodging.status === filter).length;
  }

  function getRequestFilterCount(filter: ModerationFilter) {
    if (filter === "all") {
      return requests.length;
    }

    return requests.filter((request) =>
      filter === "approved" ? request.status === "matched" : request.status === "pending",
    ).length;
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
            <h1 className="mt-5 text-3xl font-black md:text-4xl">
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
          {accessStatus === "checking" ? (
            <div className="soft-shell mt-8 rounded-[2rem] p-7">
              <p className="font-black">Verificando permissão de moderação...</p>
            </div>
          ) : null}

          {accessStatus === "denied" ? (
            <div className="soft-shell mt-8 rounded-[2rem] p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-white">
                <ShieldAlert aria-hidden size={22} />
              </div>
              <h2 className="mt-5 text-2xl font-black">Acesso restrito</h2>
              <p className="mt-3 leading-7 text-[var(--muted)]">
                Esta área é exclusiva para moderadores do Projeto Brenda.
              </p>
            </div>
          ) : null}

          {accessStatus === "allowed" ? (
            <>
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
            <div className="grid gap-4 border-b border-[var(--line)] bg-white/74 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <h2 className="text-xl font-black">Ofertas De Hospedagem</h2>
              <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[var(--line)] bg-[#fff9fb] p-1">
                {moderationFilters.map((filter) => (
                  <button
                    className={filterButtonClass(lodgingFilter === filter.value)}
                    key={filter.value}
                    onClick={() => setLodgingFilter(filter.value)}
                    type="button"
                  >
                    {filter.label}
                    <span className="opacity-70">{getLodgingFilterCount(filter.value)}</span>
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">Carregando...</p>
            ) : lodgings.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhuma oferta cadastrada ainda.
              </p>
            ) : filteredLodgings.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhuma oferta encontrada para este filtro.
              </p>
            ) : (
              filteredLodgings.map((lodging) => (
                <article
                  className="border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0"
                  key={lodging.id}
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px_auto] lg:items-center">
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
                    <div className="flex items-center lg:justify-center">
                      <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 font-black text-[var(--brand-dark)]">
                        {statusLabels[lodging.status] ?? lodging.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[var(--line)] bg-[#fff9fb] p-1 lg:justify-end">
                      <button
                        className={secondaryActionButton}
                        onClick={() => toggleLodgingDetails(lodging.id)}
                        type="button"
                      >
                        <Eye aria-hidden size={15} />
                        {expandedLodgingId === lodging.id ? "Ocultar" : "Ver detalhes"}
                      </button>
                      <button
                        className={primaryActionButton}
                        disabled={lodging.status === "approved"}
                        onClick={() => updateLodgingStatus(lodging.id, "approved")}
                        type="button"
                      >
                        <Check aria-hidden size={15} />
                        Aprovar
                      </button>
                      <button
                        className={secondaryActionButton}
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
            <div className="grid gap-4 border-b border-[var(--line)] bg-white/74 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <h2 className="text-xl font-black">Pedidos De Famílias</h2>
              <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[var(--line)] bg-[#fff9fb] p-1">
                {moderationFilters.map((filter) => (
                  <button
                    className={filterButtonClass(requestFilter === filter.value)}
                    key={filter.value}
                    onClick={() => setRequestFilter(filter.value)}
                    type="button"
                  >
                    {filter.label}
                    <span className="opacity-70">{getRequestFilterCount(filter.value)}</span>
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">Carregando...</p>
            ) : requests.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhum pedido cadastrado ainda.
              </p>
            ) : filteredRequests.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhum pedido encontrado para este filtro.
              </p>
            ) : (
              filteredRequests.map((request) => {
                const linkedLodging = lodgings.find(
                  (lodging) => lodging.id === request.lodging_id,
                );

                return (
                <article
                  className="border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0"
                  key={request.id}
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_0.7fr_auto] lg:items-center">
                    <div>
                      <p className="font-black">{request.responsible_name}</p>
                      <p className="mt-1 text-[var(--muted)]">
                        {request.origin_city} {"->"} {request.hospital_name},{" "}
                        {request.hospital_city}
                      </p>
                      {linkedLodging ? (
                        <p className="mt-1 font-bold text-[var(--rose-dark)]">
                          Pedido para: {linkedLodging.title}
                        </p>
                      ) : null}
                    </div>
                    <p className="leading-6 text-[var(--muted)]">
                      {request.people_count} pessoa{request.people_count > 1 ? "s" : ""} por{" "}
                      {request.nights} noite{request.nights > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-[var(--line)] bg-[#fff9fb] p-1 lg:justify-end">
                      <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-2 font-black text-[var(--brand-dark)]">
                        {statusLabels[request.status] ?? request.status}
                      </span>
                      <button
                        className={secondaryActionButton}
                        onClick={() => toggleRequestDetails(request.id)}
                        type="button"
                      >
                        <Eye aria-hidden size={15} />
                        {expandedRequestId === request.id ? "Ocultar" : "Ver detalhes"}
                      </button>
                      <button
                        className={primaryActionButton}
                        disabled={request.status === "matched"}
                        onClick={() => updateRequestStatus(request.id, "matched")}
                        type="button"
                      >
                        <Check aria-hidden size={15} />
                        Aprovar
                      </button>
                      <button
                        className={secondaryActionButton}
                        disabled={request.status === "cancelled"}
                        onClick={() => updateRequestStatus(request.id, "cancelled")}
                        type="button"
                      >
                        <X aria-hidden size={15} />
                        Rejeitar
                      </button>
                    </div>
                  </div>

                  {expandedRequestId === request.id ? (
                    <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 lg:grid-cols-2">
                      <div>
                        <h3 className="font-black">Detalhes Do Solicitante</h3>
                        <div className="mt-3 grid gap-3 rounded-2xl bg-[var(--surface-soft)] p-4 text-[var(--muted)]">
                          <p className="flex items-center gap-2 font-black text-[var(--foreground)]">
                            <UserCircle aria-hidden size={18} />
                            {request.responsible_name || "Nome não informado"}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone aria-hidden size={16} />
                            {request.phone || "Telefone não informado"}
                          </p>
                          <p>
                            <strong className="text-[var(--foreground)]">E-mail:</strong>{" "}
                            {request.requester?.email || "E-mail não informado"}
                          </p>
                          <p>
                            <strong className="text-[var(--foreground)]">Cidade de origem:</strong>{" "}
                            {request.origin_city || "Não informada"}
                          </p>
                          <p>
                            <strong className="text-[var(--foreground)]">Hospital:</strong>{" "}
                            {request.hospital_name}, {request.hospital_city}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin aria-hidden size={16} />
                            Chegada em {request.arrival_date}
                          </p>
                          <p>
                            <strong className="text-[var(--foreground)]">Período:</strong>{" "}
                            {request.nights} noite{request.nights > 1 ? "s" : ""}
                          </p>
                          <p>
                            <strong className="text-[var(--foreground)]">Pessoas:</strong>{" "}
                            {request.people_count} pessoa{request.people_count > 1 ? "s" : ""}
                          </p>
                          <p>
                            <strong className="text-[var(--foreground)]">Hospedagem para:</strong>{" "}
                            {request.guest_type}
                          </p>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-black">Observações</h4>
                          <p className="mt-3 min-h-24 rounded-2xl bg-[var(--surface-soft)] p-4 leading-6 text-[var(--muted)]">
                            {request.notes || "Nenhuma observação informada."}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-black">Detalhes Da Hospedagem Solicitada</h3>
                        {linkedLodging ? (
                          <div className="mt-3 grid gap-4">
                            <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-lg font-black text-[var(--foreground)]">
                                    {linkedLodging.title}
                                  </p>
                                  <p className="mt-1 text-[var(--muted)]">
                                    {linkedLodging.neighborhood}, {linkedLodging.city}
                                  </p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 font-black text-[var(--brand-dark)]">
                                  {statusLabels[linkedLodging.status] ?? linkedLodging.status}
                                </span>
                              </div>
                              <div className="mt-4 grid gap-2 text-[var(--muted)]">
                                <p>
                                  <strong className="text-[var(--foreground)]">Anfitrião:</strong>{" "}
                                  {linkedLodging.host?.full_name || "Nome não informado"}
                                </p>
                                <p>
                                  <strong className="text-[var(--foreground)]">Telefone:</strong>{" "}
                                  {linkedLodging.host?.phone || "Telefone não informado"}
                                </p>
                                <p>
                                  <strong className="text-[var(--foreground)]">Tipo:</strong>{" "}
                                  {lodgingTypeLabels[linkedLodging.type] ?? linkedLodging.type}
                                </p>
                                <p>
                                  <strong className="text-[var(--foreground)]">Capacidade:</strong>{" "}
                                  {linkedLodging.capacity} pessoa
                                  {linkedLodging.capacity > 1 ? "s" : ""}
                                </p>
                                <p>
                                  <strong className="text-[var(--foreground)]">Banheiro:</strong>{" "}
                                  {linkedLodging.bathroom}
                                </p>
                                <p>
                                  <strong className="text-[var(--foreground)]">Endereço aproximado:</strong>{" "}
                                  {linkedLodging.approximate_address || "Não informado"}
                                </p>
                                <p>
                                  <strong className="text-[var(--foreground)]">Hospital próximo:</strong>{" "}
                                  {linkedLodging.nearest_hospital || "Não informado"}
                                </p>
                                <p>
                                  <strong className="text-[var(--foreground)]">Disponibilidade:</strong>{" "}
                                  {linkedLodging.availability || "Não informada"}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-black">Fotos</h4>
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {linkedLodging.photos.length > 0 ? (
                                  linkedLodging.photos.map((photo) =>
                                    photo.signed_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        alt="Foto da hospedagem solicitada"
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
                        ) : (
                          <div className="mt-3 rounded-2xl bg-[var(--surface-soft)] p-4 text-[var(--muted)]">
                            Este pedido não está vinculado a uma hospedagem específica.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </article>
                );
              })
            )}
          </section>

          <section className="soft-shell mt-8 overflow-hidden rounded-[2rem]">
            <div className="grid gap-4 border-b border-[var(--line)] bg-white/74 px-5 py-4 lg:grid-cols-[1fr_360px] lg:items-center">
              <div>
                <h2 className="text-xl font-black">Usuários e moderadores</h2>
                <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                  Busque por nome, telefone ou e-mail antes de promover alguém.
                </p>
              </div>
              <label className="block">
                <span className="sr-only">Buscar usuário</span>
                <input
                  className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[#f7a7bd]/35"
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Buscar usuário"
                  value={userSearch}
                />
              </label>
            </div>
            {loading ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">Carregando...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="px-5 py-5 font-bold text-[var(--muted)]">
                Nenhum usuário encontrado para essa busca.
              </p>
            ) : (
              filteredUsers.map((user) => (
                <article
                  className="grid gap-4 border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center"
                  key={user.id}
                >
                  <div>
                    <p className="flex items-center gap-2 text-base font-black">
                      <UserCircle aria-hidden size={16} />
                      {user.full_name || "Nome não informado"}
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {user.email || "E-mail não informado"}
                      {" · "}
                      {user.phone || "Telefone não informado"}
                      {user.city ? ` · ${user.city}${user.state ? `, ${user.state}` : ""}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-center">
                    <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 font-black text-[var(--brand-dark)]">
                      {roleLabels[user.role] ?? user.role}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 font-black ${
                        user.account_status === "blocked"
                          ? "bg-[#ffe4e6] text-[#be123c]"
                          : "bg-white text-[var(--muted)]"
                      }`}
                    >
                      {accountStatusLabels[user.account_status] ?? user.account_status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {user.role === "admin" || user.id === currentUserId ? (
                      <span className="inline-flex h-9 items-center rounded-full bg-white px-3 text-sm font-black text-[var(--muted)] shadow-sm">
                        {user.role === "admin" ? "Já é moderador" : "Conta atual"}
                      </span>
                    ) : (
                      <button
                        className={primaryActionButton}
                        onClick={() => promoteUserToAdmin(user)}
                        type="button"
                      >
                        <UserCog aria-hidden size={15} />
                        Tornar moderador
                      </button>
                    )}
                    {user.id === currentUserId ? null : user.account_status === "blocked" ? (
                      <button
                        className={secondaryActionButton}
                        onClick={() => updateUserAccountStatus(user, "active")}
                        type="button"
                      >
                        <Check aria-hidden size={15} />
                        Desbloquear
                      </button>
                    ) : (
                      <button
                        className={secondaryActionButton}
                        onClick={() => updateUserAccountStatus(user, "blocked")}
                        type="button"
                      >
                        <UserX aria-hidden size={15} />
                        Bloquear
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>
            </>
          ) : null}
        </AuthGate>
      </section>
    </main>
  );
}
