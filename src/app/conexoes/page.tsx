"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  HomeIcon,
  Mail,
  MessageCircle,
  Phone,
  UserCircle,
} from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { LodgingPhotoCarousel } from "../components/LodgingPhotoCarousel";
import { SiteHeader } from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

type StayRequest = {
  id: string;
  requester_id: string;
  responsible_name: string;
  phone: string;
  origin_city: string;
  hospital_name: string;
  hospital_city: string;
  arrival_date: string;
  nights: number;
  guest_type: string;
  people_count: number;
  notes: string | null;
  lodging_id: string | null;
  status: string;
};

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
  photos: string[];
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
};

type Connection = {
  request: StayRequest;
  lodging: Lodging | null;
  requester: Profile | null;
  host: Profile | null;
  role: "family" | "host";
};

const lodgingTypeLabels: Record<string, string> = {
  room: "Quarto",
  sofa: "Sofá",
  entire_home: "Casa Inteira",
  guest_house: "Edícula",
  mattress: "Colchão",
  other: "Outro espaço",
};

function getWhatsAppHref(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}`;
}

function ContactButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  if (!href) {
    return null;
  }

  return (
    <a
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[var(--brand)]"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {icon}
      {label}
    </a>
  );
}

export default function ConexoesPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadConnections() {
      if (!supabase) {
        setError("Supabase não está configurado neste ambiente.");
        setLoading(false);
        return;
      }

      const client = supabase;
      const {
        data: { user },
      } = await client.auth.getUser();

      if (!mounted || !user) {
        setLoading(false);
        return;
      }

      const { data: requests, error: requestsError } = await client
        .from("stay_requests")
        .select(
          "id,requester_id,responsible_name,phone,origin_city,hospital_name,hospital_city,arrival_date,nights,guest_type,people_count,notes,lodging_id,status",
        )
        .eq("status", "matched")
        .order("created_at", { ascending: false });

      if (!mounted) {
        return;
      }

      if (requestsError) {
        setError(requestsError.message);
        setLoading(false);
        return;
      }

      const requestRows = (requests ?? []) as StayRequest[];
      const lodgingIds = [
        ...new Set(requestRows.map((request) => request.lodging_id).filter(Boolean)),
      ] as string[];

      if (lodgingIds.length === 0) {
        setConnections([]);
        setLoading(false);
        return;
      }

      const [lodgingsResult, photosResult] = await Promise.all([
        client
          .from("lodgings")
          .select(
            "id,host_id,title,description,city,neighborhood,approximate_address,nearest_hospital,type,capacity,bathroom,availability",
          )
          .in("id", lodgingIds),
        client
          .from("lodging_photos")
          .select("lodging_id,storage_path")
          .in("lodging_id", lodgingIds)
          .order("created_at", { ascending: true }),
      ]);

      if (lodgingsResult.error) {
        setError(lodgingsResult.error.message);
        setLoading(false);
        return;
      }

      const profileIds = [
        ...new Set([
          ...requestRows.map((request) => request.requester_id),
          ...((lodgingsResult.data ?? []) as Lodging[]).map((lodging) => lodging.host_id),
        ]),
      ];

      const { data: profiles, error: profilesError } = await client
        .from("profiles")
        .select("id,email,full_name,phone,city,state,bio")
        .in("id", profileIds);

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
            lodging_id: photo.lodging_id as string,
            signed_url: data?.signedUrl ?? "",
          };
        }),
      );

      const photosByLodging = new Map<string, string[]>();
      for (const photo of signedPhotos) {
        const current = photosByLodging.get(photo.lodging_id) ?? [];
        if (photo.signed_url) {
          current.push(photo.signed_url);
        }
        photosByLodging.set(photo.lodging_id, current);
      }

      const lodgingsById = new Map(
        ((lodgingsResult.data ?? []) as Lodging[]).map((lodging) => [
          lodging.id,
          {
            ...lodging,
            photos: photosByLodging.get(lodging.id) ?? [],
          },
        ]),
      );
      const profilesById = new Map(
        ((profiles ?? []) as Profile[]).map((profile) => [profile.id, profile]),
      );

      setConnections(
        requestRows.map((request) => {
          const lodging = request.lodging_id
            ? lodgingsById.get(request.lodging_id) ?? null
            : null;

          return {
            request,
            lodging,
            requester: profilesById.get(request.requester_id) ?? null,
            host: lodging ? profilesById.get(lodging.host_id) ?? null : null,
            role: request.requester_id === user.id ? "family" : "host",
          };
        }),
      );
      setLoading(false);
    }

    window.setTimeout(loadConnections, 0);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="conexoes" />
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10 lg:px-12">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
            Minhas Conexões
          </p>
          <h1 className="mt-5 text-3xl font-black md:text-4xl">
            Hospedagens aprovadas para combinar diretamente.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Quando a moderação aprova uma conexão, família e anfitrião passam a
            ver os dados necessários para conversar, confirmar detalhes e seguir
            com o acolhimento.
          </p>
        </div>

        <div className="mt-8">
          <AuthGate message="Entre para ver suas conexões aprovadas.">
            {loading ? (
              <div className="soft-shell rounded-[2rem] p-7">
                <p className="font-black">Carregando conexões...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#be123c]">
                {error}
              </div>
            ) : connections.length === 0 ? (
              <div className="soft-shell rounded-[2rem] p-7">
                <h2 className="text-2xl font-black">Nenhuma conexão aprovada ainda.</h2>
                <p className="mt-3 leading-7 text-[var(--muted)]">
                  Assim que a moderação aprovar uma solicitação, os detalhes vão
                  aparecer aqui automaticamente.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {connections.map(({ host, lodging, request, requester, role }) => {
                  const otherSide = role === "family" ? host : requester;
                  const otherLabel = role === "family" ? "Anfitrião" : "Família";
                  const title = lodging?.title ?? "Hospedagem solicitada";

                  return (
                    <article
                      className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-xl shadow-[#19101410]"
                      key={request.id}
                    >
                      {lodging?.photos.length ? (
                        <LodgingPhotoCarousel
                          className="h-64 w-full md:h-80"
                          images={lodging.photos}
                          title={title}
                        />
                      ) : null}
                      <div className="grid gap-6 p-5 md:p-7">
                        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                              Conexão Aprovada
                            </p>
                            <h2 className="mt-2 text-2xl font-black">{title}</h2>
                            <p className="mt-3 leading-7 text-[var(--muted)]">
                              {role === "family"
                                ? "Sua solicitação foi aprovada. Converse diretamente com o anfitrião para combinar chegada, horários e detalhes finais."
                                : "Você recebeu uma solicitação aprovada. Converse diretamente com a família para combinar chegada, horários e detalhes finais."}
                            </p>
                          </div>
                          <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-4 py-2 text-sm font-black text-[var(--rose-dark)]">
                            Você é {role === "family" ? "Família" : "Anfitrião"}
                          </span>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <section className="rounded-[1.5rem] bg-[var(--surface-soft)] p-5">
                            <h3 className="flex items-center gap-2 text-lg font-black">
                              <UserCircle aria-hidden size={20} />
                              Contato Do {otherLabel}
                            </h3>
                            <div className="mt-4 grid gap-2 text-[var(--muted)]">
                              <p className="font-black text-[var(--foreground)]">
                                {role === "family"
                                  ? host?.full_name || "Anfitrião"
                                  : request.responsible_name || requester?.full_name || "Família"}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone aria-hidden size={16} />
                                {role === "family"
                                  ? host?.phone || "Telefone não informado"
                                  : request.phone || requester?.phone || "Telefone não informado"}
                              </p>
                              <p className="flex items-center gap-2">
                                <Mail aria-hidden size={16} />
                                {otherSide?.email || "E-mail não informado"}
                              </p>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <ContactButton
                                href={getWhatsAppHref(
                                  role === "family" ? host?.phone : request.phone,
                                )}
                                icon={<MessageCircle aria-hidden size={16} />}
                                label={`WhatsApp ${otherLabel}`}
                              />
                              <ContactButton
                                href={otherSide?.email ? `mailto:${otherSide.email}` : ""}
                                icon={<Mail aria-hidden size={16} />}
                                label={`E-Mail ${otherLabel}`}
                              />
                            </div>
                          </section>

                          <section className="rounded-[1.5rem] bg-[var(--surface-soft)] p-5">
                            <h3 className="flex items-center gap-2 text-lg font-black">
                              <CalendarDays aria-hidden size={20} />
                              Pedido Aprovado
                            </h3>
                            <div className="mt-4 grid gap-2 text-[var(--muted)]">
                              <p>
                                <strong className="text-[var(--foreground)]">Chegada:</strong>{" "}
                                {request.arrival_date}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Período:</strong>{" "}
                                {request.nights} noite{request.nights > 1 ? "s" : ""}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Pessoas:</strong>{" "}
                                {request.people_count} pessoa
                                {request.people_count > 1 ? "s" : ""}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Hospital:</strong>{" "}
                                {request.hospital_name}, {request.hospital_city}
                              </p>
                            </div>
                          </section>
                        </div>

                        {lodging ? (
                          <section className="rounded-[1.5rem] border border-[var(--line)] bg-white p-5">
                            <h3 className="flex items-center gap-2 text-lg font-black">
                              <HomeIcon aria-hidden size={20} />
                              Detalhes Da Hospedagem
                            </h3>
                            <div className="mt-4 grid gap-2 text-[var(--muted)] md:grid-cols-2">
                              <p>
                                <strong className="text-[var(--foreground)]">Tipo:</strong>{" "}
                                {lodgingTypeLabels[lodging.type] ?? lodging.type}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Capacidade:</strong>{" "}
                                {lodging.capacity} pessoa{lodging.capacity > 1 ? "s" : ""}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Bairro:</strong>{" "}
                                {lodging.neighborhood}, {lodging.city}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Endereço:</strong>{" "}
                                {lodging.approximate_address || "Não informado"}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Hospital próximo:</strong>{" "}
                                {lodging.nearest_hospital || "Não informado"}
                              </p>
                              <p>
                                <strong className="text-[var(--foreground)]">Disponibilidade:</strong>{" "}
                                {lodging.availability || "Sob consulta"}
                              </p>
                            </div>
                            {lodging.description ? (
                              <p className="mt-4 leading-7 text-[var(--muted)]">
                                {lodging.description}
                              </p>
                            ) : null}
                          </section>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </AuthGate>
        </div>
      </section>
    </main>
  );
}
