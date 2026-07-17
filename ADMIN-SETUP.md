# Secure Portfolio Admin Setup

The public portfolio is hosted as static files, but the admin panel uses Supabase for secure authentication, live content updates, database storage, and certificate uploads.

## Why a backend is required

A password written directly inside HTML or JavaScript is visible to anyone who opens the public source code. GitHub Pages also cannot permanently save browser form submissions by itself. Supabase Auth and Row Level Security solve both problems.

## 1. Create a Supabase project

Create a project and keep the region close to your primary audience.

## 2. Create the database and storage rules

Open **SQL Editor**, paste the complete contents of `supabase-setup.sql`, and run it.

This creates:

- `site_profile`
- `skills`
- `projects`
- `credentials`
- `admins`
- Public read policies
- Admin-only write policies
- Public `portfolio-assets` storage bucket
- Admin-only upload, update, and delete policies

## 3. Create your admin login

Open:

```text
Authentication -> Users -> Add user
```

Create your account using your professional email and a strong, unique password.

Disable public user sign-up in the Supabase Auth settings because this portfolio needs only one administrator.

## 4. Authorize your account

Copy the new user's UUID and run:

```sql
insert into public.admins (user_id)
values ('PASTE-YOUR-AUTH-USER-UUID-HERE');
```

## 5. Connect the website

Open:

```text
assets/js/supabase-config.js
```

Add the Project URL and anon/publishable key:

```javascript
window.SUPABASE_CONFIG = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-OR-PUBLISHABLE-KEY",
  storageBucket: "portfolio-assets"
};
```

The anon/publishable key is designed for browser use when Row Level Security is configured. Never use a service-role key in this public repository.

## 6. Seed the existing portfolio data

Open the deployed `/admin.html`, sign in, choose **System**, and click:

```text
Seed current portfolio data
```

The current profile, eight skills, projects, AWS credentials, Oracle certificate, and NPTEL certificate will be inserted into Supabase.

## 7. Add future content

From the admin panel you can:

- Add or edit projects
- Add GitHub repository links
- Add live demo links
- Upload certificate PDFs
- Upload certificate preview images
- Mark credentials for the homepage
- Add or reorder skills
- Update profile and contact details

New online content appears on the portfolio without recreating the website.

## Security Rules

- Use a strong, unique Supabase password.
- Keep self-sign-up disabled.
- Do not commit service-role keys.
- Do not commit AWS access keys, passwords, MFA secrets, or GitHub tokens.
- Keep RLS enabled on every exposed table.
