import Link from "next/link";
import { HeartHandshake, HomeIcon, ShieldCheck } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";

const principles = [
  {
    icon: HeartHandshake,
    title: "Acolhimento primeiro",
    text: "Ajudar familiares a encontrarem descanso e apoio enquanto acompanham alguém em tratamento hospitalar.",
  },
  {
    icon: HomeIcon,
    title: "Rede descentralizada",
    text: "Usar quartos, sofás e espaços já existentes em casas próximas aos hospitais, com solidariedade e responsabilidade.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança com cuidado",
    text: "Manter moderação, revisão e proteção de dados antes de aproximar famílias e anfitriões.",
  },
];

export default function MissaoPage() {
  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="missao" />

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
              nossa missão
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              Transformar proximidade em acolhimento.
            </h1>
          </div>
          <p className="text-lg leading-8 text-[var(--muted)]">
            Esta página será o espaço para contar a história, o contexto e os objetivos do
            Projeto Brenda. Por enquanto, deixamos uma base simples para organizar a
            mensagem com calma e preservar o tom humano do projeto.
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-xl shadow-[#19101410] md:p-8">
          <p className="max-w-3xl text-xl font-black leading-9 md:text-2xl">
            O Projeto Brenda nasce para que nenhuma família precise enfrentar o tratamento
            hospitalar longe de casa sem um lugar digno para descansar.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  className="rounded-[1.5rem] bg-[var(--surface-soft)] p-5"
                  key={principle.title}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-white">
                    <Icon aria-hidden size={22} />
                  </div>
                  <h2 className="mt-5 text-xl font-black">{principle.title}</h2>
                  <p className="mt-3 leading-7 text-[var(--muted)]">{principle.text}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)]"
            href="/buscar"
          >
            Buscar hospedagem
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--brand-dark)] bg-white px-6 font-black text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
            href="/anfitrioes"
          >
            Quero acolher
          </Link>
        </div>
      </section>
    </main>
  );
}
