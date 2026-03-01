import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/supabaseClient';

ChartJS.register(ArcElement, Tooltip, Legend);

// Rimosso BUDGET_TOTALE hardcoded

function ModalOverlay({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// --- COMPONENTE GESTIONE ACCONTI ---

function GestioneAcconti({ dipendente, onClose }) {
  const [acconti, setAcconti] = useState([]);
  const [newAcconto, setNewAcconto] = useState({ importo: '', data: new Date().toISOString().split('T')[0], note: '' });

  const fetchAcconti = async () => {
    const { data } = await supabase.from('acconti').select('*').eq('dipendente_id', dipendente.id).order('data', { ascending: false });
    setAcconti(data || []);
  };

  useEffect(() => { fetchAcconti(); }, [dipendente]);

  const handleAdd = async () => {
    if (!newAcconto.importo) return;
    const { error } = await supabase.from('acconti').insert([{
      dipendente_id: dipendente.id,
      importo: parseFloat(newAcconto.importo),
      data: newAcconto.data,
      note: newAcconto.note
    }]);
    if (!error) {
      setNewAcconto({ importo: '', data: new Date().toISOString().split('T')[0], note: '' });
      fetchAcconti();
    } else alert(error.message);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare acconto?')) return;
    await supabase.from('acconti').delete().eq('id', id);
    fetchAcconti();
  };

  const totalAcconti = acconti.reduce((acc, curr) => acc + (parseFloat(curr.importo) || 0), 0);

  return (
    <div className="modal-form" style={{ maxWidth: '600px' }}>
      <h2 className="modal-title">Acconti: {dipendente.nome}</h2>

      <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Nuovo Acconto</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <label style={{ flex: 1 }}>Data<input type="date" value={newAcconto.data} onChange={e => setNewAcconto({ ...newAcconto, data: e.target.value })} /></label>
          <label style={{ flex: 1 }}>Importo (€)<input type="number" value={newAcconto.importo} onChange={e => setNewAcconto({ ...newAcconto, importo: e.target.value })} /></label>
          <label style={{ flex: 2 }}>Note<input value={newAcconto.note} onChange={e => setNewAcconto({ ...newAcconto, note: e.target.value })} /></label>
          <button className="btn-save" onClick={handleAdd} style={{ height: '38px', marginBottom: '1px' }}>+</button>
        </div>
      </div>

      <div className="excel-table-wrap" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <table className="excel-table">
          <thead><tr><th>Data</th><th>Importo</th><th>Note</th><th></th></tr></thead>
          <tbody>
            {acconti.map(a => (
              <tr key={a.id}>
                <td>{new Date(a.data).toLocaleDateString('it-IT', { timeZone: 'UTC' })}</td>
                <td style={{ color: '#fbbf24' }}>€ {a.importo}</td>
                <td style={{ color: '#94a3b8' }}>{a.note}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(a.id)}>x</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ fontWeight: 'bold' }}>TOTALE</td>
              <td style={{ fontWeight: 'bold', color: '#fbbf24' }}>€ {totalAcconti.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="modal-actions" style={{ marginTop: '20px' }}>
        <button className="btn-save" onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
}

// --- COMPONENTE LISTA DIPENDENTI CON MODIFICA INTEGRALE ---

function ListaDipendenti({ onClose }) {
  const [dips, setDips] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nome: '', ruolo: '', tariffa_oraria: '', email: '' });
  const [managingAcconti, setManagingAcconti] = useState(null); // { id, nome }

  const fetchDips = async () => {
    const { data } = await supabase.from('dipendenti').select('id, nome, ruolo, tariffa_oraria, email').order('nome');
    setDips(data || []);
  };

  useEffect(() => { fetchDips(); }, []);

  const startEdit = (dip) => {
    setEditingId(dip.id);
    setEditForm({ nome: dip.nome, ruolo: dip.ruolo, tariffa_oraria: dip.tariffa_oraria, email: dip.email || '' });
  };

  const handleSaveEdit = async (id) => {
    const { error } = await supabase
      .from('dipendenti')
      .update({
        nome: editForm.nome,
        ruolo: editForm.ruolo,
        tariffa_oraria: parseFloat(editForm.tariffa_oraria),
        email: editForm.email || null
      })
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchDips();
    } else alert("Errore durante l'aggiornamento: " + error.message);
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Eliminare definitivamente ${nome}?`)) return;
    const { error } = await supabase.from('dipendenti').delete().eq('id', id);
    if (!error) fetchDips();
  };

  if (managingAcconti) {
    return <GestioneAcconti dipendente={managingAcconti} onClose={() => setManagingAcconti(null)} />;
  }

  return (
    <div className="modal-form" style={{ maxWidth: '850px' }}>
      <h2 className="modal-title">Gestione Anagrafica Dipendenti</h2>
      <div className="excel-table-wrap" style={{ maxHeight: '450px', overflowY: 'auto' }}>
        <table className="excel-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ruolo</th>
              <th>Tariffa (€/h)</th>
              <th>Email (Login)</th>
              <th style={{ width: '160px' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {dips.map(d => (
              <tr key={d.id}>
                {editingId === d.id ? (
                  <>
                    <td><input style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #3b82f6' }} value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} /></td>
                    <td><input style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #3b82f6' }} value={editForm.ruolo} onChange={e => setEditForm({ ...editForm, ruolo: e.target.value })} /></td>
                    <td><input type="number" style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #3b82f6' }} value={editForm.tariffa_oraria} onChange={e => setEditForm({ ...editForm, tariffa_oraria: e.target.value })} /></td>
                    <td><input style={{ width: '100%', background: '#1e293b', color: 'white', border: '1px solid #3b82f6' }} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="gmail..." /></td>
                    <td>
                      <button onClick={() => handleSaveEdit(d.id)} style={{ color: '#4ade80', marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>S</button>
                      <button onClick={() => setEditingId(null)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>X</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{d.nome}</td>
                    <td>{d.ruolo}</td>
                    <td style={{ color: '#4ade80' }}>€ {d.tariffa_oraria}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{d.email || '--'}</td>
                    <td>
                      <button onClick={() => setManagingAcconti(d)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Gestisci Acconti">💰</button>
                      <button onClick={() => startEdit(d)} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa' }} title="Modifica">✎</button>
                      <button className="btn-delete" onClick={() => handleDelete(d.id, d.nome)} title="Elimina">x</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-actions" style={{ marginTop: '20px' }}>
        <button className="btn-save" onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
}
// --- COMPONENTE LISTA CANTIERI ---

function ListaCantieri({ onClose }) {
  const [cants, setCants] = useState([]);
  const fetchCants = async () => {
    const { data } = await supabase.from('cantieri').select('*').order('created_at', { ascending: false });
    setCants(data || []);
  };
  useEffect(() => { fetchCants(); }, []);

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Eliminare il cantiere ${nome}?`)) return;
    const { error } = await supabase.from('cantieri').delete().eq('id', id);
    if (!error) fetchCants();
  };

  return (
    <div className="modal-form" style={{ maxWidth: '700px' }}>
      <h2 className="modal-title">Elenco Cantieri</h2>
      <div className="excel-table-wrap">
        <table className="excel-table">
          <thead><tr><th>Nome</th><th>Indirizzo</th><th>Budget</th><th></th></tr></thead>
          <tbody>
            {cants.map(c => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.indirizzo || '--'}</td>
                <td>EUR {c.budget?.toLocaleString()}</td>
                <td><button className="btn-delete" onClick={() => handleDelete(c.id, c.nome)}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-actions" style={{ marginTop: '20px' }}><button className="btn-save" onClick={onClose}>Chiudi</button></div>
    </div>
  );
}

