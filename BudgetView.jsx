import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/supabaseClient';

ChartJS.register(ArcElement, Tooltip, Legend);

const BUDGET_TOTALE = 19000;
const fmt = n => `€ ${parseFloat(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;

function ModalOverlay({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function FormNuovoCantiere({ onClose, onSaved }) {
  const [form, setForm] = useState({ nome: '', indirizzo: '', budget: '19000' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('cantieri').insert([{ nome: form.nome, indirizzo: form.indirizzo, budget: parseFloat(form.budget) || 0 }]);
    setSaving(false);
    if (!error) { onSaved(); onClose(); } else alert('Errore: ' + error.message);
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">🏗️ Nuovo Cantiere</h2>
      <label>Nome Cantiere<input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label>
      <label>Indirizzo<input value={form.indirizzo} onChange={e => setForm({ ...form, indirizzo: e.target.value })} /></label>
      <label>Budget Preventivo (EUR)<input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} /></label>
      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando...' : 'Salva'}</button>
      </div>
    </form>
  );
}

function FormNuovoDipendente({ onClose, onSaved }) {
  const [form, setForm] = useState({ nome: '', ruolo: '', tariffa_oraria: '' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('dipendenti').insert([{ nome: form.nome, ruolo: form.ruolo, tariffa_oraria: parseFloat(form.tariffa_oraria) || 0 }]);
    setSaving(false);
    if (!error) { onSaved(); onClose(); } else alert('Errore: ' + error.message);
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">👷 Nuovo Dipendente</h2>
      <label>Nome Completo<input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label>
      <label>Ruolo<input value={form.ruolo} onChange={e => setForm({ ...form, ruolo: e.target.value })} /></label>
      <label>Tariffa Oraria (EUR/h)<input type="number" step="0.5" value={form.tariffa_oraria} onChange={e => setForm({ ...form, tariffa_oraria: e.target.value })} /></label>
      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando...' : 'Salva'}</button>
      </div>
    </form>
  );
}

// materiali: id, data, fornitore, descrizione, importo, cantiere_id
function FormNuovoMateriale({ onClose, onSaved }) {
  const [form, setForm] = useState({ descrizione: '', fornitore: '', importo: '', data: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('materiali').insert([{ descrizione: form.descrizione, fornitore: form.fornitore, importo: parseFloat(form.importo) || 0, data: form.data }]);
    setSaving(false);
    if (!error) { onSaved(); onClose(); } else alert('Errore: ' + error.message);
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">🧱 Aggiungi Materiale</h2>
      <label>Descrizione<input required value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} /></label>
      <label>Fornitore<input value={form.fornitore} onChange={e => setForm({ ...form, fornitore: e.target.value })} /></label>
      <label>Data<input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
      <label>Importo (EUR)<input required type="number" step="0.01" value={form.importo} onChange={e => setForm({ ...form, importo: e.target.value })} /></label>
      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando...' : 'Salva'}</button>
      </div>
    </form>
  );
}

// costi_vari: id, data, categoria, importo, cantiere_id
function FormCostoVario({ onClose, onSaved }) {
  const [form, setForm] = useState({ categoria: '', importo: '', data: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('costi_vari').insert([{ categoria: form.categoria, importo: parseFloat(form.importo) || 0, data: form.data }]);
    setSaving(false);
    if (!error) { onSaved(); onClose(); } else alert('Errore: ' + error.message);
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">💼 Costo Vario</h2>
      <label>Categoria<input required placeholder="Noleggio, Smaltimento..." value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} /></label>
      <label>Data<input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
      <label>Importo (EUR)<input required type="number" step="0.01" value={form.importo} onChange={e => setForm({ ...form, importo: e.target.value })} /></label>
      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando...' : 'Salva'}</button>
      </div>
    </form>
  );
}

// gestione_cantiere: id, data, nome_operaio, qualifica, ore, costo_orario, totale
function RegistroPresenze() {
  const [presenze, setPresenze] = useState([]);
  const [dipendenti, setDipendenti] = useState([]);
  const [newRow, setNewRow] = useState({ nome_operaio: '', qualifica: '', data: '', ore: '8', costo_orario: '', totale: '' });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const { data: pres } = await supabase.from('gestione_cantiere').select('*').order('data', { ascending: false }).limit(50);
    const { data: dip } = await supabase.from('dipendenti').select('id, nome, ruolo, tariffa_oraria').order('nome');
    setPresenze(pres || []);
    setDipendenti(dip || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleSelectDip = nome => {
    const dip = dipendenti.find(d => d.nome === nome);
    const ore = parseFloat(newRow.ore) || 8;
    const costo = dip ? parseFloat(dip.tariffa_oraria) : 0;
    setNewRow(r => ({ ...r, nome_operaio: nome, qualifica: dip?.ruolo || '', costo_orario: costo, totale: (ore * costo).toFixed(2) }));
  };

  const handleOreChange = ore => {
    const o = parseFloat(ore) || 0;
    const c = parseFloat(newRow.costo_orario) || 0;
    setNewRow(r => ({ ...r, ore, totale: (o * c).toFixed(2) }));
  };

  const handleAddRow = async () => {
    if (!newRow.nome_operaio || !newRow.data) return;
    setSaving(true);
    const { error } = await supabase.from('gestione_cantiere').insert([{
      nome_operaio: newRow.nome_operaio, qualifica: newRow.qualifica, data: newRow.data,
      ore: parseFloat(newRow.ore) || 0, costo_orario: parseFloat(newRow.costo_orario) || 0,
      totale: parseFloat(newRow.totale) || 0,
    }]);
    setSaving(false);
    if (!error) { setNewRow({ nome_operaio: '', qualifica: '', data: '', ore: '8', costo_orario: '', totale: '' }); loadData(); }
    else alert('Errore: ' + error.message);
  };

  const handleDelete = async id => {
    if (!window.confirm('Eliminare?')) return;
    await supabase.from('gestione_cantiere').delete().eq('id', id);
    loadData();
  };

  return (
    <div className="table-section">
      <h3 className="section-title">Registro Presenze</h3>
      <div className="excel-table-wrap">
        <table className="excel-table">
          <thead>
            <tr><th>Operaio</th><th>Qualifica</th><th>Data</th><th>Ore</th><th>Costo/h</th><th>Totale</th><th></th></tr>
          </thead>
          <tbody>
            <tr className="insert-row">
              <td>
                <select value={newRow.nome_operaio} onChange={e => handleSelectDip(e.target.value)}>
                  <option value="">-- Seleziona --</option>
                  {dipendenti.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
                </select>
              </td>
              <td><input placeholder="Qualifica" value={newRow.qualifica} onChange={e => setNewRow({ ...newRow, qualifica: e.target.value })} /></td>
              <td><input type="date" value={newRow.data} onChange={e => setNewRow({ ...newRow, data: e.target.value })} /></td>
              <td><input type="number" step="0.5" value={newRow.ore} onChange={e => handleOreChange(e.target.value)} /></td>
              <td><input type="number" step="0.5" value={newRow.costo_orario} onChange={e => { const c = parseFloat(e.target.value) || 0; const o = parseFloat(newRow.ore) || 0; setNewRow(r => ({ ...r, costo_orario: e.target.value, totale: (o * c).toFixed(2) })); }} /></td>
              <td style={{ fontFamily: 'monospace', color: '#22d3ee' }}>€ {newRow.totale || '0.00'}</td>
              <td><button className="btn-add-row" onClick={handleAddRow} disabled={saving}>{saving ? '...' : '+ Aggiungi'}</button></td>
            </tr>
            {presenze.map(p => (
              <tr key={p.id}>
                <td>{p.nome_operaio}</td>
                <td>{p.qualifica || '--'}</td>
                <td>{p.data ? new Date(p.data).toLocaleDateString('it-IT') : '--'}</td>
                <td>{p.ore}h</td>
                <td>{fmt(p.costo_orario)}</td>
                <td style={{ fontFamily: 'monospace', color: '#22d3ee' }}>{fmt(p.totale)}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(p.id)}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BudgetView() {
  const [totals, setTotals] = useState({ manodopera: 0, materiali: 0, subappalti: 0, costiVari: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [matList, setMatList] = useState([]);
  const [cvList, setCvList] = useState([]);

  const loadTotals = async () => {
    setLoading(true);

    // Manodopera: somma colonna totale da gestione_cantiere
    const { data: presenze } = await supabase.from('gestione_cantiere').select('totale');
    const totMano = (presenze || []).reduce((a, p) => a + (parseFloat(p.totale) || 0), 0);

    // Materiali: somma importo
    const { data: mat } = await supabase.from('materiali').select('descrizione, importo, fornitore');
    const totMat = (mat || []).reduce((a, m) => a + (parseFloat(m.importo) || 0), 0);
    setMatList(mat || []);

    // Subappalti: somma importo
    const { data: sub } = await supabase.from('subappalti').select('importo, descrizione, fornitore');
    const totSub = (sub || []).reduce((a, s) => a + (parseFloat(s.importo) || 0), 0);

    // Costi vari: somma importo
    const { data: cv } = await supabase.from('costi_vari').select('categoria, importo');
    const totCV = (cv || []).reduce((a, c) => a + (parseFloat(c.importo) || 0), 0);
    setCvList(cv || []);

    setTotals({ manodopera: totMano, materiali: totMat, subappalti: totSub, costiVari: totCV });
    setLoading(false);
  };

  useEffect(() => { loadTotals(); }, []);

  const totalSpeso = totals.manodopera + totals.materiali + totals.subappalti + totals.costiVari;
  const utileNetto = BUDGET_TOTALE - totalSpeso;
  const utilePerc = Math.max(0, Math.round((utileNetto / BUDGET_TOTALE) * 100));
  const isAlert = utilePerc < 30;

  const chartData = {
    labels: ['Manodopera', 'Materiali', 'Subappalti', 'Costi Vari', 'Utile Netto'],
    datasets: [{
      data: [
        Math.max(0, totals.manodopera),
        Math.max(0, totals.materiali),
        Math.max(0, totals.subappalti),
        Math.max(0, totals.costiVari),
        Math.max(0, utileNetto),
      ],
      backgroundColor: ['#4ade80', '#60a5fa', '#a78bfa', '#f59e0b', isAlert ? '#ef4444' : '#22d3ee'],
      borderColor: ['#16a34a', '#2563eb', '#6d28d9', '#b45309', isAlert ? '#b91c1c' : '#0891b2'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 12, family: "'DM Sans', sans-serif" }, padding: 14 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` } },
    },
  };

  return (
    <div className="budget-view">
      {/* Bottoni azione */}
      <div className="action-bar">
        <button className="action-btn" onClick={() => setModal('cantiere')}>🏗️ Nuovo Cantiere</button>
        <button className="action-btn" onClick={() => setModal('dipendente')}>👷 Nuovo Dipendente</button>
        <button className="action-btn" onClick={() => setModal('materiale')}>🧱 Aggiungi Materiale</button>
        <button className="action-btn" onClick={() => setModal('costo')}>💼 Costo Vario</button>
      </div>

      {/* Alert utile basso */}
      {isAlert && !loading && (
        <div className="budget-alert">
          ⚠️ ATTENZIONE: Utile netto sotto il 30% del budget! ({utilePerc}%)
        </div>
      )}

      {/* Cards KPI */}
      <div className="cards-row">
        <div className="budget-card card-green">
          <div className="card-label">Budget Totale</div>
          <div className="card-value">{fmt(BUDGET_TOTALE)}</div>
        </div>
        <div className="budget-card card-orange">
          <div className="card-label">Totale Speso</div>
          <div className="card-value">{fmt(totalSpeso)}</div>
        </div>
        <div className={`budget-card ${isAlert ? 'card-red' : 'card-cyan'}`}>
          <div className="card-label">Utile Netto</div>
          <div className="card-value">{fmt(utileNetto)}</div>
        </div>
      </div>

      {/* Grafico + dettaglio */}
      <div className="chart-row">
        <div className="chart-box">
          <h3 className="section-title">Distribuzione Budget</h3>
          {loading ? <div className="loading-spinner">Caricamento...</div> : (
            <div className="doughnut-wrap">
              <Doughnut data={chartData} options={chartOptions} />
              <div className={`doughnut-center ${isAlert ? 'center-red' : 'center-cyan'}`}>
                <span className="perc-value">{utilePerc}%</span>
                <span className="perc-label">Utile</span>
              </div>
            </div>
          )}
        </div>

        <div className="cost-breakdown">
          <h3 className="section-title">Dettaglio Costi</h3>
          {[
            { label: 'Manodopera', val: totals.manodopera, cls: 'dot-green' },
            { label: 'Materiali', val: totals.materiali, cls: 'dot-blue' },
            { label: 'Subappalti', val: totals.subappalti, cls: 'dot-purple' },
            { label: 'Costi Vari', val: totals.costiVari, cls: 'dot-orange' },
          ].map(r => (
            <div className="cost-item" key={r.label}>
              <div className={`cost-dot ${r.cls}`} />
              <div className="cost-name">{r.label}</div>
              <div className="cost-amount">{fmt(r.val)}</div>
            </div>
          ))}
          <div className={`cost-item cost-total ${isAlert ? 'cost-alert' : ''}`}>
            <div className={`cost-dot ${isAlert ? 'dot-red' : 'dot-cyan'}`} />
            <div className="cost-name"><strong>Utile Netto</strong></div>
            <div className="cost-amount" style={{ color: isAlert ? '#ef4444' : '#22d3ee' }}>
              <strong>{fmt(utileNetto)} ({utilePerc}%)</strong>
            </div>
          </div>

          {matList.length > 0 && (
            <div className="sub-list">
              <div className="sub-list-title">Ultimi Materiali</div>
              {matList.slice(0, 5).map((m, i) => (
                <div key={i} className="sub-list-item">
                  <span>{m.descrizione || m.fornitore || '--'}</span>
                  <span>{fmt(m.importo)}</span>
                </div>
              ))}
            </div>
          )}
          {cvList.length > 0 && (
            <div className="sub-list">
              <div className="sub-list-title">Costi Vari Recenti</div>
              {cvList.slice(0, 5).map((c, i) => (
                <div key={i} className="sub-list-item">
                  <span>{c.categoria || '--'}</span>
                  <span>{fmt(c.importo)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registro presenze */}
      <RegistroPresenze />

      {/* Modali */}
      {modal === 'cantiere' && <ModalOverlay onClose={() => setModal(null)}><FormNuovoCantiere onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
      {modal === 'dipendente' && <ModalOverlay onClose={() => setModal(null)}><FormNuovoDipendente onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
      {modal === 'materiale' && <ModalOverlay onClose={() => setModal(null)}><FormNuovoMateriale onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
      {modal === 'costo' && <ModalOverlay onClose={() => setModal(null)}><FormCostoVario onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
    </div>
  );
}
