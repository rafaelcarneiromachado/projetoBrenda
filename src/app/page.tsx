import Image from "next/image";
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
import { SiteHeader } from "./components/SiteHeader";

const featuredStays = [
  {
    title: "Quarto tranquilo",
    meta: "0.8 km do hospital",
    image: "/brand/stay-room.svg",
  },
  {
    title: "Edicula reservada",
    meta: "Banheiro exclusivo",
    image: "/brand/stay-suite.svg",
  },
];

const steps = [
  {
    icon: HeartHandshake,
    title: "Pedido acolhido",
    text: "A familia informa hospital, periodo e quem precisa de um lugar para dormir.",
  },
  {
    icon: HomeIcon,
    title: "Espaco oferecido",
    text: "O anfitriao cadastra um quarto, sofa ou edicula com disponibilidade e regras da casa.",
  },
  {
    icon: ShieldCheck,
    title: "Conexao verificada",
    text: "A moderacao revisa os dois lados antes de aproximar as pessoas.",
  },
];

const safeguards = [
  "Cadastro revisado antes de qualquer contato.",
  "Endereco completo protegido ate a verificacao.",
  "Dados medicos reduzidos ao minimo necessario.",
  "Rede pensada para parceria com hospitais e ONGs.",
];

export default function Home() {
  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="home" />

      <section className="px-6 pb-14 pt-8 md:px-10 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.14em] text-[var(--rose-dark)]">
              hospedagem solidaria oncologica
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] text-[var(--foreground)] md:text-6xl">
              Fique perto de quem mais precisa de voce.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              O Projeto Brenda conecta familiares de criancas e adolescentes em
              tratamento contra o cancer a anfitrioes solidarios proximos aos
              hospitais.
            </p>

            <div className="mt-8 rounded-[2rem] border border-[var(--line)] bg-white p-3 shadow-xl shadow-[#19101412]">
              <div className="grid gap-2 lg:grid-cols-[1fr_0.8fr_0.7fr_auto]">
                <Link
                  className="flex min-h-16 items-center gap-3 rounded-3xl px-4 transition hover:bg-[var(--surface-soft)]"
                  href="/buscar"
                >
                  <MapPin aria-hidden className="shrink-0 text-[var(--rose-dark)]" />
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                      Onde
                    </span>
                    <span className="font-bold text-[var(--foreground)]">
                      Cidade ou hospital
                    </span>
                  </span>
                </Link>
                <Link
                  className="flex min-h-16 items-center gap-3 rounded-3xl px-4 transition hover:bg-[var(--surface-soft)]"
                  href="/buscar"
                >
                  <Users aria-hidden className="shrink-0 text-[var(--rose-dark)]" />
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                      Quem
                    </span>
                    <span className="font-bold text-[var(--foreground)]">
                      Acompanhantes
                    </span>
                  </span>
                </Link>
                <Link
                  className="flex min-h-16 items-center gap-3 rounded-3xl px-4 transition hover:bg-[var(--surface-soft)]"
                  href="/buscar"
                >
                  <HomeIcon aria-hidden className="shrink-0 text-[var(--rose-dark)]" />
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                      Espaco
                    </span>
                    <span className="font-bold text-[var(--foreground)]">
                      Quarto ou sofa
                    </span>
                  </span>
                </Link>
                <Link
                  className="inline-flex min-h-16 items-center justify-center gap-2 rounded-3xl bg-[var(--brand-dark)] px-6 font-black text-white transition hover:bg-[var(--brand)]"
                  href="/buscar"
                >
                  <Search aria-hidden size={18} />
                  Buscar
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold text-[var(--muted)]">
              <span>
                <strong className="text-xl text-[var(--rose-dark)]">24h</strong>{" "}
                revisao cuidadosa
              </span>
              <span>
                <strong className="text-xl text-[var(--rose-dark)]">0</strong>{" "}
                custo para familias
              </span>
              <span>
                <strong className="text-xl text-[var(--rose-dark)]">100%</strong>{" "}
                moderado
              </span>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-xl shadow-[#19101412]">
            <div className="flex items-center justify-between px-2 pb-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                  proximas ao hospital
                </p>
                <h2 className="mt-1 text-2xl font-black">Hospedagens solidarias</h2>
              </div>
              <Link className="text-sm font-black text-[var(--rose-dark)]" href="/buscar">
                Ver mapa
              </Link>
            </div>

            <div className="grid gap-3">
              {featuredStays.map((stay) => (
                <Link
                  className="grid grid-cols-[130px_1fr] overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[#fff8fa] transition hover:-translate-y-0.5 hover:shadow-lg"
                  href="/buscar"
                  key={stay.title}
                >
                  <Image
                    alt=""
                    className="h-full min-h-32 w-full object-cover"
                    height={620}
                    src={stay.image}
                    width={900}
                  />
                  <div className="p-4">
                    <p className="text-lg font-black">{stay.title}</p>
                    <p className="mt-2 text-sm font-bold text-[var(--muted)]">
                      {stay.meta}
                    </p>
                    <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--rose-dark)]">
                      Ver disponibilidade
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-[var(--brand-dark)] p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#f7a7bd]">
                principio central
              </p>
              <p className="mt-2 text-xl font-black leading-7">
                Seguranca antes de escala. Acolhimento antes de automacao.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
              como funciona
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
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface-soft)] p-6 shadow-sm"
                  key={step.title}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-white shadow-md shadow-[#19101430]">
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
              cuidado operacional
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              A rede precisa ser simples, segura e acolhedora.
            </h2>
            <p className="mt-5 leading-8 text-[var(--muted)]">
              Cada pedido passa por revisao antes de aproximar familia e
              anfitriao. O objetivo e facilitar o acolhimento sem abrir mao da
              responsabilidade.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-xl shadow-[#19101412]">
            <div className="grid gap-3">
              {safeguards.map((item) => (
                <div className="flex gap-3 rounded-2xl bg-[#fff8fa] px-4 py-4" key={item}>
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
