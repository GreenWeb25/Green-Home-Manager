import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/supabaseClient';

ChartJS.register(ArcElement, Tooltip, Legend);

const BUDGET_TOTALE = 19000;

export default function BudgetView() {
  const [totals, setTotals] = useState({ materiali: 0, manodopera: 0, vari: 0 });
  const [matList, setMatList] = useState([]);
  const [modal, setModal] = useState(false);
  
  // STATO DEL FORM: nomi colonne identici al DB
  const [form, setForm] = useState({ 
    nome: '', 
    fornitore: '', 
    quantita: 1, 
    prezzo_unitario: 0, 
    unita: 'pz' 
  });

  const loadData = async () => {
    // 1. Carica Materiali
    const { data: mats } = await supabase.from('materiali').select('*').order('created_at', { ascending: false });
    const totMat = (mats || []).reduce((acc, m) => acc + (parseFloat(m.quantita || 0) * parseFloat(m.prezzo_unitario || 0)), 0);
    
    // 2. Carica Manodopera (Presenze)
    const { data: pres } = await supabase.from('gestione_cantiere').select('*, dipendenti(tariffa_oraria)');
    const totMano = (pres || []).reduce((acc, p) => acc + (parseFloat(p.ore_lavorate || 0) * (p.dipendenti?.tariffa_oraria || 0)), 0);

    setTotals({ materiali: totMat, manodopera: totMano, vari: 0 });
    setMatList(mats || []);
  };

  useEffect(() => { loadData(); }, []);

  // FUNZIONE DI SALVATAGGIO CORRETTA
  const handleSaveMateriale = async (e) => {
    e.preventDefault();
    
    // Inviamo ESATTAMENTE le colonne che esistono nel tuo SQL
    const { error } = await supabase.from('materiali').insert([{
      nome: form.nome,
      fornitore: form.fornitore,
      quantita: parseFloat(form.quantita),
      prezzo_unitario: parseFloat(form.prezzo_unitario),
      unita: form.unita
    }]);

    if (!error) {
      setModal(false);
      setForm({ nome: '', fornitore: '', quantita: 1, prezzo_unitario: 0, unita: 'pz' });
      loadData();
    } else {
      console.error(error);
      alert("Errore Database: " + error.message + "\nVerifica che la tabella 'materiali' abbia la colonna 'nome'.");
    }
  };

  const usciteTotali = totals.materiali + totals.manodopera;
  const utile = BUDGET_TOTALE - usciteTotali;

  return (
    <div className="view-container" style={{ padding: '20px', color: '#e2e8f0' }}>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* GRAFICO */}
        <div className="card" style={{ background: '#1a2332', padding: '20px', borderRadius: '12px' }}>
          <Doughnut data={{
            labels: ['Uscite', 'Utile'],
            datasets: [{
              data: [usciteTotali, utile > 0 ? utile : 0],
              backgroundColor: ['#ef4444', '#4ade80'],
              borderWidth: 0
            }]
          }} options={{ cutout: '70%' }} />
        </div>

        {/* RIEPILOGO */}
        <div className="card" style={{ background: '#1a2332', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ color: '#94a3b8', fontSize: '1rem' }}>UTILE ATTUALE</h2>
          <h1 style={{ fontSize: '3.5rem', margin: '10px 0', color: utile < 3000 ? '#ef4444' : '#4ade80' }}>
            € {utile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </h1>
          <div style={{ display: 'flex', gap: '20px', color: '#94a3b8' }}>
            <span>Materiali: €{totals.materiali.toFixed(2)}</span>
            <span>Lavoro: €{totals.manodopera.toFixed(2)}</span>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => setModal(true)}
            style={{ marginTop: '20px', padding: '12px', background: '#2563eb', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
          >
            + Aggiungi Materiale
          </button>
        </div>
      </div>

      {/* TABELLA RECENTI */}
      <div className="card" style={{ background: '#1a2332', padding: '20px', borderRadius: '12px' }}>
        <h3>Ultimi Materiali Inseriti</h3>
        <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#475569', textAlign: 'left', borderBottom: '1px solid #1e2d3d' }}>
              <th style={{ padding: '10px' }}>Materiale</th>
              <th>Fornitore</th>
              <th>Totale</th>
            </tr>
          </thead>
          <tbody>
            {matList.slice(0, 5).map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1e2d3d' }}>
                <td style={{ padding: '10px' }}>{m.nome}</td>
                <td>{m.fornitore || '-'}</td>
                <td style={{ color: '#ef4444' }}>€ {(m.quantita * m.prezzo_unitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE DI INSERIMENTO */}
      {modal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form 
            onSubmit={handleSaveMateriale}
            style={{ background: '#1e2d3d', padding: '30px', borderRadius: '16px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            <h2 style={{ marginBottom: '10px' }}>Nuovo Materiale</h2>
            
            <label>Descrizione (Nome)</label>
            <input 
              required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
              value={form.nome} 
              onChange={e => setForm({...form, nome: e.target.value})} 
              placeholder="es. Cemento 32.5"
            />

            <label>Fornitore</label>
            <input 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
              value={form.fornitore} 
              onChange={e => setForm({...form, fornitore: e.target.value})} 
              placeholder="es. Tecnomat"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Quantità</label>
                <input 
                  type="number" step="any" required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                  value={form.quantita} 
                  onChange={e => setForm({...form, quantita: e.target.value})} 
                />
              </div>
              <div>
                <label>Prezzo Unit.</label>
                <input 
                  type="number" step="any" required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                  value={form.prezzo_unitario} 
                  onChange={e => setForm({...form, prezzo_unitario: e.target.value})} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => setModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#475569', color: 'white', cursor: 'pointer' }}
              >
                Annulla
              </button>
              <button 
                type="submit" 
                style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: '#4ade80', color: '#052e16', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Salva nel DB
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}