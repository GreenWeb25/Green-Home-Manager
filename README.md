# 🌿 Green Home Manager

Web App per la gestione del cantiere con budget di **€ 19.000**.

## Stack Tecnico
- **React 18** + Create React App
- **Supabase** (PostgreSQL + Auth)
- **Chart.js** + react-chartjs-2 (grafico ciambella)
- **FullCalendar** (calendario interattivo)
- **DM Sans** + **Space Mono** (tipografia)

---

## ⚡ Avvio Rapido

```bash
cd green-home-manager
npm install
npm start
```

L'app sarà disponibile su `http://localhost:3000`

---

## 🗄️ Setup Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Apri il tuo progetto `iiqwbxjfmoajdfewlfuf`
3. Vai su **SQL Editor** → **New query**
4. Incolla ed esegui il contenuto di `supabase_schema.sql`
5. Vai su **Authentication → Policies** e crea le policy `allow_all` per ogni tabella (vedi commenti nel SQL)

---

## 📁 Struttura File

```
src/
├── App.js                    # Shell principale + navigazione + stili
├── index.js                  # Entry point React
├── lib/
│   └── supabaseClient.js     # Client Supabase + helper functions
└── views/
    ├── BudgetView.jsx        # Dashboard budget, grafico ciambella, tabella presenze, modali
    └── PlanningView.jsx      # Calendario mensile FullCalendar con turni colorati
```

---

## 🎯 Funzionalità

### 📊 Budget & Costi
- **Grafico ciambella** con distribuzione: Manodopera / Materiali / Costi Vari / Utile Netto
- **Utile Netto** = 19.000€ − (Manodopera + Materiali + Costi Vari)
- Se utile < 30% → percentuale al centro diventa **ROSSA** con animazione + banner di avviso
- **4 Modali** per inserimento dati: Nuovo Cantiere, Nuovo Dipendente, Aggiungi Materiale, Costo Vario
- **Registro Presenze** stile Excel con inserimento rapido in prima riga

### 📅 Pianificazione
- **Calendario mensile** interattivo (FullCalendar, lingua italiana)
- **Turni colorati** per dipendente: 🟢 Gino, 🔵 Beppe, 🟡 Tony
- **Domeniche con sfondo rosso**
- Click su giorno → modal per aggiungere turno
- Click su evento → popup con dettagli + elimina
- **Filtro per dipendente** con chip colorati
- **Cards statistiche** ore totali per operaio

---

## 🔗 Credenziali Supabase
```
URL:       https://iiqwbxjfmoajdfewlfuf.supabase.co
Anon Key:  QkF5mh3svPARkqGeDtOyZw_CN2L-bxN
```
