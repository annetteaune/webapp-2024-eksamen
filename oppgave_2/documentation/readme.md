# Oppgave 2

## 1: Wireframes

[Se Wireframes(PDF)](./files/wireframes.pdf)

Wireframes samsvarer ikke 100% med den endelige prototypen men setter grunnlaget for dataflyt og nødvendige ressurser.

## 2,3,4: Endepunkter, verb og responser:

### /events - alle arrangementer

| Verb | Formål                                                                 | Respons                        | Statuskoder                                                             |
| ---- | ---------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------- |
| GET  | Hente alle arrangementer, mulighet for filtrering basert på parametere | Array med arrangement-objekter | 200: Success<br>500: Server error                                       |
| POST | Opprette nytt arrangement                                              |                                | 201: Created successfully<br>400: Validation error<br>500: Server error |

### /events/:slug

| Verb | Formål                                                                            | Respons                       | Statuskoder                                               |
| ---- | --------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------- |
| GET  | Henter et arrangement basert på slug, som gir en penere url enn å hente ut med id | Ett enkelt arrangement-objekt | 200: Success<br>404: Event not found<br>500: Server error |

### /events/by-id/:eventId

| Verb   | Formål                                          | Respons                       | Statuskoder                                                                                       |
| ------ | ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| GET    | Henter spesifikke arrangementer basert på ID    | Ett enkelt arrangement-objekt | 200: Success<br>404: Event not found<br>500: Server error                                         |
| PATCH  | Oppdatere utvalgte elementer ved et arrangement | Ett enkelt arrangement-objekt | 200: Updated successfully<br>400: Validation error<br>404: Event not found<br>500: Server error   |
| DELETE | Slette arrangement fra databasen                | Suksessmelding 200            | 200: Deleted successfully<br>400: Event has bookings<br>404: Event not found<br>500: Server error |

### /bookings

| Verb | Formål                 | Respons                      | Statuskoder                                                                        |
| ---- | ---------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| GET  | Hente alle påmeldinger | Array med påmelding-objekter | 200: Success<br>500: Server error                                                  |
| POST | Opprette ny påmelding  | Ett enkelt påmeldingsobjekt  | 201: Created successfully<br>400: Validation error/Event full<br>500: Server error |

### /bookings/:slug

| Verb | Formål                               | Respons                      | Statuskoder                                               |
| ---- | ------------------------------------ | ---------------------------- | --------------------------------------------------------- |
| GET  | Hente påmeldiger for ett arrangement | Array med påmeldingsobjekter | 200: Success<br>404: Event not found<br>500: Server error |

### /bookings/:bookingId

| Verb   | Formål                     | Respons                                                          | Statuskoder                                                              |
| ------ | -------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| PATCH  | Oppdatere påmeldingsstatus | Ett enkelt påmeldingsobjekt med statusstring og betalingsboolean | 200: Updated successfully<br>404: Booking not found<br>500: Server error |
| DELETE | Slette påmelding           | Suksessmelding 200                                               | 200: Deleted successfully<br>404: Booking not found<br>500: Server error |

### /templates

| Verb | Formål           | Respons                | Statuskoder                                                             |
| ---- | ---------------- | ---------------------- | ----------------------------------------------------------------------- |
| GET  | Hente alle maler | Array med mal-objekter | 200: Success<br>500: Server error                                       |
| POST | Opprette ny mal  | Statuskode 201         | 201: Created successfully<br>400: Validation error<br>500: Server error |

### /templates/:templateId

| Verb   | Formål                            | Respons                 | Statuskoder                                                                                       |
| ------ | --------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| GET    | Hente en spesifikk mal via mal-id | Ett enkelt malobjekt    | 200: Success<br>404: Template not found<br>500: Server error                                      |
| PATCH  | Oppdatere mal                     | Updated template object | 200: Updated successfully<br>404: Template not found<br>500: Server error                         |
| DELETE | Slette mal                        | Statuskode 200          | 200: Deleted successfully<br>409: Template in use<br>404: Template not found<br>500: Server error |

### /types

| Verb | Formål                      | Respons                 | Statuskoder                       |
| ---- | --------------------------- | ----------------------- | --------------------------------- |
| GET  | Hente alle arrangementtyper | Array med type-objekter | 200: Success<br>500: Server error |

## 5: Sidestruktur

### / (Hjem)

- Viser liste over alle ikke-private arrangementer
- Kan filtrere på måned, år og type
- Linker til individuelle arrangement-sider

