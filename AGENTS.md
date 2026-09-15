# Repository Instructions

## Weekly authoring

- Every new Weekly issue must be derived from `archetypes/weekly.md`. Treat that file as the canonical Weekly content template; do not copy an older issue as an informal replacement.
- Create each issue as a Hugo page bundle at `content/weekly/<issue>/index.md`. The standard command is `hugo new --kind weekly weekly/<issue>/index.md`.
- Preserve the existing Weekly layout, typography, spacing, and image proportions unless the user explicitly requests a redesign.
- Fill `issue` with the issue number and `interval` with the Monday-to-Sunday range covered by the issue, formatted like `2026.09.07–09.13`.
- Name the selected homepage and article header image `cover.jpg`, `cover.jpeg`, or `cover.png`. The layouts automatically crop it to 800×480 on the Weekly index and 1320×702 on the article page.
- Insert body photos with the `weekly-photo` shortcode. Its default `landscape` variant produces a 1000×667 (3:2) image.
- Insert tool screenshots and other wide images with `variant="wide"`; this produces a 1200×675 (16:9) image.
- Use the shortcode's `anchor` option when a crop needs adjustment. Supported values include `Center`, `Top`, `Bottom`, `Left`, and `Right`.
- Provide meaningful `alt` and `caption` values for every image. For externally sourced images, also provide `credit` and `credit_url` and prefer an official source.
- If the cover image must also appear in the article body, keep a second copy with a descriptive filename and reference that copy in the body.
- Keep new issues as `draft: true` until their content and images are complete. Before publishing, change them to `draft: false`, run a full Hugo build, and confirm the Weekly index and issue page both render successfully.
