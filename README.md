# RIENTRO - App di Sicurezza Personale 🛡️

Un'applicazione di sicurezza personale che ti permette di condividere la tua posizione con persone fidate durante i tuoi spostamenti.

## 🚀 Funzionalità

### Autenticazione
- ✅ Registrazione con validazione completa
- ✅ Login con gestione errori
- ✅ Persistenza sessione utente
- ✅ Logout sicuro

### Geolocalizzazione
- ✅ Rilevamento posizione GPS in tempo reale
- ✅ Mappa interattiva con Leaflet
- ✅ Tracciamento durante il viaggio
- ✅ Indicatore di precisione GPS

### Sicurezza
- ✅ Cerchia di contatti fidati
- ✅ Contatti di emergenza con badge
- ✅ Pulsante SOS con countdown
- ✅ Controlli automatici "Stai bene?"
- ✅ Notifiche push per alert

### Viaggi
- ✅ Avvio viaggio con destinazione
- ✅ Monitoraggio tempo stimato
- ✅ Completamento viaggio sicuro
- ✅ Storico viaggi
- ✅ **Realtime updates** - Aggiornamenti in tempo reale con Supabase

## 🛠️ Configurazione

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura Supabase

1. Vai su [Supabase](https://supabase.com/) e crea un account gratuito
2. Crea un nuovo progetto
3. Vai su **Settings** > **API** e copia:
   - **Project URL**
   - **anon/public key**

Crea un file `.env` nella root del progetto:

```env
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-anon-key
```

### 3. Setup Database

1. Vai su **SQL Editor** nel dashboard Supabase
2. Copia e incolla il contenuto del file `supabase/migrations/001_initial_schema.sql`
3. Esegui la query per creare le tabelle e le policy RLS

Oppure, se hai installato Supabase CLI:

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al tuo progetto
supabase link --project-ref tuo-project-ref

# Applica le migrazioni
supabase db push
```

### 4. Abilita Email Auth

1. Vai su **Authentication** > **Providers**
2. Abilita **Email** provider
3. (Opzionale) Configura email templates personalizzati

### 5. Avvia l'app

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

## 📱 Struttura del Progetto

```
├── App.tsx                 # Componente principale con routing
├── context/
│   └── AuthContext.tsx     # Context per autenticazione Supabase
├── hooks/
│   ├── useSupabase.ts     # Hook per database (contatti, viaggi) con Realtime
│   ├── useGeolocation.ts  # Hook per GPS
│   └── useNotifications.ts # Hook per notifiche push
├── lib/
│   ├── supabase.ts        # Configurazione Supabase client
│   ├── database.types.ts  # TypeScript types per database
│   └── validation.ts      # Schemi di validazione Zod
├── screens/
│   ├── Onboarding.tsx     # Schermata iniziale
│   ├── Login.tsx          # Login con validazione
│   ├── Register.tsx       # Registrazione con validazione
│   ├── Home.tsx           # Home con mappa
│   ├── ActiveJourney.tsx  # Viaggio attivo con SOS
│   ├── Contacts.tsx       # Gestione contatti
│   └── Profile.tsx        # Profilo utente
├── components/
│   ├── Button.tsx         # Pulsante riutilizzabile
│   ├── Input.tsx          # Input con validazione
│   ├── BottomNav.tsx      # Navigazione bottom
│   └── MapBackground.tsx  # Mappa Leaflet
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema database iniziale
└── types.ts               # TypeScript types
```

## 🔐 Sicurezza

- **Row Level Security (RLS)**: Ogni utente può accedere solo ai propri dati
- Le password sono gestite da Supabase Auth (hash bcrypt)
- La posizione è condivisa solo con i contatti autorizzati
- Le notifiche push richiedono consenso esplicito
- **Realtime sicuro**: Le subscription sono filtrate per user_id

## 🧪 Test dell'app

1. **Registrazione**: Crea un account con email e password validi
2. **Aggiungi contatti**: Vai su "Contatti" e aggiungi persone fidate
3. **Avvia un viaggio**: Dalla home, inserisci una destinazione e clicca "Avvia Rientro"
4. **Test SOS**: Durante il viaggio, tieni premuto il pulsante SOS per 3 secondi
5. **Realtime**: Apri l'app su due dispositivi con lo stesso account - vedrai gli aggiornamenti in tempo reale!

## 📦 Tecnologie Utilizzate

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Supabase** - Backend as a Service (PostgreSQL + Auth + Realtime)
- **Leaflet** - Mappe interattive
- **React Hook Form** - Gestione form
- **Zod** - Validazione schema
- **Tailwind CSS** - Styling
- **Lucide React** - Icone

## 🎯 Vantaggi di Supabase

- ✅ **PostgreSQL** - Database relazionale potente
- ✅ **Realtime** - Aggiornamenti automatici senza polling
- ✅ **Row Level Security** - Sicurezza a livello di database
- ✅ **API REST automatica** - Endpoint generati automaticamente
- ✅ **Open Source** - Trasparenza e controllo
- ✅ **Pricing trasparente** - Piano gratuito generoso
- ✅ **TypeScript support** - Types generati automaticamente

## 🚧 Prossimi Sviluppi

- [ ] Integrazione Google Maps per routing
- [ ] Supabase Edge Functions per notifiche SMS
- [ ] Integrazione con servizi di emergenza (112)
- [ ] Modalità offline con sincronizzazione
- [ ] Widget per accesso rapido
- [ ] Apple Watch / WearOS companion app
- [ ] Push notifications via Supabase Edge Functions

## 📄 Licenza

MIT License - Usa liberamente per progetti personali e commerciali.

## 🔗 Link Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