### /events

- Viser liste over alle arrangmeneter
- Filtrering på type arrangment, måned og år
- Status fullbooket/ledige plasser

### /[slug]

- Detaljer om et spesifikt arrangement som tittel, tidspunkt, sted, pris, antall plasser
- Statusindikator fullbooket/ledige plasser
- Påmeldingsskjema:
  - Om gratis kan man melde seg på og automatisk få godkjent så lenge det er plass på arrangementet
  - Om venteliste er aktivert for arrangementet, blir yttligere påmeldinger lagt der
  - Er det et betalt arrangement, får man status "til behandling", og admin må godkjenne denne manuelt

### /admin

- Arrangementer:
  - kan se alle arrangementer
  - kan opprette nytt arrangement, redigere et eksisterende arrangememnt, eller slette et arrangeemnt som ikke har påmeldinger
- Maler:
  - Kan se alle maler
  - Kan opprette nye maler, eller slette maler som ikke er i bruk
- Påmeldinger:
  - Kan laste ned en excel-fil med alle påmeldinger per år
  - Kan se alle arrangementer og en oversikt over dets påmeldinger, linker til håndtering av påmeldinger

### /admin/[slug]/bookings

- Håndterer påmeldinger for det individuelle arrangementet
- Kan legge til en påmelding manuelt
- Kan godkjenne, avslå og slette eksisterende påmeldinger
- Kan markere et betalt arrangement som betalt eller ikke per påmelding

## 6: Filtrering:

#### Frontend:

Filter-komponentet setter opp tre dropdrowns, som inneholder verdier. Når en av disse verdiene velges av brukeren, blir URL-parameterne oppdatert til å inneholde denne verdien, eksempelvis slik: `http://localhost:4000/?month=11&year=2025`.
Når URL-en endres, fetcher EventList-komponenten ny data basert på parameterne. Slik kan filtrerte resultater lett deles og bokmerkes.

#### Backend:

Endepuktet `/events` tar imot query-parametere fra frontend. Controlleren skiller ut parameterne,og sender dem til servicelaget. Repoen bygger en dynamisk SQL-query basert på de valgte filterne, og returnerer data som mathcer disse filterne.

## 7: Datamodell:

<img src="files/datamodell.png" width="500" alt="Datamodell">

### Begrunnelse:

- Separerer data inn i naturlige entiteter, hvor hver entitet har en tydelig rolle i dataflyten.
- Events og Templates har en viss overlapp i felter, for å kunne operere både i samsvar og separat.
- Redundans kan yttligere unngås ved å opprette oppslagstabeller for statuser, tillate dager o.l., slik som "Types" fungerer som. Datamodellen er derfor fremtidsrettet og kan utvides ved behov.

## 8: Malsystemet:

Gjenbrukbare maler for effektiv arrangementsoppretting for arrangementer som går igjen.

### Opprettelse:

- Opprettes gjennom administrasjonpanelet.
- Navn, type, kapasitet og tillatte dager må fylles inn
- Konfigurerbare felter:
  - Pris (fast/variabel)
  - Privat arrangement
  - Venteliste
  - Tillate andre arrangementer på samme dag

### Gjenbruk:

- Kan velges fra en drop-down i arrangementskjema.
- Om en mal velges, vil enkelte felter, som type, kapasitet, venteliste og pris auto-fylles.
- Dato må samsvare med dager satt i malen.
- Enkelte felter kan overstyres, basert på den enkelte malens innstillinger.
- Maler som er i bruk kan ikke slettes eller endres.

## 9: Databasemodell og relasjoner:

Fire hovedtabeller: Events, Templates, Types og Bookings, basert på datamodellens entiteter.
Fremmednøkler benyttes for å refere mellom tabeller.

- Event og Templates har en én-til-mange-relasjon siden mange arrangementer kan opprettes fra én mal, men en mal kan benyttes til mange arrangementer. `template_id` i Events referer til Templates.
- Event og Bookings har en én-til-mange-relasjon, siden mange påmeldinger kan tilhøre ett arrangement, men en individuell påmelding kun gjelder det ene arrangementet. `event_id` i Bookings referer til Events.
- Types og Events har en én-til-mange-relasjon, siden et arrangement kan bare ha én type, men en type kan tulhøre mange arrangmeneter.
- Types og Templates har en én-til-mange-relasjon, da en type kan tilhøre mange maler, men en mal kan kun ha én type. `type_id` i både Events og Templates referer til Types.
