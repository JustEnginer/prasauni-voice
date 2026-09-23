# Prasauni Voice — source handoff

This folder contains the Next.js/TypeScript application, database migration, demo image/video, tests and deployment instructions. Dependencies, Git history and credentials are excluded. This export comes from application commit ed3c281; handoff documentation has been updated.

## Push to GitHub

1. Extract this ZIP and open a terminal (Git Bash on Windows) inside the folder containing package.json.
2. On GitHub, create a new private repository named prasauni-voice. Leave README, .gitignore and license initialization unchecked.
3. Run the commands below, replacing YOUR_USERNAME with your GitHub username:

```sh
git init -b main
git add .
git commit -m "Initial Prasauni Voice project"
git remote add origin https://github.com/YOUR_USERNAME/prasauni-voice.git
git push -u origin main
```

If Git asks for your identity before committing, set it and retry the commit:

```sh
git config user.name "Your Name"
git config user.email "YOUR_GITHUB_EMAIL"
```

Sign in through Git's credential prompt when requested. Never put passwords or tokens into source files. If Git is not installed, install it from https://git-scm.com/downloads first.

## Run locally

Install Node.js 22.13 or newer compatible with the project's dependencies, and the pnpm version specified in package.json. Copy .env.example to .env.local and enter your Supabase configuration privately. Then run:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. Use pnpm test and pnpm build for automated verification.

## Before launching on Vercel

Read DEPLOYMENT.md. Import the GitHub repository into Vercel and configure the three environment variables listed in .env.example. Never commit .env.local or a Supabase service-role key.

The Supabase project vhyusxskmnsbwdmrvvjl has already been provisioned, with its initial database migration and three demo records. Do not reapply the initial migration there. Google OAuth and the production callback URLs still need configuration. No Vercel deployment is included or claimed by this handoff.

## Admin and readers

Once Google authentication is configured, sign in using the verified Google account help.justenginer@gmail.com for admin access. There is no separate website password. All other signed-in accounts are readers.

Admin: create/edit/publish/draft/delete content, upload media or paste supported social links, moderate comments, and view website analytics.
Readers: view published content, like/unlike, comment and share. Guests receive a timed preview.

Social embeds depend on public post permissions and provider/browser rules; autoplay is not guaranteed. The demo video is a short silent still-image test clip.

## Verification status

Prior automated verification passed 81 backend requests and a production build. Provider identity and storage were mocked in those tests. Complete live browser testing, real Google login, production uploads and production performance verification remain required after deployment. See TEST-RESULTS.md and DEPLOYMENT.md for scope.
