import { SiteHeader } from "../components/SiteHeader";
import { ClipboardCheck } from "lucide-react";

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
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="admin" />
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10 lg:px-12">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
            Moderacao
          </p>
          <h1 className="mt-5 text-3xl font-black md:text-5xl">
            Painel inicial para revisar pedidos e ofertas.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Area interna para acompanhar solicitacoes, ofertas e revisoes antes
            de conectar uma familia a um anfitriao.
          </p>
        </div>

        <div className="soft-shell mt-8 overflow-hidden rounded-[2rem]">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr] gap-4 border-b border-[var(--line)] bg-white/74 px-5 py-4 text-sm font-black text-[var(--brand-dark)]">
            <div>Registro</div>
            <div>Necessidade</div>
            <div>Status</div>
          </div>
          {requests.map((request) => (
            <article
              className="grid grid-cols-[1.1fr_1fr_0.8fr] gap-4 border-b border-[var(--line)] bg-white/60 px-5 py-5 text-sm last:border-0"
              key={request.name}
            >
              <div>
                <p className="flex items-center gap-2 font-black">
                  <ClipboardCheck aria-hidden size={16} />
                  {request.name}
                </p>
                <p className="mt-1 text-[var(--muted)]">{request.city}</p>
              </div>
              <p className="leading-6 text-[var(--muted)]">{request.need}</p>
              <div>
                <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 font-black text-[var(--brand-dark)]">
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
