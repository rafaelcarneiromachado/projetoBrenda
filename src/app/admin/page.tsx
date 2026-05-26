"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw, ShieldAlert } from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { SiteHeader } from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

type Lodging = {
  id: string;
  title: string;
  city: string;
  neighborhood: string;
  type: string;
  capacity: number;
  status: string;
  created_at: string;
};

type StayRequest = {
  id: string;
  responsible_name: string;
  origin_city: string;
  hospital_name: string;
  hospital_city: string;
  people_count: number;
  nights: number;
  status: string;
  created_at: string;
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

export default function AdminPage() {
  const [lodgings, setLodgings] = useState<Lodging[]>([]);
  const [requests, setRequests] = useState<StayRequest[]>([]);
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

    const [lodgingsResult, requestsResult] = await Promise.all([
      supabase
        .from("lodgings")
        .select("id,title,city,neighborhood,type,capacity,status,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("stay_requests")
        .select(
          "id,responsible_name,origin_city,hospital_name,hospital_city,people_count,nights,status,created_at",
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

    setLodgings(lodgingsResult.data ?? []);
    setRequests(requestsResult.data ?? []);
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
          <div className="mt-8 grid gap-4 md:grid-cols-3">
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
                  className="grid gap-4 border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0 lg:grid-cols-[1fr_0.7fr_0.7fr]"
                  key={lodging.id}
                >
                  <div>
                    <p className="flex items-center gap-2 text-base font-black">
                      <ClipboardCheck aria-hidden size={16} />
                      {lodging.title}
                    </p>
                    <p className="mt-1 text-[var(--muted)]">
                      {lodging.neighborhood}, {lodging.city} · {lodging.capacity} pessoa
                      {lodging.capacity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 font-black text-[var(--brand-dark)]">
                      {statusLabels[lodging.status] ?? lodging.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-full bg-[var(--brand-dark)] px-4 py-2 font-black text-white disabled:opacity-40"
                      disabled={lodging.status === "approved"}
                      onClick={() => updateLodgingStatus(lodging.id, "approved")}
                      type="button"
                    >
                      Aprovar
                    </button>
                    <button
                      className="rounded-full border border-[var(--brand-dark)] px-4 py-2 font-black disabled:opacity-40"
                      disabled={lodging.status === "rejected"}
                      onClick={() => updateLodgingStatus(lodging.id, "rejected")}
                      type="button"
                    >
                      Rejeitar
                    </button>
                  </div>
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
                  className="grid gap-4 border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0 lg:grid-cols-[1fr_0.7fr_0.5fr]"
                  key={request.id}
                >
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
                  <div>
                    <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 font-black text-[var(--brand-dark)]">
                      {statusLabels[request.status] ?? request.status}
                    </span>
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
