# Oppgave 2 - Grov planlegging

## Endepunkter:

### /events - alle arrangementer

- GET - hente alle arrangememnter

### /events/:slug - et spesifikt arrangement

- GET - henter detaljer om arrangementet
- POST - oppretter nytt arrangement (admin)
- PATCH - oppdatere eksisterende (admin)
- DELETE - slette arrangmenet (admin)

### /events/:slug/bookings

- GET - hente alle påmedlinger per arrangement
- POST - opprette påmelding fr et arrangement
- PACTH - oppdatere en påmelding (godkjent/avslått?)
- DELETE - slette en påmelding

### /templates - håndterer maler og deres regler

- GET - henter alle maler, responsen må være en lsite med alle maler
- POST - opprette ny mal
- DELETE - slette en mal (men kan ikke slette en som er i bruk! husk på)
- PATCH - opddatere en mal?

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

- kan opprette ny mal (popupskjema?)
- kan opprette event basetr på mal eller fra bunnen av

## Filtrering:

Backend:
Frontend:
TODO

## Datamodell:

TODO

## Malsystemet:

TODO

## Databasemodell og relasjoner:

TODO
