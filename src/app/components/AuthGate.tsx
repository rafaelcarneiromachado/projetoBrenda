"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AuthGateProps = {
  children: React.ReactNode;
  message: string;
};

export function AuthGate({ children, message }: AuthGateProps) {
  const [authStatus, setAuthStatus] = useState<
    "loading" | "signed-in" | "signed-out" | "blocked"
  >("loading");

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      window.setTimeout(() => {
        if (mounted) {
          setAuthStatus("signed-out");
        }
      }, 0);

      return () => {
        mounted = false;
      };
    }

    const client = supabase;

    async function verifySession() {
      const { data } = await client.auth.getSession();

      if (mounted) {
        if (!data.session) {
          setAuthStatus("signed-out");
          return;
        }

        const { data: profile, error } = await client
          .from("profiles")
          .select("account_status")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (
          error &&
          (error.message.includes("profiles.account_status") ||
            error.message.includes("account_status"))
        ) {
          setAuthStatus("signed-in");
          return;
        }

        setAuthStatus(profile?.account_status === "blocked" ? "blocked" : "signed-in");
      }
    }

    window.setTimeout(verifySession, 0);

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthStatus("signed-out");
        return;
      }

      window.setTimeout(verifySession, 0);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (authStatus === "loading") {
    return (
      <div className="soft-shell rounded-[2rem] p-7">
        <p className="font-black">Verificando acesso...</p>
      </div>
    );
  }

  if (authStatus !== "signed-in") {
    if (authStatus === "blocked") {
      return (
        <div className="soft-shell rounded-[2rem] p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-white">
            <LockKeyhole aria-hidden size={22} />
          </div>
          <h2 className="mt-5 text-2xl font-black">Conta bloqueada</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            Esta conta foi bloqueada pela moderação. Entre em contato com a equipe
            do Projeto Brenda para revisar o acesso.
          </p>
        </div>
      );
    }

    return (
      <div className="soft-shell rounded-[2rem] p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-white">
          <LockKeyhole aria-hidden size={22} />
        </div>
        <h2 className="mt-5 text-2xl font-black">Entre para continuar</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">{message}</p>
        <Link
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)]"
          href="/entrar"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  return children;
}
