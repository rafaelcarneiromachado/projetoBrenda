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
};

type LodgingPhotoRow = {
  lodging_id: string;
  storage_path: string;
};

function mapLodgingToStay(lodging: LodgingRow, index: number, image?: string): Stay {
  const type = lodgingTypeLabels[lodging.type] ?? "Quarto";

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
    image: image || lodgingImages[type],
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
      "id,title,type,neighborhood,city,capacity,bathroom,accessibility,available_now,description,nearest_hospital",
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

  const firstPhotoByLodging = new Map<string, string>();
  for (const photo of (photos ?? []) as LodgingPhotoRow[]) {
    if (!firstPhotoByLodging.has(photo.lodging_id)) {
      firstPhotoByLodging.set(photo.lodging_id, photo.storage_path);
    }
  }

  const signedPhotos = await Promise.all(
    lodgings.map(async (lodging) => {
      const storagePath = firstPhotoByLodging.get(lodging.id);

      if (!storagePath) {
        return [lodging.id, ""] as const;
      }

      const { data: signed } = await client.storage
        .from("lodging-photos")
        .createSignedUrl(storagePath, 60 * 20);

      return [lodging.id, signed?.signedUrl ?? ""] as const;
    }),
  );
  const photoUrlByLodging = new Map(signedPhotos);

  return lodgings.map((lodging, index) =>
    mapLodgingToStay(lodging, index, photoUrlByLodging.get(lodging.id)),
  );
}
