# Fresh Catch Backend Architecture

## Current Decision

Fresh Catch will use one shared backend for Android, iOS, and web.

```txt
Expo Android / Expo iOS / Expo Web
        |
        | HTTPS
        v
Supabase
  - Auth
  - Postgres database
  - Storage
  - Edge Functions
```

## Frontend Hosting

The Expo web app should be deployed with EAS Hosting.

Mobile apps will be built separately as Android/iOS binaries through EAS Build or local native builds. The installed mobile app will connect to the same production Supabase project and backend endpoints as the web app.

## Backend Platform

Use Supabase for the first production backend:

- Supabase Auth for user login/signup
- Supabase Postgres for app data
- Supabase Storage for images and files
- Supabase Edge Functions for custom backend logic
- Row Level Security for database protection

The mobile and web apps should use Supabase publishable client keys only. Secret keys, OpenAI keys, payment secrets, and admin operations must stay inside server-side code.

## Custom Backend Logic

Start with Supabase Edge Functions written in TypeScript.

Good first use cases:

- server-driven UI schemas
- auth-related backend logic
- saving and reading user preferences
- product catalog helpers
- cart and order validation
- payment webhooks
- small OpenAI calls
- simple AI recommendations

Example future endpoint:

```txt
https://<project-ref>.supabase.co/functions/v1/auth-schema
```

## AI Agent Plan

Supabase Edge Functions are fine for small AI tasks and simple OpenAI calls.

If AI features become long-running, tool-heavy, queue-based, or require advanced agent orchestration, add a separate TypeScript AI backend/worker later.

Future shape:

```txt
Expo app / Web app
        |
        v
Supabase Auth / DB / Storage
        |
        v
Supabase Edge Functions
        |
        v
Optional TypeScript AI worker for complex agents
```

Do not call OpenAI directly from the mobile app. The app should call your backend, and the backend should call OpenAI.

## Recommended Path

1. Set up Supabase project.
2. Add Supabase Auth to the Expo app.
3. Store user preferences in Postgres.
4. Move server-driven UI JSON into a Supabase Edge Function.
5. Add product catalog, cart, and order tables.
6. Use Supabase Storage for product images.
7. Add simple AI features through Edge Functions.
8. Add a separate TypeScript AI worker only if Edge Functions become too limited.

## Why This Architecture

This keeps the first production system simple and low-cost while leaving room to grow.

You avoid managing a separate backend server at the beginning, but you still keep sensitive logic on the server side. Android, iOS, and web all share the same backend and database, which makes the app easier to maintain.
