# 🔧 Troubleshooting - Problemi Comuni

## ❌ Loop infinito di caricamento

Se vedi lo spinner "Caricamento..." che non finisce mai, probabilmente le **credenziali Supabase non sono configurate**.

### Soluzione:

1. **Verifica che il file `.env` esista** nella root del progetto
2. **Controlla che contenga:**
   ```env
   VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
   VITE_SUPABASE_ANON_KEY=la-tua-anon-key
   ```
3. **Riavvia il server dev:**
   ```bash
   # Ferma il server (Ctrl+C)
   npm run dev
   ```

### Se non hai ancora configurato Supabase:

1. Segui la guida in `SUPABASE_SETUP.md` per creare un progetto Supabase
2. Copia le credenziali nel file `.env`
3. Riavvia il server

### Verifica rapida:

Apri la **console del browser** (F12) e controlla:
- Se vedi `⚠️ Supabase credentials not found` → Le credenziali mancano
- Se vedi errori di rete → Le credenziali sono sbagliate
- Se vedi `Auth initialization timeout` → C'è un problema di connessione

---

## ❌ Errori nella console del browser

### "supabaseUrl is required"
- **Problema:** Il file `.env` non esiste o è vuoto
- **Soluzione:** Crea il file `.env` con le credenziali (vedi `ENV_SETUP.md`)

### "Failed to fetch" o errori di rete
- **Problema:** Le credenziali Supabase sono sbagliate o il progetto non esiste
- **Soluzione:** Verifica le credenziali nel dashboard Supabase

### "Invalid API key"
- **Problema:** La chiave anon key è errata
- **Soluzione:** Copia di nuovo la chiave da Supabase Dashboard → Settings → API

---

## ❌ L'app si chiude subito dopo l'apertura (Android)

### Controlla i log:
1. In Android Studio: **View** → **Tool Windows** → **Logcat**
2. Filtra per "rientro" o "Error"
3. Cerca errori relativi a:
   - Supabase (credenziali mancanti)
   - Permessi (GPS, notifiche)
   - Network (connessione internet)

### Soluzione comune:
- Verifica che il file `.env` sia presente e corretto
- Controlla la console di Vite durante il build (`npm run build`)

---

## ❌ GPS non funziona

### Su Web:
- Il browser deve richiedere permessi di localizzazione
- Assicurati di aver concesso i permessi quando richiesto
- Chrome richiede HTTPS per GPS (tranne localhost)

### Su Android:
1. **Controlla i permessi:**
   - Impostazioni → App → RIENTRO → Permessi
   - Abilita "Posizione" e "Posizione in background"
2. **Attiva il GPS** sul dispositivo
3. **Testa all'aperto** con cielo visibile (per primo fix satellitare)

---

## ❌ Notifiche non funzionano

### Su Web:
- Le notifiche richiedono HTTPS (tranne localhost)
- Il browser deve richiedere permessi
- Alcuni browser (Safari) hanno limitazioni

### Su Android:
- Verifica che le notifiche siano abilitate nelle impostazioni dell'app
- Controlla che il dispositivo non sia in modalità "Non disturbare"

---

## ❌ Errori di build

### "Cannot find module '@capacitor/...'"
```bash
npm install
```

### "Gradle sync failed"
1. In Android Studio: **File** → **Invalidate Caches** → **Invalidate and Restart**
2. Poi: **File** → **Sync Project with Gradle Files**

### "SDK location not found"
1. Apri Android Studio
2. **File** → **Project Structure** → **SDK Location**
3. Imposta il percorso del tuo Android SDK (di solito `~/Library/Android/sdk` su Mac)

---

## ✅ Checklist rapida

Prima di segnalare un problema, verifica:

- [ ] Il file `.env` esiste e contiene le credenziali Supabase
- [ ] Il server dev è stato riavviato dopo aver modificato `.env`
- [ ] La console del browser non mostra errori (F12)
- [ ] Le dipendenze sono installate (`npm install`)
- [ ] Il progetto Supabase è stato creato e configurato
- [ ] La migration SQL è stata eseguita nel dashboard Supabase

---

## 🆘 Ancora problemi?

1. **Controlla la console del browser** (F12 → Console)
2. **Controlla i log del server** (nel terminale dove gira `npm run dev`)
3. **Verifica la documentazione:**
   - `SUPABASE_SETUP.md` per configurazione database
   - `ENV_SETUP.md` per variabili d'ambiente
   - `ANDROID_BUILD.md` per build Android

