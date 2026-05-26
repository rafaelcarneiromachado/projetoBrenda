export type StayType = "Quarto" | "Sofa" | "Casa inteira" | "Edicula";

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
    host: "Familia acolhedora",
    notes: "Ambiente silencioso, indicado para descanso de curta duracao.",
  },
  {
    id: "edicula-centro",
    title: "Edicula independente com banheiro",
    type: "Edicula",
    neighborhood: "Centro",
    city: "Curitiba",
    distanceKm: 1.6,
    capacity: 2,
    bathroom: "Exclusivo",
    accessibility: true,
    availableTonight: false,
    image: "/brand/stay-suite.svg",
    host: "Anfitria verificada",
    notes: "Entrada lateral e espaco reservado para ate duas pessoas.",
  },
  {
    id: "sofa-vila",
    title: "Sofa-cama em apartamento familiar",
    type: "Sofa",
    neighborhood: "Vila Esperanca",
    city: "Curitiba",
    distanceKm: 2.3,
    capacity: 1,
    bathroom: "Compartilhado",
    accessibility: false,
    availableTonight: true,
    image: "/brand/stay-sofa.svg",
    host: "Casal voluntario",
    notes: "Boa opcao para chegada emergencial e uma noite de descanso.",
  },
];
