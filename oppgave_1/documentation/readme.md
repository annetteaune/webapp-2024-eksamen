# Eksamen - webapp 2024 - Del 1

## 1: API-endepunkter

- `/kurs` - Håndterer all funksjonalitet relatert til kurs og tilknyttede leksjoner
- `/kategorier` - Håndterer tilgjengelige kategorier for kurs
- `/brukere` - Håndterer brukerinformasjon og registrering
- `/kommentarer` - Håndterer henting og posting av kommentarer i leksjoner

## 2: HTTP-verb og respons

### /kurs

#### -GET

- **Formål:** Hente alle tilgjengelige kurs med deres leksjoner
- **Respons:** `[{ id, title, slug, description, category, lessons: [...] }]`
- **Statuskoder:**
  - 200: OK
  - 500: Internal Server Error

#### POST

- **Formål:** Opprette nytt kurs
- **Data:** `{ title, slug, description, category }`
- **Respons:** `{ success: true, data: { id, title, slug, description, category, lessons: [] } }`
- **Statuskoder:**
  - 201: Created
  - 400: Bad Request
  - 500: Internal Server Error

### /kurs/:slug

#### GET

- **Formål:** Hente detaljer om ett spesifikt kurs med tilhørende leksjoner
- **Respons:** `{ id, title, slug, description, category, lessons: [...] }`
- **Statuskoder:**
  - 200: OK
  - 404: Not Found
  - 500: Internal Server Error

#### PATCH `/kurs/:slug/category`

- **Formål:** Oppdatere kategori for et kurs
- **Data:** `{ category: string }`
- **Respons:** `{ success: true, data: { id, title, slug, description, category, lessons: [...] } }`
- **Statuskoder:**
  - 200: OK
  - 404: Not Found
  - 500: Internal Server Error

#### DELETE

- **Formål:** Slette et kurs og tilknyttede leksjoner
- **Respons:** `{ success: true }`
- **Statuskoder:**
  - 200: OK
  - 500: Internal Server Error

### /kategorier

#### GET

- **Formål:** Hente liste over alle tilgjengelige kategorier
- **Respons:** `[{ id: string, name: string }]`
- **Statuskoder:**
  - 200: OK
  - 500: Internal Server Error

#### POST

- **Formål:** Opprette ny kategori
- **Data:** `{ name: string }`
- **Respons:** `{ success: true, data: { id: string, name: string } }`
- **Statuskoder:**
  - 201: Created
  - 400: Bad Request
  - 500: Internal Server Error

### /brukere

#### GET

- **Formål:** Hente liste over alle brukere
- **Respons:** `[{ id: string, name: string, email: string }]`
- **Statuskoder:**
  - 200: OK
  - 500: Internal Server Error

#### POST

- **Formål:** Registrere ny bruker
- **Data:** `{ name: string, email: string }`
- **Respons:** `{ success: true, data: { id: string, name: string, email: string } }`
- **Statuskoder:**

  - 201: Created
  - 400: Bad Request
  - 500: Internal Server Error

  ### /kommentarer

#### GET `/kommentarer/:lessonSlug`

- **Formål:** Henter en leksjons tilknyttede kommentarer
- **Response:** `[{ id, createdBy: { id, name }, comment, lesson: { slug }, createdAt }]`
- **Statuskoder:**
  - 200: OK
  - 500: Internal Server Error

#### POST `/kommentarer`

- **Formål:** Opprett ny kommentar
- **Data:** `{ comment: string, createdById: string, createdByName: string, lessonSlug: string }`
- **Response:** `{ success: true, data: { id, createdBy: { id, name }, comment, lesson: { slug }, createdAt } }`
- **Statuskoder:**
  - 201: Created
  - 400: Bad Request
  - 500: Internal Server Error

## 3: URL-er og Sidestruktur

### / (Landingsside)

- Ny bruker-registrering
- Innloggingsskjema
- Bruker POST `/brukere` for registrering
- Navigasjon til andre sider

### /kurs

- Viser oversikt over alle tilgjengelige kurs
- Mulighet for filtrering basert på kategori
- Bruker:
  - GET `/kurs` for kursliste
  - GET `/kategorier` for filtreringsalternativer
  - GET `/brukere` for å vise påmeldte brukere

### /kurs/:slug

- Viser detaljert informasjon om ett spesifikt kurs
- Liste over kursets leksjoner
- Viser påmeldte brukere
- Bruker:
  - GET `/kurs/:slug` for kursdetaljer
  - GET `/brukere` for å vise påmeldte brukere

### /kurs/:slug/:lessonSlug

- Viser innhold for en spesifikk leksjon
- Viser kommentarer tilknyttet nåværende leksjon
- Viser deltakerliste
- Bruker:
  - GET `/kurs/:slug` for leksjonsdata
  - GET `/brukere` for deltakerliste
  - GET `/kommentarer/:lessonSlug` for å hente kommentarer
  - POST `/kommentarer` for å opprette nye kommentarer

### /ny

- Skjema for å opprette nytt kurs
- Legge til leksjoner til kurset
- Velge kategori fra eksisterende kategorier
- Bruker:
  - POST `/kurs` for å opprette kurs
  - GET `/kategorier` for kategorivalg
- Flertrinnsskjema:
  1. Kursinformasjon
  2. Legge til leksjoner
  3. Publisering
