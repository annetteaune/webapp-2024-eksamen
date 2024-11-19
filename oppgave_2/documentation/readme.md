# Oppgave 2 - Grov planlegging

## Endepunkter:

# TODO: husk å fikse samme dag-tillatelser når create events settes opp - error trigger ikke riktig!

### /events - alle arrangementer

- GET - hente alle arrangememnter

### /events/:slug - et spesifikt arrangement

- GET - henter detaljer om arrangementet
- POST - oppretter nytt arrangement (admin)
- PATCH - oppdatere eksisterende (admin)
- DELETE - slette arrangmenet (admin)

### /templates - håndterer maler og deres regler

- GET - henter alle maler, responsen må være en lsite med alle maler
- POST - opprette ny mal
- DELETE - slette en mal (men kan ikke slette en som er i bruk! husk på)
- PATCH - opddatere en mal?

### /bookings - Påmeldinger

- GET - hente alle påmedlinger
- POST - opprette påmelding

### /bookings/:slug - påmeldinger til et spesifikt arrangement

- GET - hente påmedlingen
- PACTH - oppdatere en påmelding (godkjent/avslått?)
- DELETE - slette en påmelding

### /type - Arrangementstyper

- GET - henter alle typer

TODO: Skal til hvert api-endepunkt dokumentere responsen og statuskoden for de ulike verbene. Hva slags data skal returneres når det går riktig / feil.

## Sidestruktur

### /events: Landingsside for arrangementer

- Viser liste over alle arrangmeneter
- Filtrering på type arrangment, måned og år
- Status fullbooket/ledige plasser

### /events:slug - detaljer

- Detaljer om et spesifikt arrangement som tittel, tidspunkt, sted, pris, antall plasser
- Statusindikator fullbooket/ledige plasser
- Påmeldingsskjema:
  - Om gratis kan man melde seg på og automatisk få godkjent så lenge det er plass på arrangementet
  - Er det et betalt arrangement, får man status "til behandling", og admin må godkjenne denne manuelt da det antas as betaling foregår analogt.

### /admin - landingsside admin

- kan se alle arrangementer
- kan opprette nytt arrangement (linker til /new med satte regler?)
- kan slette et arrangment

### /admin/:slug

- kan endre/oppdatere eventet
- viser liste over påmeldinger, knapp som linker til /admin/:slug/bookings

### /admin/:slug/bookings

- kan godkjenne, avslå, slette, manuelt legge til en påmelding

### /admin/new

- kan opprette ny mal
- kan opprette event basert på mal eller fra bunnen av

## Filtrering:

#### Frontend:

Filter-komponentet setter opp tre dropdrowns, som inneholder verdier. Når en av disse verdiene velges av brukeren, blir URL-parameterne oppdatert til å inneholde denne verdien, eksempelvis slik: `http://localhost:4000/?month=11&year=2025`.
Når URL-en endres, fetcher EventList-komponenten ny data basert på parameterne. Slik kan filtrerte resultater lett deles og bokmerkes.

#### Backend:

Endepuktet `/events` tar imot query-parametere fra frontend. Controlleren skiller ut parameterne,og sender dem til servicelaget. Repoen bygger en dynamisk SQL-query basert på de valgte filterne, og returnerer data som mathcer disse filterne.

## Datamodell:

### Arrangement

- id(int), slug(string), title(string), description(string), date(datetime), location(string), type(string), capacity(int), price(dec), waitlist?(array)

### Mal

- id(int), name(string), allowed_days(array), max_capacity(int), price(dec), is_private(bool), allow_same_day(bool), allow_waitlist(bool), created_at(datetime)
  TODO

### Påmelding

- id(int), name(string), has_paid(bool)

### Type

- id(int), name(string)

## Malsystemet:

TODO

## Databasemodell og relasjoner:

Fire hovedtabeller: Events, Templates, Types og Bookings.

Event og Templates har en én-til-mange-relasjon siden mange arrangementer kan opprettes fra én mal, men en mal kan benyttes til mange arrangementer.
Event og Bookings har en én-til-mange-relasjon, siden mange påmeldinger kan tilhøre ett arrangement, men en individuell påmelding kun gjelder det ene arrangementet.
Types og Events har en én-til-mange-relasjon, siden et arrangement kan bare ha én type, men en type kan tulhøre mange arrangmeneter.
Begrunnelse: TODO
