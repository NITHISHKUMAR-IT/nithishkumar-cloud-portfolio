# Nithishkumar K - Cloud & DevOps Portfolio

A premium, Apple-inspired Cloud and DevOps engineering portfolio with real technology logos, aligned product-style storytelling, dynamic projects, a searchable credential library, and a secure admin architecture.

## Key Features

- Premium product-style visual design
- Real Python, Linux, AWS, Azure, Google Cloud, Terraform, Docker, and GitHub logos
- Stable responsive grids instead of misaligned horizontal slides
- Dynamic profile, skills, projects, and credential content
- Secure Supabase email/password admin login
- Postgres Row Level Security for admin-only writes
- Certificate PDF and image uploads through Supabase Storage
- Local preview mode with JSON import/export
- Dedicated credential library
- Resume and professional contact links
- GitHub Pages compatible

## Important Architecture Note

GitHub Pages is static hosting. A real password-protected admin panel that updates all visitors requires a backend. This project therefore supports:

1. **Supabase online mode** - secure authentication, live data, and file uploads.
2. **Local preview mode** - browser-only testing and JSON backup; not a production admin system.

## New Credentials Included

- Oracle Dev Gym - Databases for Developers: Foundations - 97%
- NPTEL - Human Computer Interaction - 91%

## Project Structure

```text
nithishkumar-cloud-pro-v5/
├── index.html
├── credentials.html
├── admin.html
├── ADMIN-SETUP.md
├── supabase-setup.sql
├── README.md
├── DEPLOYMENT.md
├── favicon.svg
└── assets/
    ├── css/
    │   ├── styles.css
    │   └── admin.css
    ├── data/
    │   └── default-content.js
    ├── js/
    │   ├── supabase-config.js
    │   ├── data-store.js
    │   ├── ui-helpers.js
    │   ├── main.js
    │   ├── credentials.js
    │   └── admin.js
    ├── images/
    │   ├── badges/
    │   └── certificates/
    └── documents/
        ├── Nithishkumar_K_Resume.pdf
        └── certificates/
```

## Preview

Open `index.html` with VS Code Live Server. Use `admin.html` to test local preview mode.

## Secure Admin Setup

Follow `ADMIN-SETUP.md` and run `supabase-setup.sql`.

## Deployment

Deploy the repository root through GitHub Pages. After configuring Supabase, the admin panel can update projects and credentials without a website redesign.
