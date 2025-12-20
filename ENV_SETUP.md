# 🔧 Configurazione File .env

## ⚠️ IMPORTANTE: Crea il file .env

Il file `.env` è necessario per far funzionare l'app con Supabase. 

## Passi per creare il file .env:

1. **Crea un file chiamato `.env`** nella root del progetto (stessa cartella di `package.json`)

2. **Aggiungi queste righe** (sostituisci con i tuoi valori reali):

```env
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-anon-key-qui
```

3. **Dove trovare i valori:**

   - Vai su [https://app.supabase.com](https://app.supabase.com)
   - Seleziona il tuo progetto
   - Vai su **Settings** (icona ingranaggio) > **API**
   - Copia **"Project URL"** → incollalo come `VITE_SUPABASE_URL`
   - Copia **"anon public" key** → incollalo come `VITE_SUPABASE_ANON_KEY`

4. **Riavvia il server dev** dopo aver creato il file:
   ```bash
   npm run dev
   ```

## ⚠️ Sicurezza

- **NON** committare il file `.env` nel repository Git
- Il file `.env` è già nel `.gitignore` per sicurezza
- Condividi le credenziali solo con persone di fiducia

## ✅ Verifica

Dopo aver creato il file `.env` e riavviato il server, non dovresti più vedere l'errore:
```
⚠️ Supabase credentials not found
```

