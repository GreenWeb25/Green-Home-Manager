# Guida alla Configurazione Google Auth

Il codice è pronto, ora restano 3 passaggi "manuali" da fare nelle dashboard di Google e Supabase.

---

### Step 1: Aggiorna il Database
Esegui questo script in Supabase (SQL Editor) per aggiungere il campo email:
[aggiungi_email_dipendenti.sql](file:///Users/giangi/Desktop/green-home-manager/aggiungi_email_dipendenti.sql)

Dopo averlo fatto, apri la tua **Web App** e vedrai il nuovo campo "Email" nella gestione dipendenti. **Inserisci la tua email Gmail** (o quella dei dipendenti) lì.

---

### Step 2: Google Cloud Console
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto (es. "Green Home App").
3. Vai in **APIs & Services > OAuth consent screen**:
   - Scegli "External" e inserisci le info base (nome app, tua email).
4. Vai in **Credentials > Create Credentials > OAuth client ID**:
   - Tipo: **Web application** (necessario per Supabase).
   - Nome: "Supabase Web Client".
   - Sotto **Authorized redirect URIs**, inserisci questa URL (che trovi in Supabase > Auth > Providers > Google):
     `https://iiqwbxjfmoajdfewlfuf.supabase.co/auth/v1/callback`
5. Salva e copia il **Client ID** e il **Client Secret**.

---

### Step 3: Supabase Dashboard
1. Vai su [Supabase Auth > Providers](https://supabase.com/dashboard/project/iiqwbxjfmoajdfewlfuf/auth/providers)
2. Cerca **Google** e abilitalo.
3. Incolla il **Client ID** e il **Client Secret** ottenuti da Google.
4. Salva.

---

### Step 4: Prova l'App!
1. Nel simulatore, l'app mostrerà il pulsante "Accedi con Google".
2. Clicca, inserisci le tue credenziali Gmail.
3. Se l'email che usi è la stessa che hai inserito nella Web App al punto 1, l'app ti farà entrare e potrai timbrare! 🚀
