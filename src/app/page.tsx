import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  HomeIcon,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "./components/SiteHeader";

const stats = [
  { value: "1", label: "piloto com moderacao humana" },
  { value: "3", label: "fluxos: familia, anfitriao e admin" },
  { value: "0", label: "custo obrigatorio para testar" },
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
  "Piloto pensado para parceria com hospitais e ONGs.",
];

export default function Home() {
  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="home" />

      <section className="px-6 pb-16 pt-10 md:px-10 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
              hospedagem solidaria oncologica
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.04] text-[var(--foreground)] md:text-6xl">
              Um lugar seguro para descansar enquanto o amor permanece perto.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              O Projeto Brenda conecta familiares de criancas e adolescentes em
              tratamento contra o cancer a anfitrioes solidarios proximos aos
              hospitais.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)]"
                href="/familias"
              >
                Preciso de hospedagem
                <ArrowRight aria-hidden size={18} />
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-6 font-black text-[var(--brand-dark)] shadow-sm transition hover:bg-[var(--surface-soft)]"
                href="/anfitrioes"
              >
                Quero acolher
                <HeartHandshake aria-hidden size={18} />
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div className="rounded-2xl bg-white/76 p-4 shadow-sm" key={item.label}>
                  <div className="text-3xl font-black text-[var(--rose-dark)]">
                    {item.value}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="soft-shell relative overflow-hidden rounded-[2rem] p-4">
            <Image
              alt="Ilustracao de uma casa acolhedora perto de um hospital"
              className="h-auto w-full rounded-[1.5rem]"
              height={900}
              priority
              src="/brand/hero-acolhimento.svg"
              width={1200}
            />
            <div className="absolute bottom-6 left-6 right-6 rounded-3xl bg-white/92 p-5 shadow-lg backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)]">
                primeiro principio
              </p>
              <p className="mt-2 text-lg font-black leading-6">
                Seguranca antes de escala. Acolhimento antes de automacao.
              </p>
            </div>
          </div>
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
              O MVP nao precisa parecer grande. Precisa ser confiavel.
            </h2>
            <p className="mt-5 leading-8 text-[var(--muted)]">
              A primeira versao existe para aprender com responsabilidade:
              poucos usuarios, moderacao manual e dados sensiveis tratados com
              cuidado.
            </p>
          </div>

          <div className="soft-shell rounded-[2rem] p-6">
            <div className="grid gap-3">
              {safeguards.map((item) => (
                <div
                  className="flex gap-3 rounded-2xl bg-white px-4 py-4"
                  key={item}
                >
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
