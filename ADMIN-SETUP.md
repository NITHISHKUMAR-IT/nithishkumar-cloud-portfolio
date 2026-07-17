# Portfolio Admin Setup — Email OTP

The public portfolio runs on GitHub Pages. The admin panel uses Supabase Auth, Postgres, Storage, and Row Level Security so updates can be published without editing HTML.

## Admin URL

```text
https://nithishkumar-it.github.io/nithishkumar-cloud-portfolio/admin.html
```

The Admin link is shown in the website navigation and opens `/admin.html`. Authentication and Row Level Security still protect all admin operations.

## Authentication Model

- Authorised email: `nithishdev29@gmail.com`
- Username: not used
- Password: not used
- Login method: numeric one-time code sent by email
- Real write protection: Supabase Row Level Security

Email OTP is passwordless authentication. It is not a second authentication factor by itself.

## 1. Create a Supabase Project

Create a project at Supabase and keep the database password secure. The database password is never placed in website files.

## 2. Run the Database Setup

Open:

```text
Supabase Dashboard → SQL Editor
```

Run the complete `supabase-setup.sql` file.

This creates:

- `admins`
- `site_profile`
- `skills`
- `projects`
- `credentials`
- `portfolio-assets` Storage bucket
- Public read policies
- Admin-only write policies

## 3. Create the Authorised User

Open:

```text
Authentication → Users → Invite user
```

Invite:

```text
nithishdev29@gmail.com
```

Complete the invitation from Gmail. Then copy the user UUID from the Supabase Users page.

Run this in the SQL Editor:

```sql
insert into public.admins (user_id)
values ('PASTE-AUTH-USER-UUID-HERE')
on conflict (user_id) do nothing;
```

## 4. Configure the Email OTP Template

Open:

```text
Authentication → Email Templates → Magic Link
```

Use a template containing the token:

```html
<h2>Portfolio Admin Verification Code</h2>
<p>Use this one-time code to access the admin panel:</p>
<h1>{{ .Token }}</h1>
<p>If you did not request this code, ignore this email.</p>
```

If the template uses `{{ .ConfirmationURL }}`, Supabase sends a magic link instead of a numeric OTP.

## 5. Disable Public Sign-up

After the administrator user exists, disable public user registration in Supabase Auth settings. The website also uses `shouldCreateUser: false`, so unknown emails are not created by the login form.

## 6. Configure the Public Browser Key

Open:

```text
Project Settings → API
```

Edit:

```text
assets/js/supabase-config.js
```

Add only:

```javascript
window.SUPABASE_CONFIG = {
  url: "YOUR_PROJECT_URL",
  anonKey: "YOUR_PUBLISHABLE_OR_ANON_KEY",
  storageBucket: "portfolio-assets"
};
```

Never put the service-role key in a public file.

## 7. Configure Site URL

Set the Supabase Auth Site URL to:

```text
https://nithishkumar-it.github.io/nithishkumar-cloud-portfolio/
```

The current numeric-code flow does not depend on a redirect, but keeping the Site URL correct is recommended.

## 8. Deploy and Sign In

Upload the changed files to GitHub and wait for GitHub Pages deployment.

Open:

```text
/admin.html
```

Select **Send one-time code**, enter the email OTP, and continue.

## 9. Publish Starter Content Once

After the first successful login, open Dashboard and select:

```text
Publish starter content
```

This copies the bundled profile, skills, projects, and credentials into Supabase. After this step, future admin edits update the public website for all visitors.

## 10. Update Content

The admin panel supports:

- Profile and contact updates
- Resume PDF upload
- Skills and logo upload
- Projects and repository links
- Project image upload
- Certificates and badge image upload
- Featured ordering
- Delete and edit actions

## Security Rules

- Never commit the service-role key.
- Never store an admin password in HTML or JavaScript.
- Keep RLS enabled.
- Do not remove the `admins` UUID check from policies.
- OTP email access depends on the security of the Gmail account.
- Enable MFA on the Gmail account itself.
