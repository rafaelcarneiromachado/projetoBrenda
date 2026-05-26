import Link from "next/link";
import { HeartHandshake, HomeIcon, Mail, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";

const principles = [
  {
    icon: HeartHandshake,
    title: "Acolhimento Primeiro",
    text: "Ajudar familiares a encontrarem descanso e apoio enquanto acompanham alguém em tratamento hospitalar.",
  },
  {
    icon: HomeIcon,
    title: "Rede Descentralizada",
    text: "Usar quartos, sofás e espaços já existentes em casas próximas aos hospitais, com solidariedade e responsabilidade.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança Com Cuidado",
    text: "Manter moderação, revisão e proteção de dados antes de aproximar famílias e anfitriões.",
  },
];

const missionParagraphs = [
  "Imagine que o seu filho foi diagnosticado com câncer. Vocês moram no interior e precisam viajar centenas de quilômetros para a capital onde fica o hospital oncológico. Chegando lá, a regra do hospital é clara: na enfermaria, apenas um acompanhante é permitido. Geralmente, a mãe fica lá dentro, sem sair do lado do filho. E o pai? O pai não tem dinheiro para hotel, não tem conhecidos na cidade e, por amor ao filho, acaba dormindo na calçada do hospital ou na rodoviária.",
  "Eu conheço essa realidade de perto. Minha filha, a Brenda, enfrentou um câncer cerebral e, infelizmente, ela faleceu. Durante o tempo em que estivemos no hospital, eu não passei por essa situação específica de dormir na rua, mas eu vi, com meus próprios olhos, dezenas de pais desamparados na calçada, enquanto suas famílias desmoronavam lá dentro. A Brenda me deixou um legado de amor, e é por isso que a luta de milhares de famílias que vi de perto não pode continuar sendo invisível.",
  "Hoje, o SUS e as ONGs tradicionais, como as Casas Ronald McDonald, fazem um trabalho incrível, mas elas têm um limite físico. Elas sofrem com falta de vagas e, por isso, a prioridade máxima é sempre o paciente e apenas um acompanhante. O segundo pilar da família, que geralmente é o pai ou um irmão, fica completamente desamparado pela infraestrutura atual. Construir novos prédios de acolhimento custa milhões e leva anos.",
  "Para resolver isso, nós criamos o Projeto Brenda: o primeiro aplicativo de economia solidária Peer-to-Peer focado em acolhimento oncológico familiar. Nós somos o Airbnb da solidariedade.",
  "Conectamos pessoas que moram nos arredores dos grandes hospitais de câncer e possuem um quarto vago, um sofá ou uma edícula, com esses pais que não têm onde dormir. Em vez de construir prédios, nós descentralizamos o acolhimento utilizando a estrutura que a sociedade civil já possui e quer doar.",
];

const contactItems = [
  {
    icon: UserRound,
    label: "Administrador E Autor",
    value: "Rafael Machado",
  },
  {
    icon: Mail,
    label: "E-Mail",
    value: "contato@projetobrenda.com.br",
    href: "mailto:contato@projetobrenda.com.br",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+55 41 98852 7539",
    href: "https://wa.me/5541988527539",
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
              Nossa Missão
            </p>
            <h1 className="mt-5 text-3xl font-black leading-tight md:text-4xl">
              Transformar dor em rede de acolhimento.
            </h1>
          </div>
          <p className="text-lg leading-8 text-[var(--muted)]">
            O Projeto Brenda nasce da memória da Brenda e da realidade de famílias que
            precisam estar perto do hospital, mas nem sempre encontram onde descansar.
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-xl shadow-[#19101410] md:p-8">
          <div className="grid gap-8">
            <div className="rounded-[1.5rem] bg-[var(--brand-dark)] p-6 text-center text-white md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f7a7bd]">
                Legado De Amor
              </p>
              <p className="mx-auto mt-4 max-w-3xl text-2xl font-black leading-8 md:text-3xl md:leading-10">
                ...nenhuma família deveria atravessar uma noite de hospital sem apoio...
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-5 text-base leading-8 text-[var(--muted)]">
              {missionParagraphs.map((paragraph, index) => (
                <p
                  className={
                    index === 1
                      ? "rounded-[1.5rem] bg-[var(--surface-soft)] p-5 font-bold text-[var(--brand-dark)]"
                      : ""
                  }
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

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
            Buscar Hospedagem
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--brand-dark)] bg-white px-6 font-black text-[var(--brand-dark)] transition hover:bg-[var(--surface-soft)]"
            href="/anfitrioes"
          >
            Oferecer Hospedagem
          </Link>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[var(--line)] bg-[var(--brand-dark)] p-6 text-white shadow-xl shadow-[#19101418] md:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#f7a7bd]">
              Fale Com O Projeto
            </p>
            <h2 className="mt-3 max-w-3xl text-2xl font-black md:text-3xl">
              Um canal direto para dúvidas, parcerias e acolhimento.
            </h2>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="h-full rounded-[1.25rem] bg-white/10 p-4 ring-1 ring-white/15 transition hover:bg-white/15">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand-dark)]">
                    <Icon aria-hidden size={18} />
                  </div>
                  <p className="mt-4 text-[0.7rem] font-black uppercase tracking-[0.12em] text-[#f7a7bd]">
                    {item.label}
                  </p>
                  <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-black text-white">
                    {item.value}
                  </p>
                </div>
              );

              return item.href ? (
                <Link href={item.href} key={item.label}>
                  {content}
                </Link>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
