"use client";

import Link from "next/link";
import { Filter, List, LocateFixed, Map, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LodgingPhotoCarousel } from "../components/LodgingPhotoCarousel";
import { ProximityMap } from "../components/ProximityMap";
import { SiteHeader } from "../components/SiteHeader";
import { Stay, stays, StayType } from "../data/stays";
import { loadApprovedStays } from "../lib/publicLodgings";
import { supabase } from "../lib/supabase";

const stayTypes: Array<StayType | "Todos"> = [
  "Todos",
  "Quarto",
  "Sofá",
  "Casa inteira",
  "Edícula",
];

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<StayType | "Todos">("Todos");
  const [capacity, setCapacity] = useState("1");
  const [onlyTonight, setOnlyTonight] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [availableStays, setAvailableStays] = useState<Stay[]>(stays);
  const [source, setSource] = useState<"example" | "supabase">("example");

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    const client = supabase;

    async function loadLodgings() {
      const approvedStays = await loadApprovedStays(client);

      if (!mounted || approvedStays.length === 0) {
        return;
      }

      setAvailableStays(approvedStays);
      setSource("supabase");
    }

    loadLodgings();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return availableStays.filter((stay) => {
      const matchesQuery = `${stay.title} ${stay.neighborhood} ${stay.city}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesType = type === "Todos" || stay.type === type;
      const matchesCapacity = stay.capacity >= Number(capacity);
      const matchesTonight = !onlyTonight || stay.availableTonight;

      return matchesQuery && matchesType && matchesCapacity && matchesTonight;
    });
  }, [availableStays, capacity, onlyTonight, query, type]);

  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="buscar" />
      <section className="mx-auto max-w-6xl px-6 py-8 md:px-10 lg:px-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
              buscar acolhimento
            </p>
            <h1 className="mt-4 text-3xl font-black md:text-5xl">
              Encontre uma hospedagem solidária perto do hospital.
            </h1>
          </div>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 font-black text-[var(--brand-dark)] shadow-sm transition hover:bg-[var(--surface-soft)]"
            type="button"
          >
            <LocateFixed aria-hidden size={18} />
            Usar minha localização
          </button>
        </div>

        <div className="soft-shell mt-8 rounded-[2rem] p-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.7fr_auto]">
            <label className="block">
              <span className="text-sm font-black">Destino ou hospital</span>
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[#f7a7bd]/45"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cidade, bairro ou hospital"
                value={query}
              />
            </label>

            <label className="block">
              <span className="text-sm font-black">Tipo de espaço</span>
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[#f7a7bd]/45"
                onChange={(event) => setType(event.target.value as StayType | "Todos")}
                value={type}
              >
                {stayTypes.map((stayType) => (
                  <option key={stayType}>{stayType}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-black">Pessoas</span>
              <select
                className="mt-2 min-h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[#f7a7bd]/45"
                onChange={(event) => setCapacity(event.target.value)}
                value={capacity}
              >
                <option value="1">1 pessoa</option>
                <option value="2">2 pessoas</option>
                <option value="3">3 pessoas</option>
              </select>
            </label>

            <button
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-5 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)] lg:mt-auto"
              type="button"
            >
              <Filter aria-hidden size={18} />
              Buscar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold">
              <input
                checked={onlyTonight}
                onChange={(event) => setOnlyTonight(event.target.checked)}
                type="checkbox"
              />
              Disponível hoje
            </label>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[var(--brand-dark)] shadow-sm"
              onClick={() =>
                setViewMode((current) => (current === "list" ? "map" : "list"))
              }
              type="button"
            >
              {viewMode === "map" ? (
                <List aria-hidden size={18} />
              ) : (
                <Map aria-hidden size={18} />
              )}
              {viewMode === "map" ? "Ver lista" : "Ver mapa"}
            </button>
          </div>
        </div>

        <div
          className={`mt-8 grid gap-6 ${
            viewMode === "map" ? "lg:grid-cols-[0.78fr_1.22fr]" : "lg:grid-cols-[1fr_0.82fr]"
          }`}
        >
          <section className={`grid gap-4 ${viewMode === "map" ? "lg:order-2" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black">{filtered.length} hospedagens encontradas</p>
                {source === "example" ? (
                  <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                    Exemplos visuais até as primeiras ofertas serem aprovadas.
                  </p>
                ) : null}
              </div>
              <p className="flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                <SlidersHorizontal aria-hidden size={16} />
                Ordenadas por proximidade
              </p>
            </div>

            {filtered.map((stay) => (
              <article
                className={`grid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-sm ${
                  viewMode === "map" ? "" : "md:grid-cols-[220px_1fr]"
                }`}
                key={stay.id}
              >
                <LodgingPhotoCarousel
                  className={`h-56 w-full ${
                    viewMode === "map" ? "" : "md:h-full"
                  }`}
                  images={stay.images ?? [stay.image]}
                  title={stay.title}
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                        {stay.type}
                      </p>
                      <h2 className="mt-1 text-xl font-black">{stay.title}</h2>
                    </div>
                    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-sm font-black text-[var(--rose-dark)]">
                      {stay.distanceKm.toFixed(1)} km
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {stay.neighborhood}, {stay.city} · {stay.capacity} pessoa
                    {stay.capacity > 1 ? "s" : ""} · banheiro {stay.bathroom.toLowerCase()}
                  </p>
                  <p className="mt-3 leading-7 text-[var(--muted)]">{stay.notes}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-black text-white transition hover:bg-[var(--brand)]"
                      href="/familias"
                    >
                      Solicitar hospedagem
                    </Link>
                    <span className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-4 text-sm font-bold">
                      {stay.availableTonight ? "Disponível hoje" : "Sob consulta"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className={`${viewMode === "map" ? "block lg:order-1" : "hidden lg:block"}`}>
            <ProximityMap stays={filtered} />
          </aside>
        </div>
      </section>
    </main>
  );
}
