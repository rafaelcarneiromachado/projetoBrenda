"use client";

import Link from "next/link";
import {
  CheckCircle2,
  HeartHandshake,
  HomeIcon,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "./components/SiteHeader";
import { supabase } from "./lib/supabase";

type ImpactCounts = {
  available_lodgings: number;
  lodging_requests: number;
  registered_users: number;
};

const steps = [
  {
    icon: HeartHandshake,
    title: "Pedido acolhido",
    text: "A família informa hospital, período e quem precisa de um lugar para dormir.",
  },
  {
    icon: HomeIcon,
    title: "Espaço oferecido",
    text: "O anfitrião cadastra um quarto, sofá ou edícula com disponibilidade e regras da casa.",
  },
  {
    icon: ShieldCheck,
    title: "Conexão verificada",
    text: "A moderação revisa os dois lados antes de aproximar as pessoas.",
  },
];

const safeguards = [
  "Cadastro revisado antes de qualquer contato.",
  "Endereço completo protegido até a verificação.",
  "Dados pessoais reduzidos ao mínimo necessário.",
  "Rede pensada para parceria com hospitais e ONGs.",
];

export default function Home() {
  const [impactCounts, setImpactCounts] = useState<ImpactCounts>({
    available_lodgings: 0,
    lodging_requests: 0,
    registered_users: 0,
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    const client = supabase;

    async function loadImpactCounts() {
      const [countsResult, approvedLodgingsResult] = await Promise.all([
        client.rpc("public_impact_counts").maybeSingle(),
        client
          .from("lodgings")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
      ]);

      if (mounted && countsResult.data) {
        const counts = countsResult.data as ImpactCounts;
        setImpactCounts({
          available_lodgings:
            counts.available_lodgings ?? approvedLodgingsResult.count ?? 0,
          lodging_requests: counts.lodging_requests ?? 0,
          registered_users: counts.registered_users ?? 0,
        });
        return;
      }

      if (mounted && approvedLodgingsResult.count !== null) {
        setImpactCounts((current) => ({
          ...current,
          available_lodgings: approvedLodgingsResult.count ?? 0,
        }));
      }
    }

    loadImpactCounts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="home" />

      <section className="border-b border-[var(--line)] bg-white px-5 py-3 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--surface-soft)] px-5 py-3">
            <strong className="block text-2xl font-black text-[var(--rose-dark)]">
              {impactCounts.available_lodgings}
            </strong>
            <span className="text-sm font-black text-[var(--muted)]">
              hospedagens disponíveis
            </span>
          </div>
          <div className="rounded-2xl bg-[var(--surface-soft)] px-5 py-3">
            <strong className="block text-2xl font-black text-[var(--rose-dark)]">
              {impactCounts.lodging_requests}
            </strong>
            <span className="text-sm font-black text-[var(--muted)]">
              pedidos de hospedagem
            </span>
          </div>
          <div className="rounded-2xl bg-[var(--surface-soft)] px-5 py-3">
            <strong className="block text-2xl font-black text-[var(--rose-dark)]">
              {impactCounts.registered_users}
            </strong>
            <span className="text-sm font-black text-[var(--muted)]">
              usuários cadastrados
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 pb-6 pt-5 md:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
          <div className="lg:pr-6">
            <p className="mb-4 inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--rose-dark)] shadow-sm">
              acolhimento solidário familiar
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.03] text-[var(--foreground)] md:text-5xl">
              Um lugar seguro para descansar perto do hospital.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
              O Projeto Brenda conecta familiares de pessoas em tratamento ou
              acompanhamento hospitalar a anfitriões solidários verificados.
            </p>

            <div className="mt-7 rounded-[1.75rem] border border-[var(--line)] bg-white p-2 shadow-xl shadow-[#19101410]">
              <div className="grid gap-1 md:grid-cols-[1.2fr_0.95fr_0.95fr_auto]">
                <Link
                  className="flex min-h-16 items-center gap-3 rounded-[1.35rem] px-4 transition hover:bg-[var(--surface-soft)]"
                  href="/buscar"
                >
                  <MapPin aria-hidden className="shrink-0 text-[var(--rose-dark)]" />
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                      Onde
                    </span>
                    <span className="font-bold text-[var(--foreground)] md:whitespace-nowrap">
                      Cidade ou hospital
                    </span>
                  </span>
                </Link>
                <Link
                  className="flex min-h-16 items-center gap-3 rounded-[1.35rem] px-4 transition hover:bg-[var(--surface-soft)]"
                  href="/buscar"
                >
                  <Users aria-hidden className="shrink-0 text-[var(--rose-dark)]" />
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                      Quem
                    </span>
                    <span className="font-bold text-[var(--foreground)] md:whitespace-nowrap">
                      Acompanhantes
                    </span>
                  </span>
                </Link>
                <Link
                  className="flex min-h-16 items-center gap-3 rounded-[1.35rem] px-4 transition hover:bg-[var(--surface-soft)]"
                  href="/buscar"
                >
                  <HomeIcon aria-hidden className="shrink-0 text-[var(--rose-dark)]" />
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                      Espaço
                    </span>
                    <span className="font-bold text-[var(--foreground)] md:whitespace-nowrap">
                      Quarto ou sofá
                    </span>
                  </span>
                </Link>
                <Link
                  className="mr-1 inline-flex min-h-14 self-center items-center justify-center gap-2 rounded-[1.15rem] bg-[var(--brand-dark)] px-5 font-black text-white transition hover:bg-[var(--brand)]"
                  href="/buscar"
                >
                  <Search aria-hidden size={18} />
                  Buscar
                </Link>
              </div>
            </div>

          </div>

          <aside className="flex">
            <div className="flex min-h-full w-full flex-col justify-between rounded-[1.75rem] bg-[var(--brand-dark)] p-7 text-white shadow-xl shadow-[#19101418]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f7a7bd]">
                  princípio central
                </p>
                <p className="mt-4 text-2xl font-black leading-8">
                  Segurança antes de escala. Acolhimento antes de automação.
                </p>
                <p className="mt-5 leading-7 text-white/75">
                  Cada pedido e cada oferta passam por revisão humana antes de aproximar
                  família e anfitrião.
                </p>
              </div>
              <div className="mt-8 flex items-end justify-between gap-4">
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-[var(--brand-dark)] transition hover:bg-[#ffe8ef]"
                  href="/missao"
                >
                  Conhecer a missão
                </Link>
                <ShieldCheck aria-hidden className="text-[#f7a7bd]" size={54} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white px-6 py-8 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-5xl">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              Uma rede simples, humana e moderada.
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6 shadow-sm"
                  key={step.title}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-white shadow-md shadow-[#19101425]">
                    <Icon aria-hidden size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[var(--muted)]">
                    {step.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
              Cuidado operacional
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              A rede precisa ser simples, segura e acolhedora.
            </h2>
            <p className="mt-5 leading-8 text-[var(--muted)]">
              Cada pedido passa por revisão antes de aproximar família e
              anfitrião. O objetivo é facilitar o acolhimento sem abrir mão da
              responsabilidade.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-xl shadow-[#19101410]">
            <div className="grid gap-3">
              {safeguards.map((item) => (
                <div className="flex gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-4" key={item}>
                  <CheckCircle2
                    aria-hidden
                    className="mt-0.5 shrink-0 text-[var(--rose-dark)]"
                    size={20}
                  />
                  <p className="text-sm font-bold leading-6 text-[var(--foreground)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
