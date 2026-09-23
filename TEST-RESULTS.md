# Verification — 23 September 2026

- Original backend before migration: 36 API checks passed.
- Vercel migration: 81 API requests passed against embedded PostgreSQL using the production handlers, plus redirect and direct database permission assertions. Identity/storage transport and the Supabase client boundary are replaced only in test modules.
- Next.js production build and TypeScript check passed.
- Demo MP4 generated: 6 seconds, 960×540, H.264/AAC; explicitly described as a silent still-image test clip.
- Browser: homepage and gallery navigation rendered; Google is visibly the primary login option. Gallery stayed at its loading state in the supervised development preview; full browser acceptance is not passed.
- The browser security policy rejected the native preview-restart form click. No workaround was attempted. Backend preview restart tests passed, but browser confirmation remains open.
- Real Google sign-in, refresh/logout, production media upload/playback, and live Vercel tests are pending account configuration. No deployment has been completed for this migration.

Do not interpret local API checks as proof that every live button works. Finish the deployment acceptance checklist in DEPLOYMENT.md before launch.

- Upload-or-link update: Video/Photo social links, section placement, unsafe URL rejection and embed URL generation passed backend tests. Autoplay and live third-party embedding remain unverified in production.
