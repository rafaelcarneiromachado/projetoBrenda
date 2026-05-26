import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";

const stats = [
  { value: "1", label: "rede inicial focada em seguranca" },
  { value: "3", label: "perfis essenciais: familia, anfitriao e moderacao" },
  { value: "0", label: "custo obrigatorio para comecar o piloto" },
];

const steps = [
  "A familia solicita acolhimento perto do hospital.",
  "O anfitriao cadastra um espaco disponivel para receber.",
  "A moderacao verifica os dois lados antes de combinar a hospedagem.",
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <SiteHeader current="home" />
      <section className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-6 md:px-10 lg:px-12">
          <div className="grid gap-10 pb-12 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                Hospedagem solidaria oncologica
              </p>
              <h1 className="text-4xl font-bold leading-tight text-[var(--foreground)] md:text-6xl">
                Um lugar para descansar, perto de quem mais precisa de voce.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                O Projeto Brenda conecta familiares de criancas e adolescentes
                em tratamento contra o cancer a anfitrioes solidarios proximos
                aos hospitais.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--brand)] px-6 font-bold text-white transition hover:bg-[var(--brand-dark)]"
                  href="/familias"
                >
                  Preciso de hospedagem
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--line)] bg-white px-6 font-bold text-[var(--foreground)] transition hover:border-[var(--brand)]"
                  href="/anfitrioes"
                >
                  Quero acolher
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[#f7efe3] p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand-dark)]">
                Piloto responsavel
              </p>
              <div className="mt-6 space-y-5">
                {stats.map((item) => (
                  <div
                    className="border-b border-[#dccfbd] pb-5 last:border-0 last:pb-0"
                    key={item.label}
                  >
                    <div className="text-4xl font-bold text-[var(--brand-dark)]">
                      {item.value}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-[var(--background)] px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold">Como funciona</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                className="rounded-lg border border-[var(--line)] bg-white p-6"
                key={step}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--warm)] font-bold">
                  {index + 1}
                </div>
                <p className="mt-5 leading-7 text-[var(--muted)]">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="mvp" className="bg-white px-6 py-16 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Primeira versao</h2>
            <p className="mt-4 leading-8 text-[var(--muted)]">
              A primeira entrega sera uma web app responsiva, funcionando bem
              no celular, com cadastro de familias, cadastro de anfitrioes e um
              painel de moderacao simples.
            </p>
          </div>
          <div className="grid gap-3 text-sm">
            {[
              "Formulario para quem precisa de hospedagem.",
              "Formulario para quem quer acolher.",
              "Painel admin com aprovacao manual.",
              "Status de pedidos e ofertas.",
              "Base pronta para conectar ao Supabase.",
            ].map((item) => (
              <div
                className="rounded-md border border-[var(--line)] bg-[var(--background)] px-4 py-3"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="seguranca" className="bg-[#eef7f4] px-6 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold">Seguranca antes de escala</h2>
          <p className="mt-4 max-w-3xl leading-8 text-[var(--muted)]">
            O Projeto Brenda deve crescer com verificacao, moderacao e coleta
            minima de dados. No inicio, nenhuma hospedagem sera combinada de
            forma automatica.
          </p>
        </div>
      </section>
    </main>
  );
}
