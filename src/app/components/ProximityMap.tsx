"use client";

import { useEffect, useRef, useState } from "react";
import { Stay } from "../data/stays";

type ProximityMapProps = {
  stays: Stay[];
};

const defaultCenter = {
  latitude: -25.4284,
  longitude: -49.2733,
};

const knownLocationFallbacks = [
  {
    keys: ["bairro alto", "curitiba"],
    latitude: -25.399,
    longitude: -49.207,
  },
  {
    keys: ["erasto gaertner", "curitiba"],
    latitude: -25.452,
    longitude: -49.232,
  },
  {
    keys: ["curitiba"],
    latitude: -25.4284,
    longitude: -49.2733,
  },
];

type LocatedStay = Stay & {
  latitude: number;
  longitude: number;
};

type LeafletMap = {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  remove: () => void;
};

type LeafletMarker = {
  bindPopup: (content: string) => LeafletMarker;
  addTo: (map: LeafletMap) => LeafletMarker;
};

type LeafletStatic = {
  map: (element: HTMLDivElement) => LeafletMap;
  tileLayer: (
    url: string,
    options: { attribution: string; maxZoom: number },
  ) => { addTo: (map: LeafletMap) => void };
  marker: (center: [number, number]) => LeafletMarker;
};

declare global {
  interface Window {
    L?: LeafletStatic;
  }
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getAddressQueries(stay: Stay) {
  return [
    [stay.address, stay.neighborhood, stay.city, "Brasil"],
    [stay.neighborhood, stay.city, "Brasil"],
    [stay.hospital, stay.city, "Brasil"],
    [stay.city, "Brasil"],
  ]
    .map((parts) => parts.filter(Boolean).join(", "))
    .filter((query, index, queries) => query && queries.indexOf(query) === index);
}

function getCachedCoordinates(key: string) {
  const cached = window.sessionStorage.getItem(`pb:geo:${key}`);

  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as { latitude: number; longitude: number };
  } catch {
    return null;
  }
}

function getKnownFallbackCoordinates(stay: Stay, index: number) {
  const haystack = normalize(
    [stay.address, stay.neighborhood, stay.hospital, stay.city].filter(Boolean).join(" "),
  );
  const fallback = knownLocationFallbacks.find((location) =>
    location.keys.every((key) => haystack.includes(key)),
  );

  if (!fallback) {
    return null;
  }

  const offset = index * 0.0025;
  return {
    ...stay,
    latitude: fallback.latitude + offset,
    longitude: fallback.longitude + offset,
  };
}

async function geocodeStay(stay: Stay) {
  if (typeof stay.latitude === "number" && typeof stay.longitude === "number") {
    return { ...stay, latitude: stay.latitude, longitude: stay.longitude };
  }

  const queries = getAddressQueries(stay);

  for (const query of queries) {
    const cached = getCachedCoordinates(query);

    if (cached) {
      return { ...stay, ...cached };
    }
  }

  for (const query of queries) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        query,
      )}`,
    );
    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];

    if (!first) {
      continue;
    }

    const coordinates = {
      latitude: Number(first.lat),
      longitude: Number(first.lon),
    };

    if (
      !Number.isFinite(coordinates.latitude) ||
      !Number.isFinite(coordinates.longitude)
    ) {
      continue;
    }

    window.sessionStorage.setItem(`pb:geo:${query}`, JSON.stringify(coordinates));
    return { ...stay, ...coordinates };
  }

  return null;
}

function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  return new Promise<LeafletStatic>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-project-brenda-leaflet="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.L) {
          resolve(window.L);
        }
      });
      existingScript.addEventListener("error", reject);
      return;
    }

    const css = document.createElement("link");
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.rel = "stylesheet";
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.dataset.projectBrendaLeaflet = "true";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      if (window.L) {
        resolve(window.L);
      }
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function ProximityMap({ stays }: ProximityMapProps) {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const [locatedStays, setLocatedStays] = useState<LocatedStay[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      const located: LocatedStay[] = [];

      for (const stay of stays) {
        try {
          const result =
            (await geocodeStay(stay)) ?? getKnownFallbackCoordinates(stay, located.length);

          if (result) {
            located.push(result);
          }
        } catch {
          // Geocoding is best-effort; cards still show even if the map cannot locate one.
        }
      }

      if (!cancelled) {
        setLocatedStays(located);
      }
    }

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, [stays]);

  useEffect(() => {
    let cancelled = false;

    async function renderMap() {
      if (!mapElement.current) {
        return;
      }

      const leaflet = await loadLeaflet();
      const center = locatedStays[0] ?? defaultCenter;

      if (cancelled || !mapElement.current) {
        return;
      }

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const map = leaflet
        .map(mapElement.current)
        .setView([center.latitude, center.longitude], locatedStays.length > 0 ? 13 : 12);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 19,
        })
        .addTo(map);

      for (const stay of locatedStays) {
        leaflet
          .marker([stay.latitude, stay.longitude])
          .bindPopup(
            `<strong>${stay.title}</strong><br>${stay.neighborhood}, ${stay.city}<br>${stay.distanceKm.toFixed(
              1,
            )} km`,
          )
          .addTo(map);
      }

      mapInstance.current = map;
    }

    renderMap();

    return () => {
      cancelled = true;
    };
  }, [locatedStays]);

  useEffect(() => {
    return () => {
      mapInstance.current?.remove();
    };
  }, []);

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

      <div className="h-[420px] w-full bg-[#f8dfe8]" ref={mapElement} />

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
            Estamos tentando localizar as hospedagens pelo endereço cadastrado. Se uma
            localização não aparecer, revise o endereço aproximado no cadastro.
          </p>
        ) : null}
      </div>
    </div>
  );
}
