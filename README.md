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
- Publicados:
  - Modo local (default): JSON en `.data/published-documents.json`
  - Serverless fallback: `/tmp/sumar-proposal-builder-data/published-documents.json` (no persistente entre invocaciones)
  - Modo persistente recomendado para Vercel: Supabase (`src/lib/server/repositories/supabase-repo.ts`)
- Variables opcionales:
  - `PUBLISHED_DOCUMENTS_DATA_DIR`: carpeta de persistencia para modo JSON local
  - `SUPABASE_URL` (o `NEXT_PUBLIC_SUPABASE_URL`): URL del proyecto Supabase (activa modo Supabase)
  - `SUPABASE_SERVICE_ROLE_KEY`: service role key de Supabase
    - aliases aceptados: `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_KEY`
  - `SUPABASE_PUBLISHED_DOCUMENTS_TABLE`: tabla (default `published_documents`)

### Supabase (recomendado en Vercel)

Crear una tabla `published_documents` (o el nombre que uses en `SUPABASE_PUBLISHED_DOCUMENTS_TABLE`) con estas columnas mínimas:

- `slug` (`text`, primary key)
- `data` (`jsonb`, not null)
- `created_at` (`timestamptz`, not null)
- `updated_at` (`timestamptz`, not null)
- `status` (`text`, not null, valor esperado: `published`)

Si `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` están definidos, la app usa Supabase automáticamente y evita los `404` por pérdida de datos en filesystem serverless.

En Vercel, si la configuración de Supabase está incompleta, la API falla explícitamente (500) en vez de caer a persistencia local efímera.
