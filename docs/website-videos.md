# Website video management

Business admin > Videos (/admin?tab=videos) manages Services videos. Add a title and HTTPS YouTube/Vimeo share URL, choose all services or one service, set display order, and save as draft or publish. Lower numbers appear first. Edit / preview replaces a link or title. Hide returns it to draft; Remove archives the record without deleting the hosted video. Restore through Edit. Blog videos stay inside their articles; course videos stay in Learning admin.

After deployment, use Import original Services video as draft to retain the existing link, review it, then publish. The hardcoded shared player is removed. No published records means no Services video; no production content is automatically published or changed by this PR.

Only links are stored. External players load after a click. The backend validates recognized HTTPS video URLs and service placements, checks business-admin permissions and record versions. Public API exposes only published records. Firestore writes are server-only, so no new client rules or paid Firebase services are required.

Validation covers authentication, permissions, draft/publish/replace/hide/archive, stale edits and unsafe URLs. Local browser tests use staging Firebase and the new local API; production content/payments are untouched. The privacy banner also sits below dialogs so it cannot cover editor buttons.
