# Changelog

## V5.5 — Admin Navigation Restored
- Restored the visible `Admin` shortcut inside the main portfolio navigation.
- Added the same Admin shortcut to the credentials page.
- Kept the admin page at `admin.html` with OTP authentication and Supabase RLS protection.
- Corrected documentation that previously said the Admin link was hidden.

## V5.4 — Previous SVG Logos Restored
- Removed the uploaded JPG/PNG skill icons.
- Restored the earlier Devicon SVG logos for AWS, Python, Linux, Docker, GitHub, Azure, Google Cloud, and Terraform.
- Added compatibility handling so cached local skill-image paths also fall back to the restored SVG logos.
- Bumped the local content cache key to ensure the corrected logos appear after deployment.

# Portfolio V5 Changes

## Visual Improvements

- Replaced letter-based skill icons with real technology SVG logos.
- Replaced the “Nithishkumar K presents” line with a personal introduction.
- Rebuilt the hero skill device with equal grid tracks and consistent card dimensions.
- Replaced horizontally moving highlight slides with a stable responsive grid.
- Removed uneven badge offsets and rebuilt the credential showcase as an equal 3 x 2 grid.
- Added real technology logo clusters to highlights, skill stories, dashboard, and project visuals.
- Reduced unnecessary rotations and improved frame alignment across project and resume sections.

## Dynamic Content

- Added data-driven profile, skill, project, and credential rendering.
- Added `admin.html` for profile, skills, projects, repositories, certificates, and badges.
- Added secure Supabase email/password authentication support.
- Added Row Level Security schema and admin-only write policies.
- Added Supabase Storage support for certificate PDFs and preview images.
- Added local preview mode with password, JSON export, and JSON import.

## New Credentials

- Oracle Dev Gym - Databases for Developers: Foundations - 97%.
- NPTEL - Human Computer Interaction - 91%.


## V5.1 Clean Visual Update

- Removed the duplicate Cloud Pro product-navigation strip.
- Removed visible skill names, subtitles, status pills, device header, device footer, and stage caption from the hero visual.
- Kept accessible skill names through aria-label and screen-reader text.
- Re-centred and enlarged all eight technology logos.
- Retained actual project titles because they are essential portfolio content.

## 5.3

- Replaced external skill icons with user-provided local logo assets.
- Added sequential logo-entry animation.
- Replaced admin authentication with email OTP only.
- Removed local password authentication code.
- Added secure Supabase CRUD and Storage uploads.
- Added starter-content publishing workflow.
- Added resume and project-image uploads.
- Updated RLS and Storage policies.
- Removed public Admin links and obsolete admin assets.
