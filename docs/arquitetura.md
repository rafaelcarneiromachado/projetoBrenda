# Arquitetura inicial

## Estrategia

Comecar com uma aplicacao web responsiva, funcionando bem no celular, antes de investir em aplicativo nativo. Isso reduz custo, acelera validacao e evita depender da aprovacao inicial das lojas.

## Stack recomendada

- Frontend: Next.js
- Linguagem: TypeScript
- UI: Tailwind CSS
- Banco de dados: Supabase Postgres
- Autenticacao: Supabase Auth
- Arquivos: Supabase Storage
- Hospedagem: Vercel
- E-mails: Resend ou Brevo
- Monitoramento: Sentry, se necessario

## Por que essa stack

- Possui planos gratuitos para comecar.
- Tem documentacao ampla e comunidade grande.
- Permite construir site, app web e painel admin no mesmo projeto.
- O banco Postgres permite crescer com seriedade.
- Supabase reduz a necessidade de manter backend proprio no inicio.

## Cuidado com dados sensiveis

O projeto pode lidar com documentos, dados de saude, enderecos e informacoes de criancas. O produto deve coletar apenas o minimo necessario.

Regras iniciais:

- Evitar detalhes medicos desnecessarios.
- Guardar documentos apenas se forem indispensaveis.
- Restringir acesso administrativo.
- Usar politicas de permissao no banco.
- Registrar termos de uso e politica de privacidade antes de abrir ao publico.

## Caminho de crescimento

1. Vercel Free + Supabase Free.
2. Supabase Pro quando houver uso real.
3. Painel admin mais robusto.
4. PWA instalavel.
5. App com Expo/React Native.
6. Publicacao nas lojas.
7. Expansao para multiplas cidades e idiomas.