// --- FORM DI INSERIMENTO ---

function FormNuovoCantiere({ onClose, onSaved }) {
  const [form, setForm] = useState({ nome: '', indirizzo: '', budget: '19000' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('cantieri').insert([{ nome: form.nome, indirizzo: form.indirizzo, budget: parseFloat(form.budget) || 0 }]);
    setSaving(false); if (!error) { onSaved(); onClose(); }
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">Nuovo Cantiere</h2>
      <label>Nome Cantiere<input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label>
      <label>Indirizzo<input value={form.indirizzo} onChange={e => setForm({ ...form, indirizzo: e.target.value })} /></label>
      <label>Budget (EUR)<input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} /></label>
      <div className="modal-actions"><button type="button" className="btn-cancel" onClick={onClose}>Annulla</button><button type="submit" className="btn-save" disabled={saving}>Salva</button></div>
    </form>
  );
}

function FormNuovoDipendente({ onClose, onSaved }) {
  const [form, setForm] = useState({ nome: '', ruolo: '', tariffa_oraria: '', email: '' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('dipendenti').insert([{
      nome: form.nome,
      ruolo: form.ruolo,
      tariffa_oraria: parseFloat(form.tariffa_oraria) || 0,
      email: form.email || null
    }]);
    setSaving(false); if (!error) { onSaved(); onClose(); }
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">Nuovo Dipendente</h2>
      <label>Nome Completo<input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label>
      <label>Ruolo<input value={form.ruolo} onChange={e => setForm({ ...form, ruolo: e.target.value })} /></label>
      <label>Tariffa Oraria (EUR/h)<input type="number" step="0.5" value={form.tariffa_oraria} onChange={e => setForm({ ...form, tariffa_oraria: e.target.value })} /></label>
      <label>Email (per Google Login)<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="esempio@gmail.com" /></label>
      <div className="modal-actions"><button type="button" className="btn-cancel" onClick={onClose}>Annulla</button><button type="submit" className="btn-save" disabled={saving}>Salva</button></div>
    </form>
  );
}

function FormNuovoMateriale({ onClose, onSaved, cantieri }) {
  const [form, setForm] = useState({ descrizione: '', fornitore: '', importo: '', data: new Date().toISOString().split('T')[0], cantiere_id: cantieri[0]?.id || '' });
  const handleSubmit = async e => {
    e.preventDefault();
    const { error } = await supabase.from('materiali').insert([{
      descrizione: form.descrizione,
      fornitore: form.fornitore,
      importo: parseFloat(form.importo) || 0,
      data: form.data,
      cantiere_id: form.cantiere_id || null
    }]);
    if (!error) { onSaved(); onClose(); }
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">Aggiungi Materiale</h2>
      <label>Cantiere
        <select value={form.cantiere_id} onChange={e => setForm({ ...form, cantiere_id: e.target.value })}>
          <option value="">Nessun cantiere</option>
          {cantieri.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label>Descrizione<input required value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} /></label>
      <label>Fornitore<input value={form.fornitore} onChange={e => setForm({ ...form, fornitore: e.target.value })} /></label>
      <label>Data<input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
      <label>Importo (EUR)<input type="number" step="0.01" value={form.importo} onChange={e => setForm({ ...form, importo: e.target.value })} /></label>
      <div className="modal-actions"><button type="button" className="btn-cancel" onClick={onClose}>Annulla</button><button type="submit" className="btn-save">Salva</button></div>
    </form>
  );
}

function FormCostoVario({ onClose, onSaved, cantieri }) {
  const [form, setForm] = useState({ categoria: '', importo: '', data: new Date().toISOString().split('T')[0], cantiere_id: cantieri[0]?.id || '' });
  const handleSubmit = async e => {
    e.preventDefault();
    const { error } = await supabase.from('costi_vari').insert([{
      categoria: form.categoria,
      importo: parseFloat(form.importo) || 0,
      data: form.data,
      cantiere_id: form.cantiere_id || null
    }]);
    if (!error) { onSaved(); onClose(); }
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">Costo Vario</h2>
      <label>Cantiere
        <select value={form.cantiere_id} onChange={e => setForm({ ...form, cantiere_id: e.target.value })}>
          <option value="">Nessun cantiere</option>
          {cantieri.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label>Categoria<input required value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} /></label>
      <label>Data<input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
      <label>Importo (EUR)<input type="number" step="0.01" value={form.importo} onChange={e => setForm({ ...form, importo: e.target.value })} /></label>
      <div className="modal-actions"><button type="button" className="btn-cancel" onClick={onClose}>Annulla</button><button type="submit" className="btn-save">Salva</button></div>
    </form>
  );
}

function RegistroPresenze() {
  const [presenze, setPresenze] = useState([]);
  const [dipendenti, setDipendenti] = useState([]);
  const [cantieri, setCantieri] = useState([]);
  const [newRow, setNewRow] = useState({ dipendente_id: '', cantiere_id: '', data: new Date().toISOString().split('T')[0], ore: '8', note: '' });

  const loadData = async () => {
    // Fetch joined data consistent with PlanningView
    const { data: pres } = await supabase
      .from('gestione_cantiere')
      .select('id, data, ore_lavorate, note, costo_orario, totale, nome_operaio, qualifica, dipendente_id, ora_inizio, timbrata_da_app, indirizzo_rilevato, dipendenti(nome, ruolo, tariffa_oraria), cantiere_id, cantieri(nome)')
      .order('data', { ascending: false })
      .limit(50);

    const { data: dip } = await supabase.from('dipendenti').select('id, nome, ruolo, tariffa_oraria').order('nome');
    const { data: cant } = await supabase.from('cantieri').select('id, nome').order('nome');

    setPresenze(pres || []);
    setDipendenti(dip || []);
    setCantieri(cant || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddRow = async () => {
    if (!newRow.dipendente_id || !newRow.data) return;

    // Find rate for calculation if needed, though we primarily rely on relation now
    /* const dip = dipendenti.find(d => d.id === parseInt(newRow.dipendente_id)); */

    const { error } = await supabase.from('gestione_cantiere').insert([{
      dipendente_id: parseInt(newRow.dipendente_id),
      cantiere_id: newRow.cantiere_id ? parseInt(newRow.cantiere_id) : null,
      data: newRow.data,
      ore_lavorate: parseFloat(newRow.ore) || 0,
      note: newRow.note
    }]);

    if (!error) {
      setNewRow({ dipendente_id: '', cantiere_id: '', data: new Date().toISOString().split('T')[0], ore: '8', note: '' });
      loadData();
    } else {
      alert('Errore inserimento: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare?')) return;
    await supabase.from('gestione_cantiere').delete().eq('id', id); loadData();
  };

  // Helper to format currency
  const fmt = (val) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="table-section">
      <h3 className="section-title">Registro Presenze (Ultimi 50 movimenti)</h3>
      <div className="excel-table-wrap" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <table className="excel-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Operaio</th>
              <th>Ruolo</th>
              <th>Cantiere</th>
              <th>Ore</th>
              <th>Entrata</th>
              <th>Costo/h</th>
              <th>Totale</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr className="insert-row">
              <td><input type="date" value={newRow.data} onChange={e => setNewRow({ ...newRow, data: e.target.value })} /></td>
              <td>
                <select value={newRow.dipendente_id} onChange={e => setNewRow({ ...newRow, dipendente_id: e.target.value })}>
                  <option value="">-- Seleziona --</option>
                  {dipendenti.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </td>
              <td colSpan="1" style={{ color: '#64748b', fontSize: '0.8rem' }}>
                {/* Auto-filled role visual feedback */}
                {dipendenti.find(d => d.id === parseInt(newRow.dipendente_id))?.ruolo || '-'}
              </td>
              <td>
                <select value={newRow.cantiere_id} onChange={e => setNewRow({ ...newRow, cantiere_id: e.target.value })}>
                  <option value="">-- Cantiere --</option>
                  {cantieri.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </td>
              <td><input type="number" step="0.5" style={{ width: '60px' }} value={newRow.ore} onChange={e => setNewRow({ ...newRow, ore: e.target.value })} /></td>
              <td>
                {/* Auto-filled rate */}
                € {dipendenti.find(d => d.id === parseInt(newRow.dipendente_id))?.tariffa_oraria || 0}
              </td>
              <td>
                {/* Auto-calc total */}
                € {((parseFloat(newRow.ore) || 0) * (dipendenti.find(d => d.id === parseInt(newRow.dipendente_id))?.tariffa_oraria || 0)).toFixed(2)}
              </td>
              <td><input placeholder="Note..." value={newRow.note} onChange={e => setNewRow({ ...newRow, note: e.target.value })} /></td>
              <td><button className="btn-add-row" onClick={handleAddRow} disabled={!newRow.dipendente_id}>+</button></td>
            </tr>

            {presenze.map(p => {
              // Normalize data: use relation if available, else fallback (legacy data)
              const nome = p.dipendenti?.nome || p.nome_operaio || 'N/A';
              const ruolo = p.dipendenti?.ruolo || p.qualifica || '-';
              const tariffa = p.dipendenti?.tariffa_oraria || p.costo_orario || 0;
              const ore = p.ore_lavorate || 0; // ore field in legacy? usually ore_lavorate
              const cantiere = p.cantieri?.nome || '-';

              // Calculate total dynamically if strict consistency is preferred, 
              // or use stored 'totale' if available and you trust it. 
              // Given PlanningView doesn't store 'totale', we should calculate it.
              const calculatedTotal = ore * tariffa;

              return (
                <tr key={p.id} style={p.timbrata_da_app ? { background: 'rgba(8, 145, 178, 0.07)' } : {}}>
                  <td>{p.data ? new Date(p.data).toLocaleDateString('it-IT', { timeZone: 'UTC' }) : '-'}</td>
                  <td style={{ fontWeight: 600 }}>
                    {p.timbrata_da_app && <span title={p.indirizzo_rilevato ? `📍 ${p.indirizzo_rilevato}` : 'Timbrato da app'} style={{ marginRight: 4, cursor: 'help' }}>📱</span>}
                    {nome}
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{ruolo}</td>
                  <td>{cantiere}</td>
                  <td style={{ fontFamily: 'Space Mono', color: '#22d3ee' }}>{ore}h</td>
                  <td style={{ fontFamily: 'Space Mono', fontSize: '0.8rem', color: p.ora_inizio ? '#4ade80' : '#475569' }}>
                    {p.ora_inizio ? new Date(p.ora_inizio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td>{fmt(tariffa)}</td>
                  <td style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{fmt(calculatedTotal)}</td>
                  <td style={{ fontStyle: 'italic', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.note}>{p.note || '-'}</td>
                  <td><button className="btn-delete" onClick={() => handleDelete(p.id)}>x</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BudgetView() {
  const [totals, setTotals] = useState({ manodopera: 0, materiali: 0, costiVari: 0, subappalti: 0 });
  const [currentBudget, setCurrentBudget] = useState(0);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantieri, setCantieri] = useState([]);
  const [selectedCantiere, setSelectedCantiere] = useState('tutti');

  const loadCantieri = async () => {
    const { data } = await supabase.from('cantieri').select('id, nome, budget').order('nome');
    setCantieri(data || []);
  };

  const loadTotals = async () => {
    setLoading(true);

    // Build query based on filter
    let presQuery = supabase.from('gestione_cantiere').select('ore_lavorate, dipendenti(tariffa_oraria)');
    let matQuery = supabase.from('materiali').select('importo');
    let cvQuery = supabase.from('costi_vari').select('importo');
    let subQuery = supabase.from('subappalti').select('importo');

    if (selectedCantiere !== 'tutti') {
      presQuery = presQuery.eq('cantiere_id', selectedCantiere);
      matQuery = matQuery.eq('cantiere_id', selectedCantiere);
      cvQuery = cvQuery.eq('cantiere_id', selectedCantiere);
      subQuery = subQuery.eq('cantiere_id', selectedCantiere);
    }

    const { data: pres } = await presQuery;
    const tM = (pres || []).reduce((acc, p) => acc + (parseFloat(p.ore_lavorate || 0) * (p.dipendenti?.tariffa_oraria || 0)), 0);
    const { data: mat } = await matQuery;
    const tMa = (mat || []).reduce((acc, m) => acc + (parseFloat(m.importo) || 0), 0);
    const { data: cv } = await cvQuery;
    const tC = (cv || []).reduce((acc, c) => acc + (parseFloat(c.importo) || 0), 0);
    const { data: sub } = await subQuery;
    const tS = (sub || []).reduce((acc, s) => acc + (parseFloat(s.importo) || 0), 0);

    setTotals({ manodopera: tM, materiali: tMa, costiVari: tC, subappalti: tS });

    // Calcolo Budget Dinamico
    let activeBudget = 0;
    if (selectedCantiere === 'tutti') {
      // Se cantieri non è ancora carico, facciamo una query veloce per il totale budget
      const { data: bData } = await supabase.from('cantieri').select('budget');
      activeBudget = (bData || []).reduce((acc, c) => acc + (parseFloat(c.budget) || 0), 0);
    } else {
      const { data: bData } = await supabase.from('cantieri').select('budget').eq('id', selectedCantiere).single();
      activeBudget = parseFloat(bData?.budget) || 0;
    }
    setCurrentBudget(activeBudget);
    setLoading(false);
  };

  useEffect(() => { loadCantieri(); }, []);
  useEffect(() => { loadTotals(); }, [selectedCantiere]);

  const totalSpeso = totals.manodopera + totals.materiali + totals.costiVari + totals.subappalti;
  const utileNetto = currentBudget - totalSpeso;
  const utilePerc = currentBudget > 0 ? Math.max(0, Math.round((utileNetto / currentBudget) * 100)) : 0;

  const chartData = {
    labels: ['Speso', 'Utile'],
    datasets: [{ data: [totalSpeso, utileNetto], backgroundColor: ['#ef4444', '#22d3ee'], borderWidth: 0 }]
  };

  return (
    <div className="budget-view">
      <div className="action-bar">
        <select
          value={selectedCantiere}
          onChange={e => setSelectedCantiere(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.86rem',
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="tutti">📊 Tutti i Cantieri</option>
          {cantieri.map(c => (
            <option key={c.id} value={c.id}>🏗️ {c.nome}</option>
          ))}
        </select>
        <div style={{ width: '2px', background: '#334155', margin: '0 10px' }}></div>
        <button className="action-btn" onClick={() => setModal('cantiere')}>+ Cantiere</button>
        <button className="action-btn" onClick={() => setModal('dipendente')}>+ Dipendente</button>
        <button className="action-btn" onClick={() => setModal('materiale')}>+ Materiale</button>
        <button className="action-btn" onClick={() => setModal('costo')}>+ Costo Vario</button>
        <div style={{ width: '2px', background: '#334155', margin: '0 10px' }}></div>
        <button className="action-btn" style={{ background: '#475569' }} onClick={() => setModal('list_dips')}>Gestisci Dipendenti</button>
        <button className="action-btn" style={{ background: '#475569' }} onClick={() => setModal('list_cants')}>Gestisci Cantieri</button>
      </div>


      <div className="cards-row">
        <div className="budget-card card-green"><div>Budget</div><div className="card-value">€ {currentBudget.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div></div>
        <div className="budget-card card-orange"><div>Speso</div><div className="card-value">€ {totalSpeso.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div></div>
        <div className="budget-card card-cyan"><div>Utile</div><div className="card-value">€ {utileNetto.toLocaleString('it-IT', { minimumFractionDigits: 2 })} ({utilePerc}%)</div></div>
      </div>

      <div className="chart-row">
        <div className="chart-box" style={{ maxWidth: '300px' }}>
          {!loading && <Doughnut data={chartData} options={{ cutout: '70%' }} />}
        </div>
        <div className="cost-breakdown">
          <h3>Dettaglio Costi</h3>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80' }}></span>
            Lavoro: € {totals.manodopera.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa' }}></span>
            Materiali: € {totals.materiali.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a78bfa' }}></span>
            Subappalti: € {totals.subappalti.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
            Costi Vari: € {totals.costiVari.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <RegistroPresenze />

      {modal === 'cantiere' && <ModalOverlay onClose={() => setModal(null)}><FormNuovoCantiere onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
      {modal === 'dipendente' && <ModalOverlay onClose={() => setModal(null)}><FormNuovoDipendente onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
      {modal === 'materiale' && <ModalOverlay onClose={() => setModal(null)}><FormNuovoMateriale cantieri={cantieri} onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
      {modal === 'costo' && <ModalOverlay onClose={() => setModal(null)}><FormCostoVario cantieri={cantieri} onClose={() => setModal(null)} onSaved={loadTotals} /></ModalOverlay>}
      {modal === 'list_dips' && <ModalOverlay onClose={() => setModal(null)}><ListaDipendenti onClose={() => setModal(null)} /></ModalOverlay>}
      {modal === 'list_cants' && <ModalOverlay onClose={() => setModal(null)}><ListaCantieri onClose={() => setModal(null)} /></ModalOverlay>}
    </div>

  );


}
