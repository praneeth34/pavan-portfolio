# Pavan Portfolio (React + TypeScript)

A cinematic photographer portfolio inspired by the visual style of `stomproductions.com` and password-protected event workflow similar to `aharshephotography.com/info`.

## What is implemented

- Public landing page with parallax camera-lens zoom effect.
- Event folders shown as thumbnail cards.
- Password prompt per event before gallery access.
- Temporary admin route at `/admin`.
- Admin can create/update/delete events, set event passwords, change thumbnails, and upload images (URL or local file).
- Local-first data storage using `localStorage` for free development.

## Local run

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Temporary admin credentials

- Username: `admin`
- Password: `admin`

These are intentionally basic for local development and should be replaced before deployment.

## Local data model

- Event fields: `name`, `slug`, `description`, `thumbnail`, `password`, `images`.
- Stored in browser `localStorage` so everything works without backend costs.

## Storage path for deployment (Firebase-first)

For now, this app is local-only. During deployment, move media and auth to Firebase:

1. **Firebase Storage** for original images + generated thumbnails.
2. **Firestore** for event metadata and password hash (never store plain password).
3. **Cloud Functions** to validate event passwords and return short-lived signed media URLs.
4. Keep storage objects private and serve via token-gated URLs only after successful password check.

## Pricing guidance (quick view)

- With your current size (<10GB), Firebase can be very low/no cost initially.
- As traffic and media grow, **egress/download costs** usually increase faster than pure storage cost.
- If volume becomes high, evaluate moving to S3 or Azure Blob + CDN for stronger long-term cost control.

## Important note

Because this is local-first, event passwords are currently stored in local browser data for demo speed. Before production, migrate to server-side validation with hashed passwords.
