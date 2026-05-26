"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type SiteHeaderProps = {
  current?:
    | "home"
    | "buscar"
    | "familias"
    | "anfitrioes"
    | "admin"
    | "entrar"
    | "perfil";
};

const links = [
  { href: "/", label: "Inicio", key: "home" },
  { href: "/buscar", label: "Buscar hospedagem", key: "buscar" },
  { href: "/familias", label: "Preciso de hospedagem", key: "familias" },
  { href: "/anfitrioes", label: "Quero acolher", key: "anfitrioes" },
];

export function SiteHeader({ current = "home" }: SiteHeaderProps) {
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    const client = supabase;

    window.setTimeout(() => {
      client.auth.getUser().then(({ data }) => {
        if (mounted) {
          setEmail(data.user?.email ?? "");
          if (data.user) {
            client
              .from("profiles")
              .select("avatar_url")
              .eq("id", data.user.id)
              .maybeSingle()
              .then(({ data: profile }) => {
                if (mounted) {
                  setAvatarUrl(profile?.avatar_url ?? "");
                }
              });
          }
        }
      });
    }, 0);

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? "");
      if (!session) {
        setAvatarUrl("");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[#fff4f7]/94 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-10 lg:px-12">
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt=""
            className="h-11 w-11 rounded-2xl"
            height={44}
            priority
            src="/brand/logo-brenda.svg"
            width={44}
          />
          <span className="leading-tight">
            <span className="block text-lg font-black text-[var(--brand-dark)]">
              Projeto Brenda
            </span>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--rose)]">
              acolhimento solidario
            </span>
          </span>
        </Link>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-[var(--muted)]">
          {links.map((link) => (
            <Link
              className={`rounded-full px-4 py-2 transition hover:bg-white hover:text-[var(--brand-dark)] ${
                current === link.key
                  ? "bg-white text-[var(--brand-dark)] shadow-md shadow-[#19101420]"
                  : ""
              }`}
              href={link.href}
              key={link.key}
            >
              {link.label}
            </Link>
          ))}
          {email ? (
            <div className="relative">
              <button
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-white hover:text-[var(--brand-dark)] ${
                  current === "perfil"
                    ? "bg-white text-[var(--brand-dark)] shadow-md shadow-[#19101420]"
                    : ""
                }`}
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                {avatarUrl ? (
                  <Image
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                    height={28}
                    src={avatarUrl}
                    width={28}
                  />
                ) : (
                  <UserCircle aria-hidden size={18} />
                )}
                Minha conta
                <ChevronDown aria-hidden size={16} />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-2 shadow-xl shadow-[#19101420]">
                  <Link
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]"
                    href="/perfil"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCircle aria-hidden size={18} />
                    Editar perfil
                  </Link>
                  <Link
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]"
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck aria-hidden size={18} />
                    Moderacao
                  </Link>
                  <button
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left font-bold text-[var(--brand-dark)] hover:bg-[var(--surface-soft)]"
                    onClick={handleSignOut}
                    type="button"
                  >
                    <LogOut aria-hidden size={17} />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              className={`rounded-full px-4 py-2 transition hover:bg-white hover:text-[var(--brand-dark)] ${
                current === "entrar"
                  ? "bg-white text-[var(--brand-dark)] shadow-md shadow-[#19101420]"
                  : ""
              }`}
              href="/entrar"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
