# Sumar Proposal Builder (MVP)

Webapp Next.js para generar propuestas comerciales con identidad Sumar.

## Incluye

- Builder en `/builder` con split view (configuración + preview)
- Template lockeado (sin edición libre de layout/estilo)
- Importación de notas desde `.pdf` o `.docx` con resumen automático
- Publicación en link público `/p/[slug]`
- Exportación PDF vía Playwright en `/api/pdf/[slug]`
- Autosave local en `localStorage`
- Persistencia local de publicados en `.data/published-documents.json`
- Modo `Manual` visible como placeholder (`En desarrollo`)

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Zod
- Playwright

## Cómo correr

1. Instalar dependencias:

```bash
npm install
```

2. Instalar Chromium para Playwright (obligatorio para PDF):

```bash
npx playwright install chromium
```

3. Levantar entorno de desarrollo:

```bash
npm run dev
```

4. Abrir:

- Builder: [http://localhost:3000/builder](http://localhost:3000/builder)

## Flujo MVP

1. Editar cliente, tipo de documento, propuestas y notas IA en `/builder`.
2. (Opcional) subir un Word/PDF en el bloque de notas para extraer y resumir contenido anterior.
3. `Generar Link` crea un slug y guarda el documento publicado.
4. Abrir link público (`/p/[slug]`) para compartir.
5. `Exportar PDF` genera y descarga el PDF del mismo documento.

## Endpoints

- `POST /api/publish`
  - Request: `{ data: DocumentData }`
  - Response: `{ slug, url, status: 'published' }`
  - Responde `422` para `docType = manual`

- `POST /api/ai/file-summary`
  - Request: `multipart/form-data` con `file` (`.pdf` o `.docx`, máx. 12MB)
  - Response: `{ fileName, extractedCharacterCount, summary }`
  - Responde `422` si no se detecta texto utilizable (ejemplo: PDF escaneado sin OCR)

- `GET /api/pdf/[slug]`
  - Devuelve PDF (`application/pdf`)
  - `404` si slug no existe
  - `409` si el documento no es publicable (manual)

## Estructura clave

- `src/app/builder/page.tsx`
- `src/components/builder/BuilderLayout.tsx`
- `src/components/builder/ConfigPanel.tsx`
- `src/components/document/DocumentPreview.tsx`
- `src/components/document/ProposalDocument.tsx`
- `src/app/p/[slug]/page.tsx`
- `src/components/public/PublicDocPage.tsx`
- `src/app/api/publish/route.ts`
- `src/app/api/pdf/[slug]/route.ts`
- `src/store/builder-store.ts`
- `src/lib/server/repositories/local-json-repo.ts`

## Notas de persistencia

- Draft editor: `localStorage` (`sumar-proposal-builder-draft-v1`)
- Publicados: JSON local en `.data/published-documents.json`
- Se dejó stub para migración futura a Supabase:
  - `src/lib/server/repositories/supabase-repo.ts`
