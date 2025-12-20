# 🚀 Guida Setup Supabase per RIENTRO

## Passo 1: Crea un Progetto Supabase

1. Vai su [https://supabase.com](https://supabase.com)
2. Clicca su **"Start your project"** o **"New Project"**
3. Scegli un nome per il progetto (es. "rientro-app")
4. Scegli una password forte per il database
5. Seleziona una regione vicina a te
6. Clicca **"Create new project"** (ci vorranno 1-2 minuti)

## Passo 2: Ottieni le Credenziali

1. Nel dashboard, vai su **Settings** (icona ingranaggio in basso a sinistra)
2. Clicca su **API**
3. Troverai:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public** key (una chiave lunga)

## Passo 3: Configura le Variabili d'Ambiente

Crea un file `.env` nella root del progetto:

```env
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-anon-key-qui
```

⚠️ **IMPORTANTE**: Non committare il file `.env` nel repository!

## Passo 4: Crea il Database Schema

### Opzione A: Via SQL Editor (Consigliato per iniziare)

1. Nel dashboard Supabase, vai su **SQL Editor** (icona database)
2. Clicca su **"New query"**
3. Apri il file `supabase/migrations/001_initial_schema.sql`
4. Copia tutto il contenuto e incollalo nell'editor SQL
5. Clicca **"Run"** (o premi Cmd/Ctrl + Enter)

### Opzione B: Via Supabase CLI (Per sviluppatori avanzati)

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref tuo-project-ref

# Applica migrazioni
supabase db push
```

## Passo 5: Abilita Email Authentication

1. Vai su **Authentication** > **Providers**
2. Assicurati che **Email** sia abilitato
3. (Opzionale) Configura email templates personalizzati

## Passo 6: Verifica Row Level Security (RLS)

Le policy RLS sono già incluse nella migration. Verifica che siano attive:

1. Vai su **Table Editor**
2. Seleziona una tabella (es. `contacts`)
3. Vai su **"Policies"** nel pannello laterale
4. Dovresti vedere le policy create automaticamente

## 🎉 Fatto!

Ora puoi avviare l'app:

```bash
npm run dev
```

## 📊 Struttura Database

Il database include 4 tabelle principali:

1. **users** - Profili utente (estende auth.users)
2. **contacts** - Contatti di sicurezza
3. **journeys** - Viaggi tracciati
4. **saved_places** - Luoghi salvati

Tutte le tabelle hanno:
- ✅ Row Level Security (RLS) abilitato
- ✅ Policy per permettere solo accesso ai propri dati
- ✅ Indici per performance ottimali
- ✅ Timestamps automatici

## 🔍 Verifica che Funzioni

1. **Registra un nuovo utente** nell'app
2. Controlla in **Table Editor** > **users** che il profilo sia stato creato
3. **Aggiungi un contatto** nell'app
4. Controlla in **Table Editor** > **contacts** che il contatto sia stato salvato

## 🐛 Troubleshooting

### Errore: "Invalid API key"
- Verifica che le variabili `.env` siano corrette
- Riavvia il server dev (`npm run dev`)

### Errore: "relation does not exist"
- Esegui la migration SQL nel SQL Editor
- Verifica che tutte le tabelle siano state create

### Errore: "new row violates row-level security policy"
- Verifica che le policy RLS siano state create
- Controlla che l'utente sia autenticato

### Notifiche non funzionano
- Le notifiche push richiedono configurazione aggiuntiva
- Per ora, le notifiche locali funzionano se il permesso è concesso

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Supabase Discord](https://discord.supabase.com) - Community support

