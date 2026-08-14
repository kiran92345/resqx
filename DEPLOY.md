## Deploy frontend on Vercel

1. Import the GitHub repo: https://github.com/kiran92345/resqx
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

The included `vercel.json` enables SPA routing so `/user` and `/admin` work on mobile when opened directly.

### If the site works on laptop but not phone

- Clear browser cache on the phone (or open in **Private/Incognito**)
- Redeploy after pulling the latest commit (mobile fixes + `vercel.json`)
- Ensure you open the **https://** URL (not http)
- On first load, tap **Demo User App** — the login screen should appear

### Optional env vars (Vercel → Settings → Environment Variables)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_ENABLE_WS` | `false` | Disable WebSocket retries when backend is not deployed |
