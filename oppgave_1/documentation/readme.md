# Eksamen - webapp 2024 - Del 1

### TODO: brukere? ikke klargjort for i eksisterende kode

## 1: API-endepunkter

- **/kurs** - For å hente alle kurs eller opprette et nytt kurs

- **/kurs/:slug** - For å hente et spesifikt kurs basert på slug

- **/leksjon/:slug** - For å hente informasjon om en spesifikk leksjon i et kurs

## 2: HTTP-verb

### /kurs

- **GET:** Hente alle tilgjene kurs
- **POST:** Opprette nytt kurs

### /kurs/:slug

- **GET:** Hente detaljer/leksjoner for ett spesifikt kurs

### /leksjon/:slug

- **GET:** Hente en spesifik leksjon

## 3: Respons

| Endepunkt        | Metode | Respons                                          | Statuskoder   |
| ---------------- | ------ | ------------------------------------------------ | ------------- |
| `/kurs`          | GET    | Liste over kurs (`[{ id, title, slug, ... }]`)   | 200, 500      |
| `/kurs`          | POST   | Bekreftelse på opprettelse (`{ success: true }`) | 201, 400, 500 |
| `/kurs/:slug`    | GET    | Kursdetaljer (`{ id, title, lessons: [...] }`)   | 200, 404, 500 |
| `/leksjon/:slug` | GET    | Leksjonsdetaljer (`{ title, text, comments }`)   | 200, 404, 500 |

### 3.1 Statuskoder

| Statuskode | Betydning                                             |
| ---------- | ----------------------------------------------------- |
| **200**    | OK – Forespørselen var vellykket, og data returneres  |
| **201**    | Created – Ny ressurs ble opprettet vellykket          |
| **400**    | Bad Request – Forespørselen inneholdt ugyldige data   |
| **404**    | Not Found – Den etterspurte ressursen ble ikke funnet |
| **500**    | Internal Server Error – En feil oppstod på serveren   |

## URL-er

- **/**: Landingsside. Viser
- **/kurs:** Viser en oversikt over alle kurs. Mulig å filtrere basert på kategori
- **/kurs/:slug:** Viser detaljer om kurset og en liste over leksjoner. Brukeren kan velge en leksjon for detaljer
- **/kurs/:slug/:leksjon:** Viser detaljer for en leksjon i et kurs og lar brukere legge til kommentarer
- **/ny:** Side for å opprette et nytt kurs med tittel, beskrivelse, og leksjoner. Denne siden sender en POST-forespørsel til /kurs for å lagre kursdata
