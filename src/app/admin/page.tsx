import { SiteHeader } from "../components/SiteHeader";

const requests = [
  {
    name: "Familia em analise",
    city: "Interior -> Capital",
    status: "Pendente",
    need: "1 acompanhante por 4 noites",
  },
  {
    name: "Anfitriao voluntario",
    city: "Bairro proximo ao hospital",
    status: "Em verificacao",
    need: "Quarto para 1 pessoa",
  },
  {
    name: "Pedido priorizado",
    city: "Chegada prevista nesta semana",
    status: "Aprovado",
    need: "Contato mediado pela moderacao",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader current="admin" />
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            Moderacao
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            Painel inicial para revisar pedidos e ofertas.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Esta tela ainda usa dados simulados. Ela mostra o tipo de visao que
            a moderacao precisara antes de conectar uma familia a um anfitriao.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr] gap-4 border-b border-[var(--line)] bg-[#eef7f4] px-5 py-3 text-sm font-bold text-[var(--brand-dark)]">
            <div>Registro</div>
            <div>Necessidade</div>
            <div>Status</div>
          </div>
          {requests.map((request) => (
            <article
              className="grid grid-cols-[1.1fr_1fr_0.8fr] gap-4 border-b border-[var(--line)] px-5 py-4 text-sm last:border-0"
              key={request.name}
            >
              <div>
                <p className="font-bold">{request.name}</p>
                <p className="mt-1 text-[var(--muted)]">{request.city}</p>
              </div>
              <p className="leading-6 text-[var(--muted)]">{request.need}</p>
              <div>
                <span className="inline-flex rounded-full bg-[#f7efe3] px-3 py-1 font-bold text-[var(--brand-dark)]">
                  {request.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
