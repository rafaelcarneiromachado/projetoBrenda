"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Camera, Save, Search, UserCircle } from "lucide-react";
import { AuthGate } from "../components/AuthGate";
import { TextAreaField, TextField } from "../components/Field";
import { SiteHeader } from "../components/SiteHeader";
import { supabase } from "../lib/supabase";

type Profile = {
  full_name: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
  family_info: string;
  bio: string;
  avatar_url: string;
};

const emptyProfile: Profile = {
  full_name: "",
  phone: "",
  cep: "",
  address: "",
  city: "",
  state: "",
  family_info: "",
  bio: "",
  avatar_url: "",
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export default function PerfilPage() {
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("full_name,phone,cep,address,city,state,family_info,bio,avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (profileError) {
        setError(profileError.message);
      } else {
        const metadata = user.user_metadata;
        const nextProfile = {
          full_name: data?.full_name ?? metadata.full_name ?? "",
          phone: data?.phone ?? metadata.phone ?? "",
          cep: data?.cep ?? "",
          address: data?.address ?? "",
          city: data?.city ?? "",
          state: data?.state ?? "",
          family_info: data?.family_info ?? "",
          bio: data?.bio ?? "",
          avatar_url: data?.avatar_url ?? metadata.avatar_url ?? "",
        };
        setProfile(nextProfile);
        setAvatarPreview(nextProfile.avatar_url);
      }

      setLoading(false);
    }

    window.setTimeout(loadProfile, 0);

    return () => {
      mounted = false;
    };
  }, []);

  function updateProfile(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function lookupCep() {
    const cep = profile.cep.replace(/\D/g, "");

    if (cep.length !== 8) {
      setError("Informe um CEP com 8 digitos.");
      return;
    }

    setError("");
    setCepLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = (await response.json()) as ViaCepResponse;

      if (data.erro) {
        setError("CEP nao encontrado.");
        setCepLoading(false);
        return;
      }

      setProfile((current) => ({
        ...current,
        address: [data.logradouro, data.bairro].filter(Boolean).join(", "),
        city: data.localidade ?? current.city,
        state: data.uf ?? current.state,
      }));
    } catch {
      setError("Nao foi possivel buscar o CEP agora.");
    }

    setCepLoading(false);
  }

  async function uploadAvatar(userId: string) {
    if (!supabase || !avatarFile) {
      return profile.avatar_url;
    }

    const safeName = avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const path = `${userId}/avatar-${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-avatars")
      .upload(path, avatarFile);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("profile-avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    if (!supabase) {
      setError("Supabase nao esta configurado neste ambiente.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Entre novamente para salvar seu perfil.");
      setSaving(false);
      return;
    }

    let avatarUrl = profile.avatar_url;

    try {
      avatarUrl = await uploadAvatar(user.id);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Nao foi possivel enviar a foto.",
      );
      setSaving(false);
      return;
    }

    const nextProfile = {
      id: user.id,
      ...profile,
      avatar_url: avatarUrl,
    };

    let saveError;

    try {
      const result = await supabase.from("profiles").upsert(nextProfile);
      saveError = result.error;
    } catch {
      setError("Nao foi possivel salvar o perfil. Verifique sua conexao.");
      setSaving(false);
      return;
    }

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setProfile(nextProfile);
    setAvatarPreview(avatarUrl);
    setAvatarFile(null);
    setMessage("Perfil salvo.");
    setSaving(false);
  }

  return (
    <main className="min-h-screen quiet-pattern">
      <SiteHeader current="perfil" />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
        <aside className="lg:pt-8">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--rose-dark)] shadow-sm">
            minha conta
          </p>
          <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
            Seus dados de contato e acolhimento.
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Essas informacoes ajudam a moderacao a entender quem voce e, sua
            familia e como entrar em contato com seguranca.
          </p>
          <div className="soft-shell mt-8 rounded-[1.5rem] p-5">
            <div className="flex items-center gap-3">
              {avatarPreview ? (
                <Image
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                  height={56}
                  src={avatarPreview}
                  width={56}
                />
              ) : (
                <UserCircle aria-hidden size={48} />
              )}
              <div>
                <p className="font-black">{profile.full_name || email}</p>
                <p className="text-sm font-bold text-[var(--muted)]">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <AuthGate message="Entre para visualizar e editar seu perfil.">
          <form className="soft-shell rounded-[2rem] p-5 md:p-7" onSubmit={handleSubmit}>
            <div className="grid gap-5">
              {loading ? (
                <p className="font-bold text-[var(--muted)]">Carregando perfil...</p>
              ) : null}
              {message ? (
                <div className="rounded-2xl border border-[#f7a7bd] bg-white px-4 py-3 text-sm font-bold text-[var(--rose-dark)]">
                  {message}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#be123c]">
                  {error}
                </div>
              ) : null}

              <div className="rounded-2xl bg-white p-4">
                <p className="text-sm font-black">Foto de perfil</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {avatarPreview ? (
                    <Image
                      alt=""
                      className="h-20 w-20 rounded-full object-cover"
                      height={80}
                      src={avatarPreview}
                      width={80}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-soft)]">
                      <UserCircle aria-hidden size={40} />
                    </div>
                  )}
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 text-sm font-black">
                    <Camera aria-hidden size={18} />
                    Enviar foto
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                      type="file"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  label="Nome completo"
                  name="full_name"
                  onChange={(event) => updateProfile("full_name", event.target.value)}
                  value={profile.full_name}
                />
                <TextField
                  label="Telefone com WhatsApp"
                  name="phone"
                  onChange={(event) => updateProfile("phone", event.target.value)}
                  value={profile.phone}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-[0.7fr_auto]">
                <TextField
                  hint="Digite o CEP e use a busca para preencher endereco, cidade e UF."
                  label="CEP"
                  name="cep"
                  onChange={(event) => updateProfile("cep", event.target.value)}
                  placeholder="00000-000"
                  value={profile.cep}
                />
                <button
                  className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[var(--brand-dark)] bg-white px-5 font-black disabled:opacity-60"
                  disabled={cepLoading}
                  onClick={lookupCep}
                  type="button"
                >
                  <Search aria-hidden size={18} />
                  {cepLoading ? "Buscando..." : "Buscar CEP"}
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-[1.4fr_0.8fr_0.5fr]">
                <TextField
                  label="Endereco"
                  name="address"
                  onChange={(event) => updateProfile("address", event.target.value)}
                  value={profile.address}
                />
                <TextField
                  label="Cidade"
                  name="city"
                  onChange={(event) => updateProfile("city", event.target.value)}
                  value={profile.city}
                />
                <TextField
                  label="UF"
                  name="state"
                  onChange={(event) => updateProfile("state", event.target.value)}
                  value={profile.state}
                />
              </div>

              <TextAreaField
                hint="Ex.: familiar em tratamento, relacao com a crianca, cidade de origem. Evite detalhes medicos sensiveis."
                label="Familiares e contexto"
                name="family_info"
                onChange={(event) => updateProfile("family_info", event.target.value)}
                value={profile.family_info}
              />

              <TextAreaField
                hint="Uma breve apresentacao para a equipe de moderacao."
                label="Bio"
                name="bio"
                onChange={(event) => updateProfile("bio", event.target.value)}
                value={profile.bio}
              />

              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 font-black text-white shadow-lg shadow-[#19101435] transition hover:bg-[var(--brand)] disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar perfil"}
                <Save aria-hidden size={18} />
              </button>
            </div>
          </form>
        </AuthGate>
      </section>
    </main>
  );
}
