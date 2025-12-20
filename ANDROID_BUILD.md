# 📱 Guida Build Android per RIENTRO

Questa guida ti aiuterà a compilare l'app RIENTRO per Android usando Capacitor.

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

1. **Android Studio** (scaricabile da [developer.android.com/studio](https://developer.android.com/studio))
2. **Java JDK 17+** (di solito incluso con Android Studio)
3. **Android SDK** (installato tramite Android Studio SDK Manager)

### Installazione Android Studio:

1. Scarica Android Studio dal sito ufficiale
2. Installa il programma seguendo la procedura guidata
3. All'apertura, installa:
   - Android SDK
   - Android SDK Platform-Tools
   - Android Emulator (opzionale, per test)

## 🚀 Workflow di Sviluppo

### 1. Sincronizza il progetto

Dopo ogni modifica al codice web, sincronizza con Android:

```bash
npm run android:sync
```

Questo comando:
- Compila l'app web (`npm run build`)
- Copia i file nella cartella Android
- Sincronizza i plugin Capacitor

### 2. Apri in Android Studio

```bash
npm run android:open
```

Oppure manualmente:
- Apri Android Studio
- File → Open → Seleziona la cartella `android/`

### 3. Build dell'APK

#### Opzione A: Debug APK (per test)

1. In Android Studio, vai su **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Attendi che la build finisca
3. Clicca su **locate** nella notifica per trovare l'APK
4. L'APK sarà in: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Opzione B: Signed Release APK (per pubblicazione)

1. **Crea una Key Store:**
   ```bash
   keytool -genkey -v -keystore rientro-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias rientro
   ```
   (Salva la password in sicurezza!)

2. **Configura il signing:**
   - In Android Studio, vai su **File** → **Project Structure**
   - Seleziona **Modules** → **app** → **Signing Configs**
   - Clicca **+** e configura:
     - Store File: seleziona il tuo `.jks`
     - Store Password: la password del keystore
     - Key Alias: `rientro`
     - Key Password: la password della chiave

3. **Crea Release Build:**
   - **Build** → **Generate Signed Bundle / APK**
   - Seleziona **APK**
   - Scegli il signing config
   - Build variant: **release**
   - Clicca **Finish**

## 🔧 Configurazione Avanzata

### Modificare il nome dell'app

Il nome dell'app è configurato in:
- `android/app/src/main/res/values/strings.xml` → `app_name`

### Modificare l'icona dell'app

1. Prepara le icone in queste dimensioni:
   - mdpi: 48x48
   - hdpi: 72x72
   - xhdpi: 96x96
   - xxhdpi: 144x144
   - xxxhdpi: 192x192

2. Sostituisci i file in:
   - `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
   - `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
   - ... (e così via per tutte le densità)

Oppure usa [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) per generarle automaticamente.

### Modificare lo Splash Screen

Lo splash screen è configurato in `capacitor.config.ts`:

```typescript
SplashScreen: {
  launchShowDuration: 2000,
  launchAutoHide: true,
  backgroundColor: '#1a1f3d',
  // ...
}
```

Per cambiare l'immagine, modifica i file in `android/app/src/main/res/drawable/`

## 🧪 Test su Dispositivo

### Opzione 1: Connessione USB

1. Abilita **Opzioni Sviluppatore** sul tuo Android:
   - Vai in **Impostazioni** → **Info sul telefono**
   - Tocca **Numero build** 7 volte
2. Abilita **Debug USB** nelle Opzioni Sviluppatore
3. Collega il telefono via USB al computer
4. In Android Studio, seleziona il dispositivo dalla lista
5. Clicca **Run** (▶️) per installare l'app

### Opzione 2: Emulatore

1. In Android Studio, vai su **Tools** → **Device Manager**
2. Clicca **Create Device**
3. Scegli un dispositivo e un'immagine sistema
4. Clicca **Finish**
5. Avvia l'emulatore e clicca **Run** in Android Studio

### Opzione 3: Installa APK direttamente

1. Genera l'APK (vedi sezione sopra)
2. Trasferisci l'APK sul telefono (via USB, email, cloud, etc.)
3. Sul telefono, vai in **Impostazioni** → **Sicurezza**
4. Abilita **Installa app da origini sconosciute**
5. Apri il file APK e installa

## 📦 Pubblicazione su Google Play Store

1. **Prepara l'App Bundle (AAB):**
   - In Android Studio: **Build** → **Generate Signed Bundle / APK**
   - Seleziona **Android App Bundle**
   - Scegli il signing config
   - Build variant: **release**

2. **Crea un account Google Play Console:**
   - Vai su [play.google.com/console](https://play.google.com/console)
   - Paga la quota unica di $25

3. **Crea la prima release:**
   - Crea una nuova app
   - Compila tutte le informazioni richieste
   - Carica l'AAB generato
   - Invia per revisione

## 🐛 Troubleshooting

### Errore: "SDK location not found"
- Apri Android Studio
- Vai in **File** → **Project Structure** → **SDK Location**
- Imposta il percorso del tuo Android SDK

### Errore: "Gradle sync failed"
- In Android Studio, vai su **File** → **Sync Project with Gradle Files**
- Se non funziona, elimina la cartella `.gradle` in `android/` e riprova

### L'app si chiude subito dopo l'apertura
- Controlla i log in Android Studio: **View** → **Tool Windows** → **Logcat**
- Verifica che le credenziali Supabase siano nel file `.env`

### GPS non funziona
- Assicurati di aver concesso i permessi di localizzazione
- Controlla che il dispositivo abbia il GPS attivo
- Per test, prova all'aperto con cielo visibile

## 📝 Comandi Utili

```bash
# Build e sync completo
npm run android:build

# Solo sync (dopo build manuale)
npm run android:sync

# Apri Android Studio
npm run android:open

# Sync generico (tutte le piattaforme)
npm run cap:sync

# Aggiorna Capacitor
npm run cap:update
```

## 🔗 Risorse

- [Documentazione Capacitor](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console](https://play.google.com/console)

## ⚠️ Note Importanti

- **Non committare** la cartella `android/` nel repository Git (aggiungila a `.gitignore`)
- **Backup** del file keystore: se lo perdi, non potrai più aggiornare l'app sul Play Store
- I **permessi runtime** (GPS, notifiche) vengono richiesti la prima volta che l'app li usa
- Per un'esperienza ottimale, testa sempre su un dispositivo reale prima della pubblicazione

