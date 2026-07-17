# Deployment Checklist

## GitHub Pages

1. Upload the contents of this folder to the repository root.
2. Confirm `index.html` is directly in the root.
3. Open **Settings -> Pages**.
4. Select **Deploy from a branch**.
5. Select `main` and `/root`.
6. Save and wait for the live URL.

## Before Publishing

- Test the homepage on desktop and mobile.
- Confirm all eight technology logos load.
- Confirm the resume opens.
- Confirm project repository and live demo links work.
- Confirm Oracle and NPTEL certificate links open.
- Confirm credential search works.
- Do not expose passwords, AWS account identifiers, access keys, MFA details, GitHub tokens, or Supabase service-role keys.

## Admin Panel

The admin panel works in local preview mode immediately. For secure online updates, complete `ADMIN-SETUP.md`.


## Admin deployment check

After GitHub Pages finishes, open `/admin.html`. If it says Supabase is not configured, fill `assets/js/supabase-config.js`, commit, and wait for deployment.
