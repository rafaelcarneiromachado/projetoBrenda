import type { SupabaseClient } from "@supabase/supabase-js";
import { Stay, StayType } from "../data/stays";

const lodgingTypeLabels: Record<string, StayType> = {
  room: "Quarto",
  sofa: "Sofá",
  entire_home: "Casa inteira",
  guest_house: "Edícula",
  mattress: "Sofá",
  other: "Quarto",
};

const lodgingImages: Record<StayType, string> = {
  Quarto: "/brand/stay-room.svg",
  Sofá: "/brand/stay-sofa.svg",
  "Casa inteira": "/brand/stay-suite.svg",
  Edícula: "/brand/stay-suite.svg",
};

type LodgingRow = {
  id: string;
  title: string;
  type: string;
  neighborhood: string;
  city: string;
  capacity: number;
  bathroom: string;
  accessibility: boolean | null;
  available_now: boolean | null;
  description: string | null;
  nearest_hospital: string | null;
  approximate_address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
};

type LodgingPhotoRow = {
  lodging_id: string;
  storage_path: string;
};

function toNumber(value: number | string | null) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function mapLodgingToStay(lodging: LodgingRow, index: number, images: string[]): Stay {
  const type = lodgingTypeLabels[lodging.type] ?? "Quarto";
  const fallbackImage = lodgingImages[type];

  return {
    id: lodging.id,
    title: lodging.title,
    type,
    neighborhood: lodging.neighborhood,
    city: lodging.city,
    distanceKm: 0.8 + index * 0.7,
    capacity: lodging.capacity,
    bathroom: lodging.bathroom === "Exclusivo" ? "Exclusivo" : "Compartilhado",
    accessibility: Boolean(lodging.accessibility),
    availableTonight: Boolean(lodging.available_now),
    image: images[0] || fallbackImage,
    images: images.length > 0 ? images : [fallbackImage],
    address: lodging.approximate_address,
    hospital: lodging.nearest_hospital,
    latitude: toNumber(lodging.latitude),
    longitude: toNumber(lodging.longitude),
    host: "Anfitrião verificado",
    notes:
      lodging.description ||
      "Espaço cadastrado por anfitrião solidário e revisado pela equipe.",
  };
}

export async function loadApprovedStays(client: SupabaseClient): Promise<Stay[]> {
  const { data, error } = await client
    .from("lodgings")
    .select(
      "id,title,type,neighborhood,city,capacity,bathroom,accessibility,available_now,description,nearest_hospital,approximate_address,latitude,longitude",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return [];
  }

  const lodgings = data as LodgingRow[];
  const lodgingIds = lodgings.map((lodging) => lodging.id);
  const { data: photos } = await client
    .from("lodging_photos")
    .select("lodging_id,storage_path")
    .in("lodging_id", lodgingIds)
    .order("created_at", { ascending: true });

  const photosByLodging = new Map<string, string[]>();
  for (const photo of (photos ?? []) as LodgingPhotoRow[]) {
    const current = photosByLodging.get(photo.lodging_id) ?? [];
    current.push(photo.storage_path);
    photosByLodging.set(photo.lodging_id, current);
  }

  const signedPhotos = await Promise.all(
    lodgings.map(async (lodging) => {
      const storagePaths = photosByLodging.get(lodging.id) ?? [];

      if (storagePaths.length === 0) {
        return [lodging.id, [] as string[]] as const;
      }

      const urls = await Promise.all(
        storagePaths.map(async (storagePath) => {
          const { data: signed } = await client.storage
            .from("lodging-photos")
            .createSignedUrl(storagePath, 60 * 20);

          return signed?.signedUrl ?? "";
        }),
      );

      return [lodging.id, urls.filter(Boolean)] as const;
    }),
  );
  const photoUrlsByLodging = new Map(signedPhotos);

  return lodgings.map((lodging, index) =>
    mapLodgingToStay(lodging, index, photoUrlsByLodging.get(lodging.id) ?? []),
  );
}
