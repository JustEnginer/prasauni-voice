# Prasauni Voice

Nepali/English community media website. This branch migrates the app to Next.js on Vercel with Supabase PostgreSQL, storage and Google authentication.

See [DEPLOYMENT.md](DEPLOYMENT.md) for account setup, admin access, permissions, demo data, test scope and pending live acceptance.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

Copy `.env.example` into a local environment file and supply values securely. Never commit secrets. The Cloudflare/Sites files retained from the original source are historical and are not used by `pnpm build` or Vercel.
