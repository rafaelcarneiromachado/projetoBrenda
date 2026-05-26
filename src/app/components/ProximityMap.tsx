"use client";

import { Stay } from "../data/stays";

type ProximityMapProps = {
  stays: Stay[];
};

const defaultCenter = {
  latitude: -25.4284,
  longitude: -49.2733,
};

function getMapCenter(stays: Stay[]) {
  const locatedStay = stays.find(
    (stay) => typeof stay.latitude === "number" && typeof stay.longitude === "number",
  );

  return {
    latitude: locatedStay?.latitude ?? defaultCenter.latitude,
    longitude: locatedStay?.longitude ?? defaultCenter.longitude,
  };
}

export function ProximityMap({ stays }: ProximityMapProps) {
  const center = getMapCenter(stays);
  const bbox = [
    center.longitude - 0.035,
    center.latitude - 0.025,
    center.longitude + 0.035,
    center.latitude + 0.025,
  ].join(",");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.latitude},${center.longitude}`;
  const locatedStays = stays.filter(
    (stay) => typeof stay.latitude === "number" && typeof stay.longitude === "number",
  );

  return (
    <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] p-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
            mapa interativo
          </p>
          <h2 className="mt-1 text-2xl font-black">Hospedagens próximas</h2>
        </div>
        <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-sm font-black text-[var(--rose-dark)]">
          {stays.length}
        </span>
      </div>

      <iframe
        className="h-[420px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title="Mapa de hospedagens próximas"
      />

      <div className="grid max-h-56 gap-2 overflow-y-auto p-4">
        {stays.map((stay) => (
          <div
            className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3"
            key={stay.id}
          >
            <div>
              <p className="font-black">{stay.title}</p>
              <p className="text-sm font-bold text-[var(--muted)]">
                {stay.neighborhood}, {stay.city}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black">
              {stay.distanceKm.toFixed(1)} km
            </span>
          </div>
        ))}
        {locatedStays.length === 0 ? (
          <p className="text-sm font-bold leading-6 text-[var(--muted)]">
            Quando as hospedagens tiverem latitude e longitude cadastradas, o mapa será
            centralizado exatamente nos endereços aproximados.
          </p>
        ) : null}
      </div>
    </div>
  );
}
