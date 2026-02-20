# Jade Resume Editor

Vue 3 + Vite + Tailwind CSS resume editor with PDF export.

## Setup

```bash
npm install
```

Place your profile photo at `public/JadeResume.png` (or update the image `src` in `src/components/ResumeEditor.vue`).

## Develop

```bash
npm run dev
```

## Build

```bash
npm run build
```

## PDF Export

The app uses [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) to generate PDFs from the resume HTML. When running via `npm run dev`, the profile image is served from the same origin, which avoids CORS/tainted canvas issues. If PDF export fails, the app falls back to the browser print dialog (choose "Save as PDF").
