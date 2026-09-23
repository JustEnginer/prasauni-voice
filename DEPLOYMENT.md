# Prasauni Voice — Vercel edition

Status: application source prepared; the Supabase project and initial database have been provisioned. Vercel deployment, Google authentication configuration, environment variables and live acceptance are still required. The old ChatGPT-hosted site is a separate deployment and has not received this edition.

## Connect and configure

1. Connect the owner's GitHub, Vercel and Supabase accounts. Create a private GitHub repository from this migration branch; do not make service keys public.
2. Existing Supabase project: **Prasauni Voice**, reference `vhyusxskmnsbwdmrvvjl`, in the Just Engineer organization. The initial migration and three demo records were already applied; do not reapply the initial migration to this database. If intentionally using a new empty Supabase project instead, apply `supabase/migrations/202609230001_initial.sql` once. This creates the PostgreSQL tables, server-only access rules, analytics functions and a public media bucket (20 MB/file). No browser client has permission to write directly to tables.
3. In Supabase Auth, enable Google. Configure a Google OAuth Web client with the callback URL shown by Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`). Put the Google client ID and secret in Supabase, not the site source. Select the appropriate external consent audience and complete Google's publishing requirements so ordinary visitors can sign in.
4. Import the GitHub repository into Vercel using Next.js. `vercel.json` supplies the build settings. Set the three variables from `.env.example` in Vercel. `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never put it in a NEXT_PUBLIC variable or chat.
5. Set Supabase's Site URL to the actual production Vercel origin and allow exactly `<production-origin>/auth/callback` in redirect URLs. Set any specific test origin separately; avoid broad wildcards in production.
6. Deploy. Run `node --env-file=.env.local scripts/seed-demo.mjs` from a securely configured environment or use Admin → Overview → Add test photo, video & blog. This inserts three labelled test posts without overwriting existing posts.
7. Complete the live acceptance checklist below before calling the launch complete.

The requested free hostname can be `prasauni-voice-nepal.vercel.app` if available; this is a proposal, not an assigned or verified hostname. Vercel's Hobby plan is for personal, non-commercial projects and has quotas. Do not enable paid services without the owner's approval.

## Login and permissions

Google is the default login. The verified Google account `help.justenginer@gmail.com` receives admin access. There is no site password; Google manages authentication. Every other signed-in account is a reader. Unverified email addresses never receive admin access.

Admin can create/edit/publish/draft/delete photo, video, social and blog posts; upload media; add demo records; hide/restore/delete comments; see website visits, views, likes, comments and most-viewed posts. Admin cannot edit Facebook/TikTok originals through this site, reset Google passwords, or manage other people's Google accounts. The role is currently fixed to the designated email; there is no arbitrary admin-role editor.

Readers can view published content, play videos, load social embeds, like/unlike, comment and copy links. They cannot publish, upload, moderate, view drafts or access analytics. Guests have a 30-second preview, then a login invitation; they can explicitly restart the preview. Public media URLs are not paywalled. Website counters are separate from Facebook/TikTok metrics and visitor counts are estimates.

The previous host's built-in ChatGPT login is unavailable on Vercel. The login screen discloses this under other options; it does not pretend to provide cross-host authentication. Enabling a real additional provider requires supported credentials and a verified flow.

## Media

For a new Video or Photo post, either paste a full Facebook/TikTok post link or upload a file. Uploading clears the link, and entering a link clears the upload selection. Published video/photo posts are routed to Videos/Gallery. Social players load when visible, request muted autoplay for videos, and retain an original-post link. TikTok photo posts use the photo player; Facebook photos use a post embed. Only public, embeddable social posts can display. Full canonical URLs are required; short share URLs must be opened and their full post address copied. Autoplay is a request and remains subject to browser/provider restrictions. Embedded-player view impressions count as website post views, not verified playback completions.


Demo photo: the supplied Facebook cover screenshot, copied into the project. Demo video: a six-second silent still-image MP4 created from that cover, explicitly described as a test clip rather than event footage. Demo blog: a bilingual welcome/testing post. No invented news, likes or comments are seeded.

Admin uploads use short-lived signed URLs directly to Supabase Storage to avoid Vercel request-body upload limits. Storage enforces a 20 MB maximum and allowed media types. Bucket URLs are public. Deleting a post deletes its associated likes/comments/views; the uploaded file is retained and can be removed through Supabase Storage. Storage cleanup UI is not implemented.

## Tests and live acceptance

`pnpm test` executes the production API handlers against a real embedded PostgreSQL engine with a test-only Supabase query adapter. It verifies role restrictions, email verification, guest preview expiry/restart, CSRF, drafts, CRUD, likes, comments, moderation, rate limiting, demos, metrics, database access permissions and upload signing validation. Auth identity and storage services are mocked; this does not prove real Google OAuth or cloud storage connectivity.

`pnpm build` builds the actual Next.js/Vercel target and checks TypeScript.

After account configuration, test on the deployed Vercel URL:
- Fresh guest → homepage/gallery/video/blog → preview expiry → login, and explicit preview restart.
- Google login with an ordinary account → like/unlike/comment → logout; deny `/admin` and write APIs.
- Google login with the designated admin → publish/edit/draft/delete → upload an image and MP4 → confirm stored playback and seeking after refresh.
- Hide/restore/delete a comment and verify public visibility and counts.
- Confirm expired-session refresh, account switching and sign-out.
- Check an actual public Facebook post and TikTok video. Provider privacy/embedding restrictions can prevent embeds; original links remain available.
- Check phone navigation, pagination, retries and persistent content across deployments.

Real provider sign-in, production uploads, deployed performance and load capacity cannot be marked passed until the required accounts are connected and the site is deployed. Free tiers are not a guarantee of unlimited traffic or reliability.
