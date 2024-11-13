# Oppgave 2 - Grov planlegging

## Endepunkter:

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

- detaljer om et spesifikt arrangement som titel, tidspunkt, etc etc
- har påmeldingsskjema
- statusindikator fullbooket/ledige plasser

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

Sende queries som parametere fra valg i fronted til backend. Backend henter og returnerer arrangementer basert på filtreringen.
TODO

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