export type StayType = "Quarto" | "Sofá" | "Casa inteira" | "Edícula";

export type Stay = {
  id: string;
  title: string;
  type: StayType;
  neighborhood: string;
  city: string;
  distanceKm: number;
  capacity: number;
  bathroom: "Compartilhado" | "Exclusivo";
  accessibility: boolean;
  availableTonight: boolean;
  image: string;
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
  host: string;
  notes: string;
};

export const stays: Stay[] = [
  {
    id: "casa-jardim",
    title: "Quarto tranquilo perto do hospital",
    type: "Quarto",
    neighborhood: "Jardim das Flores",
    city: "Curitiba",
    distanceKm: 0.8,
    capacity: 1,
    bathroom: "Compartilhado",
    accessibility: false,
    availableTonight: true,
    image: "/brand/stay-room.svg",
    host: "Família acolhedora",
    notes: "Ambiente silencioso, indicado para descanso de curta duração.",
  },
  {
    id: "edicula-centro",
    title: "Edícula independente com banheiro",
    type: "Edícula",
    neighborhood: "Centro",
    city: "Curitiba",
    distanceKm: 1.6,
    capacity: 2,
    bathroom: "Exclusivo",
    accessibility: true,
    availableTonight: false,
    image: "/brand/stay-suite.svg",
    host: "Anfitriã verificada",
    notes: "Entrada lateral e espaço reservado para até duas pessoas.",
  },
  {
    id: "sofa-vila",
    title: "Sofá-cama em apartamento familiar",
    type: "Sofá",
    neighborhood: "Vila Esperança",
    city: "Curitiba",
    distanceKm: 2.3,
    capacity: 1,
    bathroom: "Compartilhado",
    accessibility: false,
    availableTonight: true,
    image: "/brand/stay-sofa.svg",
    host: "Casal voluntário",
    notes: "Boa opção para chegada emergencial e uma noite de descanso.",
  },
];
