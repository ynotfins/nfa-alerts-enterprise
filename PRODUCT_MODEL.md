# NFA Alerts – Product Model (Roles, Chat, Favorites, Responded)

## Roles
- **Chaser**: default role for all new users.
- **Supe (Supervisor)**: field user who oversees *all* chasers and other supes, and also responds to alerts.
- **Super Admin**: a single account that can promote:
  - Chaser → Supe
  - Supe → Super Admin

## Alerts Visibility + Navigation
- All users (chasers + supes) can see **all alerts**.
- Alerts are geocoded; all users see distance-to-alert.
- On alert details, users can start navigation via Google Maps.

## Responding to Alerts
- When a user clicks **Respond**, that alert is added to that user’s **Favorites → Responded** list.
- In the **Supe** app, the Favorites → Responded list shows **all alerts any chaser or supe responded to**, including:
  - which user responded
  - timestamp of respond click

## Favorites Page Lists
Favorites page includes:
- Favorites
- Bookmarks
- Notes: alerts that the user created a note for (note creation adds the alert to this list)
- Responded:
  - Chaser view: only alerts that user responded to
  - Supe view: all responses across all users (chasers + supes), with responder + time

## Chat Semantics (CRITICAL)
Participants are determined by role pairing:

1) **Chaser ↔ Chaser**
- One-on-one thread

2) **Supe ↔ Supe**
- One-on-one thread

3) **Chaser ↔ Supe** OR **Supe ↔ Chaser**
- Always a “group thread”: {that chaser} + {ALL supes}
- This means:
  - If a chaser messages any supe → all supes are included
  - If a supe messages a chaser → all supes are included

## Location Visibility
- Supes can see live location of **all users** (chasers and supes).

## UX / Theming Preferences
- Users can choose theme presets in Profile settings:
  - Preset A: black background, orange/dark-orange primary, blue/green accents sparingly for toggles/buttons
  - Add 1–2 additional presets for personal taste
- Persist preference per user (profile field), not only localStorage.

## Admin Requirements
- Add a locked-down admin surface for super admin:
  - promote/demote roles
  - enforce server-side role boundaries (rules + server checks), not just UI
