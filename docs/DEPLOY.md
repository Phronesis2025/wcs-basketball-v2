# WCSv2.0 Deployment

## Steps

1. Push to GitHub[](https://github.com/Phronesis2025/wcs-basketball-v2).
2. Import to Vercel: Add new project, select repo.
3. Set env vars in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Deploy: Click "Deploy", wait for URL (e.g., wcs-basketball-v2.vercel.app).

## Troubleshooting

- **Build Fail**: Check Vercel logs, rerun `npm run build` locally.
- **404**: Verify paths, redeploy.
- **Env Vars**: Ensure no extra spaces in `.env.local`.

## Current URL

[Insert Vercel URL after deployment]
