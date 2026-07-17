# Nithishkumar K — Cloud & DevOps Portfolio

A premium, responsive Cloud and DevOps engineering portfolio with local technology logos, AWS projects, a credential library, and a Supabase-backed passwordless admin panel.

## Features

- Premium product-style interface
- Local Python, Linux, AWS, Azure, Google Cloud, Terraform, Docker, and GitHub logo assets
- Sequential hero logo entry animation
- Dynamic profile, skills, projects, and credentials
- GitHub project and live deployment links
- Searchable credential library
- Resume and certificate PDFs
- Email OTP-only admin authentication
- Supabase Postgres and Storage
- Row Level Security for admin-only writes
- Responsive mobile and desktop layouts
- GitHub Pages-compatible public frontend

## Admin Authentication

The admin panel does not use a username or password.

```text
Authorised email: nithishdev29@gmail.com
Login method: numeric email OTP
Admin path: /admin.html
```

Supabase configuration is required before the admin panel can sign in or persist changes.

## Project Structure

```text
├── index.html
├── credentials.html
├── admin.html
├── supabase-setup.sql
├── ADMIN-SETUP.md
├── assets/
│   ├── css/styles.css
│   ├── data/default-content.js
│   ├── documents/
│   ├── images/
│   │   ├── badges/
│   │   ├── certificates/
│   │   └── skills/
│   └── js/
│       ├── credentials.js
│       ├── data-store.js
│       ├── main.js
│       ├── supabase-config.js
│       └── ui-helpers.js
└── README.md
```

## Local Preview

Use VS Code Live Server or another local HTTP server. Opening the files directly can limit browser storage or module behaviour.

## Supabase Setup

Follow `ADMIN-SETUP.md` exactly.

## Deployment

Deploy the repository root using GitHub Pages:

```text
Settings → Pages → Deploy from a branch → main → /root
```

## Security

- The publishable/anon key can be used in the browser when RLS is correct.
- The service-role key must never be committed.
- Public data is readable; only the authorised admin UUID can write.
- The public Admin navigation link is intentionally removed.
