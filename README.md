# Valentine Property & Garden Care — website

A static, responsive, bilingual (English / Norsk bokmål) website. No build step, no dependencies.

## Files

```
index.html            All page structure and sections (Home, About, Services, Gallery, Why Choose Us, Contact)
css/styles.css        All styling: colours, typography, layout, animations, responsive rules
js/translations.js    Every piece of text in English (en) and Norwegian (no)
js/main.js            Language switcher, mobile menu, scroll animations, gallery filter/lightbox, quote form
images/*.svg          Illustrations for hero, services and gallery + favicon
```

## Run it

- **Quickest:** double-click `index.html` to open it in a browser.
- **Local server (recommended):** in this folder run `python3 -m http.server 8000`, then open http://localhost:8000
  (or `npx serve .` if you have Node.js).
- **Deploy:** upload the whole folder to any static host — Vercel, Netlify, GitHub Pages or a normal web host.
  On Vercel: push the folder to a GitHub repo → "Add New Project" → import the repo → Framework preset "Other" → Deploy.

## Common edits

| What | Where |
|---|---|
| Any text (both languages) | `js/translations.js` — same key in `en` and `no` |
| Phone number | search for `4740301243` and `403 01 243` in `index.html`, plus `PHONE` in `js/main.js` |
| Location (currently Oslo) | `contact.location` in `js/translations.js`, `hero.eyebrow`, `about.badge`, `why.w6*`, `footer.tagline`, meta texts |
| Colours / fonts | variables at the top of `css/styles.css` (`--forest`, `--sage`, …) |
| Images | replace files in `images/` — see below |

## Images

The current images are custom illustrations made for this site (no stock licences needed).
For the most genuine result, replace them with **your own photos of real jobs**:
save each as e.g. `images/hero.jpg` and change the matching `src="images/hero.svg"` in `index.html`.
Recommended sizes: hero 1920×1200, cards/gallery 1200×900, compressed to under ~300 KB each.

## Quote form

The site has no server, so the form validates the request and then offers **“Send by SMS”** (opens the
visitor's messaging app with the request pre-filled to +47 403 01 243), **call**, or **copy text**.
To receive requests by email instead, connect a form service (e.g. Formspree, Netlify Forms, Web3Forms)
in the `submit` handler in `js/main.js`.

## Content notes

No testimonials, certifications, awards, years in business or registration details are included.
The “Why choose us” points are service promises — check they match how you work before going live.
Before launch, add your organisation number (org.nr.) and an email address in the footer if you have them,
and a privacy note for the form, as is usual for Norwegian businesses.

Language: detects Norwegian browsers automatically, otherwise English; the visitor's choice is remembered.
