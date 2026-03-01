import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { supabase } from '../lib/supabaseClient';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fmt = (n) => `€ ${parseFloat(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;
const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;

function Semaforo({ margine }) {
  const color = margine >= 30 ? '#4ade80' : margine >= 15 ? '#f59e0b' : '#ef4444';
  const label = margine >= 30 ? 'OTTIMO' : margine >= 15 ? 'ATTENZIONE' : 'CRITICO';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ color, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

function FormRicavo({ cantiere, onClose, onSaved }) {
  const [form, setForm] = useState({ tipo: 'SAL', descrizione: '', importo: '', data: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('ricavi').insert([{
      cantiere_id: cantiere.id, tipo: form.tipo,
      descrizione: form.descrizione, importo: parseFloat(form.importo) || 0, data: form.data,
    }]);
    setSaving(false);
    if (!error) { onSaved(); onClose(); } else alert('Errore: ' + error.message);
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">💰 Aggiungi Ricavo</h2>
      <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 16 }}>{cantiere.nome}</div>
      <label>Tipo
        <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
          <option>SAL</option><option>Acconto</option><option>Saldo</option><option>Extra</option>
        </select>
      </label>
      <label>Descrizione<input value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} /></label>
      <label>Data<input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
      <label>Importo (EUR)<input required type="number" step="0.01" value={form.importo} onChange={e => setForm({ ...form, importo: e.target.value })} /></label>
      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando...' : 'Salva'}</button>
      </div>
    </form>
  );
}

function FormCosto({ cantiere, onClose, onSaved }) {
  const [tipo, setTipo] = useState('materiale');
  const [form, setForm] = useState({ descrizione: '', categoria: '', fornitore: '', importo: '', data: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    let error;
    if (tipo === 'materiale') {
      ({ error } = await supabase.from('materiali').insert([{ cantiere_id: cantiere.id, descrizione: form.descrizione, fornitore: form.fornitore, importo: parseFloat(form.importo) || 0, data: form.data }]));
    } else if (tipo === 'costo_vario') {
      ({ error } = await supabase.from('costi_vari').insert([{ cantiere_id: cantiere.id, categoria: form.categoria, importo: parseFloat(form.importo) || 0, data: form.data }]));
    } else if (tipo === 'subappalto') {
      ({ error } = await supabase.from('subappalti').insert([{ cantiere_id: cantiere.id, fornitore: form.fornitore, descrizione: form.descrizione, importo: parseFloat(form.importo) || 0, data: form.data }]));
    }
    setSaving(false);
    if (!error) { onSaved(); onClose(); } else alert('Errore: ' + error.message);
  };
  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">💼 Aggiungi Costo</h2>
      <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 16 }}>{cantiere.nome}</div>
      <label>Tipo Costo
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="materiale">Materiale</option>
          <option value="costo_vario">Costo Vario</option>
          <option value="subappalto">Subappalto</option>
        </select>
      </label>
      {(tipo === 'materiale' || tipo === 'subappalto') && <label>Fornitore / Ditta<input value={form.fornitore} onChange={e => setForm({ ...form, fornitore: e.target.value })} /></label>}
      {tipo === 'materiale' && <label>Descrizione<input required value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} /></label>}
      {tipo === 'subappalto' && <label>Descrizione Subappalto<input value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} /></label>}
      {tipo === 'costo_vario' && <label>Categoria<input required placeholder="Noleggio, Smaltimento..." value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} /></label>}
      <label>Data<input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
      <label>Importo (EUR)<input required type="number" step="0.01" value={form.importo} onChange={e => setForm({ ...form, importo: e.target.value })} /></label>
      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando...' : 'Salva Costo'}</button>
      </div>
    </form>
  );
}

function DetailTable({ title, color, items, columns, onDelete }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${color}33`, borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
      <div style={{ color, fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{title}</div>
      {!items || items.length === 0 ? (
        <div style={{ color: '#475569', fontSize: '0.84rem' }}>Nessun dato</div>
      ) : (
        <div className="excel-table-wrap">
          <table className="excel-table">
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th></th></tr></thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={row.id || i}>
                  {columns.map(c => (
                    <td key={c.key} style={c.mono ? { fontFamily: 'monospace', color: c.color } : {}}>
                      {c.render ? c.render(row[c.key], row) : (row[c.key] || '--')}
                    </td>
                  ))}
                  <td><button className="btn-delete" onClick={() => onDelete(row.id)}>x</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CantiereDetail({ cantiere, onBack }) {
  const [dati, setDati] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    const cid = cantiere.id;
    const [matR, cvR, subR, presR, ricR] = await Promise.all([
      supabase.from('materiali').select('*').eq('cantiere_id', cid).order('data'),
      supabase.from('costi_vari').select('*').eq('cantiere_id', cid).order('data'),
      supabase.from('subappalti').select('*').eq('cantiere_id', cid).order('data'),
      supabase.from('gestione_cantiere').select('*, dipendenti(nome, tariffa_oraria)').eq('cantiere_id', cid).order('data'),
      supabase.from('ricavi').select('*').eq('cantiere_id', cid).order('data'),
    ]);
    const mat = matR.data || [];
    const cv = cvR.data || [];
    const sub = subR.data || [];
    const pres = presR.data || [];
    const ric = ricR.data || [];
    const totMat = mat.reduce((a, r) => a + parseFloat(r.importo || 0), 0);
    const totCV = cv.reduce((a, r) => a + parseFloat(r.importo || 0), 0);
    const totSub = sub.reduce((a, r) => a + parseFloat(r.importo || 0), 0);
    const totMano = pres.reduce((a, r) => a + (parseFloat(r.ore_lavorate || 0) * parseFloat(r.dipendenti?.tariffa_oraria || 0)), 0);
    const totRicavi = ric.reduce((a, r) => a + parseFloat(r.importo || 0), 0);
    const totCosti = totMat + totCV + totSub + totMano;
    const margine = totRicavi - totCosti;
    const marginePerc = pct(margine, totRicavi);
    const budget = parseFloat(cantiere.budget || 0);
    const scostamento = totCosti - budget;
    const budgetUsatoPerc = pct(totCosti, budget);
    setDati({ mat, cv, sub, pres, ric, totMat, totCV, totSub, totMano, totRicavi, totCosti, margine, marginePerc, budget, scostamento, budgetUsatoPerc });
    setLoading(false);
  };

  useEffect(() => { load(); }, [cantiere.id]);

  if (loading) return <div className="loading-spinner">Caricamento...</div>;

  const { mat, cv, sub, pres, ric, totMat, totCV, totSub, totMano, totRicavi, totCosti, margine, marginePerc, budget, scostamento, budgetUsatoPerc } = dati;
  const dateRender = v => v ? new Date(v).toLocaleDateString('it-IT', { timeZone: 'UTC' }) : '--';

  const barData = {
    labels: ['Budget', 'Manodopera', 'Materiali', 'Subappalti', 'Costi Vari', 'Ricavi'],
    datasets: [{
      label: 'EUR',
      data: [budget, totMano, totMat, totSub, totCV, totRicavi],
      backgroundColor: ['#334155', '#4ade80', '#60a5fa', '#a78bfa', '#f59e0b', '#22d3ee'],
      borderRadius: 6,
    }],
  };
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` } } },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#1a2e3a' } },
      y: { ticks: { color: '#94a3b8', callback: v => `€${(v / 1000).toFixed(0)}k` }, grid: { color: '#1a2e3a' } },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button className="btn-cancel" onClick={onBack} style={{ padding: '7px 16px' }}>← Cantieri</button>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' }}>{cantiere.nome}</div>
          {cantiere.indirizzo && <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{cantiere.indirizzo}</div>}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button className="action-btn" onClick={() => setModal('costo')}>+ Costo</button>
          <button className="action-btn" onClick={() => setModal('ricavo')}>+ Ricavo</button>
        </div>
      </div>

      {/* KPI cards — 5 colonne */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {/* Budget preventivato */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
          <div className="card-label">💼 Budget Preventivo</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>{fmt(budget)}</div>
        </div>
        {/* Costi reali */}
        <div style={{ background: 'var(--bg-card)', border: `1px solid ${totCosti > budget ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
          <div className="card-label">🔨 Costi Reali</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '1rem', fontWeight: 700, color: totCosti > budget ? '#ef4444' : '#f59e0b', marginTop: 4 }}>{fmt(totCosti)}</div>
          <div style={{ fontSize: '0.7rem', color: totCosti > budget ? '#ef4444' : '#475569', marginTop: 2 }}>
            {budgetUsatoPerc}% del budget
          </div>
        </div>
        {/* Scostamento budget */}
        <div style={{ background: 'var(--bg-card)', border: `1px solid ${scostamento > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(74,222,128,0.3)'}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', background: scostamento > 0 ? 'rgba(239,68,68,0.06)' : 'var(--bg-card)' }}>
          <div className="card-label">📊 Scostamento</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '1rem', fontWeight: 700, color: scostamento > 0 ? '#ef4444' : '#4ade80', marginTop: 4 }}>
            {scostamento > 0 ? '+' : ''}{fmt(scostamento)}
          </div>
          <div style={{ fontSize: '0.7rem', color: scostamento > 0 ? '#ef4444' : '#4ade80', marginTop: 2 }}>
            {scostamento > 0 ? '⚠️ Sforamento' : '✓ In budget'}
          </div>
        </div>
        {/* Ricavi */}
        <div style={{ background: 'var(--bg-card)', border: 'rgba(34,211,238,0.3)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', border: '1px solid rgba(34,211,238,0.3)' }}>
          <div className="card-label">💰 Ricavi Incassati</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '1rem', fontWeight: 700, color: '#22d3ee', marginTop: 4 }}>{fmt(totRicavi)}</div>
        </div>
        {/* Margine */}
        <div style={{ background: 'var(--bg-card)', border: `1px solid ${marginePerc >= 30 ? 'rgba(74,222,128,0.3)' : marginePerc >= 15 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.4)'}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
          <div className="card-label">📈 Margine Netto</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '1rem', fontWeight: 700, color: marginePerc >= 30 ? '#4ade80' : marginePerc >= 15 ? '#f59e0b' : '#ef4444', marginTop: 4 }}>
            {fmt(margine)}
          </div>
          <Semaforo margine={marginePerc} />
        </div>
      </div>

      {/* Barra budget */}
      {budget > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', color: '#94a3b8' }}>
            <span>Utilizzo Budget Preventivo</span>
            <span style={{ color: budgetUsatoPerc > 100 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{budgetUsatoPerc}% — {fmt(totCosti)} / {fmt(budget)}</span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, budgetUsatoPerc)}%`,
              background: budgetUsatoPerc > 100 ? '#ef4444' : budgetUsatoPerc > 80 ? '#f59e0b' : '#4ade80',
              borderRadius: 6,
              transition: 'width 0.5s ease',
            }} />
          </div>
          {budgetUsatoPerc > 100 && (
            <div style={{ marginTop: 8, color: '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
              ⚠️ Budget sforato di {fmt(scostamento)} ({budgetUsatoPerc - 100}% in eccesso)
            </div>
          )}
        </div>
      )}

      {/* Grafico + breakdown */}
      <div className="chart-row">
        <div className="chart-box" style={{ padding: 20 }}>
          <h3 className="section-title">Budget vs Costi vs Ricavi</h3>
          <Bar data={barData} options={barOptions} />
        </div>
        <div className="cost-breakdown" style={{ padding: 20 }}>
          <h3 className="section-title">Dettaglio Costi</h3>
          {[
            { label: 'Manodopera', val: totMano, cls: 'dot-green', pctVal: pct(totMano, totCosti) },
            { label: 'Materiali', val: totMat, cls: 'dot-blue', pctVal: pct(totMat, totCosti) },
            { label: 'Subappalti', val: totSub, cls: 'dot-purple', pctVal: pct(totSub, totCosti) },
            { label: 'Costi Vari', val: totCV, cls: 'dot-orange', pctVal: pct(totCV, totCosti) },
          ].map(r => (
            <div className="cost-item" key={r.label}>
              <div className={`cost-dot ${r.cls}`} />
              <div className="cost-name">{r.label}</div>
              <div className="cost-amount">{fmt(r.val)}</div>
              <div style={{ marginLeft: 8, fontSize: '0.72rem', color: '#475569', minWidth: 30 }}>{r.pctVal}%</div>
            </div>
          ))}
          <div className="cost-item" style={{ borderTop: '1px solid #1e3a4a', marginTop: 8, paddingTop: 12 }}>
            <div className="cost-dot" style={{ background: '#334155' }} />
            <div className="cost-name">Budget Preventivo</div>
            <div className="cost-amount" style={{ color: '#94a3b8' }}>{fmt(budget)}</div>
          </div>
          <div className="cost-item">
            <div className="cost-dot dot-cyan" />
            <div className="cost-name"><strong>Ricavi Totali</strong></div>
            <div className="cost-amount" style={{ color: '#22d3ee' }}><strong>{fmt(totRicavi)}</strong></div>
          </div>
          <div className="cost-item">
            <div className={`cost-dot ${margine >= 0 ? 'dot-green' : 'dot-red'}`} />
            <div className="cost-name"><strong>Margine</strong></div>
            <div className="cost-amount" style={{ color: margine >= 0 ? '#4ade80' : '#ef4444' }}>
              <strong>{fmt(margine)} ({marginePerc}%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabelle dettaglio */}
      <DetailTable title="💰 Ricavi" color="#22d3ee" items={ric} columns={[
        { key: 'data', label: 'Data', render: dateRender },
        { key: 'tipo', label: 'Tipo' },
        { key: 'descrizione', label: 'Descrizione' },
        { key: 'importo', label: 'Importo', render: v => fmt(v), mono: true, color: '#22d3ee' },
      ]} onDelete={async id => { await supabase.from('ricavi').delete().eq('id', id); load(); }} />

      <DetailTable title="👷 Manodopera" color="#4ade80" items={pres.map(p => ({
        ...p, _nome: p.dipendenti?.nome || '--', _tariffa: p.dipendenti?.tariffa_oraria || 0,
        _totale: (p.ore_lavorate || 0) * (p.dipendenti?.tariffa_oraria || 0),
      }))} columns={[
        { key: 'data', label: 'Data', render: dateRender },
        { key: '_nome', label: 'Operaio' },
        { key: 'ore_lavorate', label: 'Ore', render: v => `${v}h` },
        { key: '_tariffa', label: 'Costo/h', render: v => fmt(v) },
        { key: '_totale', label: 'Totale', render: v => fmt(v), mono: true, color: '#4ade80' },
      ]} onDelete={async id => { await supabase.from('gestione_cantiere').delete().eq('id', id); load(); }} />

      <DetailTable title="🧱 Materiali" color="#60a5fa" items={mat} columns={[
        { key: 'data', label: 'Data', render: dateRender },
        { key: 'descrizione', label: 'Descrizione' },
        { key: 'fornitore', label: 'Fornitore' },
        { key: 'importo', label: 'Importo', render: v => fmt(v), mono: true, color: '#60a5fa' },
        { key: 'foto_url', label: 'Foto', render: v => v ? <a href={v} target="_blank" rel="noreferrer" style={{ color: '#22d3ee' }}>👁️ Vedi</a> : '--' },
      ]} onDelete={async id => { await supabase.from('materiali').delete().eq('id', id); load(); }} />

      <DetailTable title="🏗️ Subappalti" color="#a78bfa" items={sub} columns={[
        { key: 'data', label: 'Data', render: dateRender },
        { key: 'descrizione', label: 'Descrizione' },
        { key: 'fornitore', label: 'Ditta' },
        { key: 'importo', label: 'Importo', render: v => fmt(v), mono: true, color: '#a78bfa' },
      ]} onDelete={async id => { await supabase.from('subappalti').delete().eq('id', id); load(); }} />

      <DetailTable title="💼 Costi Vari" color="#f59e0b" items={cv} columns={[
        { key: 'data', label: 'Data', render: dateRender },
        { key: 'categoria', label: 'Categoria' },
        { key: 'importo', label: 'Importo', render: v => fmt(v), mono: true, color: '#f59e0b' },
      ]} onDelete={async id => { await supabase.from('costi_vari').delete().eq('id', id); load(); }} />

      {modal === 'ricavo' && <div className="modal-overlay" onClick={() => setModal(null)}><div className="modal-box" onClick={e => e.stopPropagation()}><FormRicavo cantiere={cantiere} onClose={() => setModal(null)} onSaved={load} /></div></div>}
      {modal === 'costo' && <div className="modal-overlay" onClick={() => setModal(null)}><div className="modal-box" onClick={e => e.stopPropagation()}><FormCosto cantiere={cantiere} onClose={() => setModal(null)} onSaved={load} /></div></div>}
    </div>
  );
}

export default function CantieriView() {
  const [cantieri, setCantieri] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [newC, setNewC] = useState({ nome: '', indirizzo: '', budget: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: cant } = await supabase.from('cantieri').select('*').order('created_at', { ascending: false });
    setCantieri(cant || []);
    const sum = {};
    for (const c of cant || []) {
      const [matR, cvR, subR, presR, ricR] = await Promise.all([
        supabase.from('materiali').select('importo').eq('cantiere_id', c.id),
        supabase.from('costi_vari').select('importo').eq('cantiere_id', c.id),
        supabase.from('subappalti').select('importo').eq('cantiere_id', c.id),
        supabase.from('gestione_cantiere').select('ore_lavorate, dipendenti(tariffa_oraria)').eq('cantiere_id', c.id),
        supabase.from('ricavi').select('importo').eq('cantiere_id', c.id),
      ]);
      const totMat = (matR.data || []).reduce((a, r) => a + parseFloat(r.importo || 0), 0);
      const totCV = (cvR.data || []).reduce((a, r) => a + parseFloat(r.importo || 0), 0);
      const totSub = (subR.data || []).reduce((a, r) => a + parseFloat(r.importo || 0), 0);
      const totMano = (presR.data || []).reduce((a, r) => a + (parseFloat(r.ore_lavorate || 0) * parseFloat(r.dipendenti?.tariffa_oraria || 0)), 0);
      const totRicavi = (ricR.data || []).reduce((a, r) => a + parseFloat(r.importo || 0), 0);
      const totCosti = totMat + totCV + totSub + totMano;
      const budget = parseFloat(c.budget || 0);
      sum[c.id] = {
        totCosti, totRicavi, budget,
        margine: totRicavi - totCosti,
        marginePerc: pct(totRicavi - totCosti, totRicavi),
        budgetUsatoPerc: pct(totCosti, budget),
        scostamento: totCosti - budget,
      };
    }
    setSummary(sum);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('cantieri').insert([{ nome: newC.nome, indirizzo: newC.indirizzo, budget: parseFloat(newC.budget) || 0 }]);
    setSaving(false);
    if (!error) { setModal(false); setNewC({ nome: '', indirizzo: '', budget: '' }); load(); }
    else alert('Errore: ' + error.message);
  };

  if (selected) return <CantiereDetail cantiere={selected} onBack={() => { setSelected(null); load(); }} />;

  return (
    <div className="budget-view">
      <div className="action-bar">
        <button className="action-btn" onClick={() => setModal(true)}>🏗️ Nuovo Cantiere</button>
      </div>

      {loading ? <div className="loading-spinner">Caricamento cantieri...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {cantieri.length === 0 && (
            <div style={{ color: '#475569', padding: '48px', textAlign: 'center', gridColumn: '1/-1' }}>
              Nessun cantiere ancora. Creane uno!
            </div>
          )}
          {cantieri.map(c => {
            const s = summary[c.id] || {};
            const mp = s.marginePerc || 0;
            const semColor = mp >= 30 ? '#4ade80' : mp >= 15 ? '#f59e0b' : '#ef4444';
            const bup = s.budgetUsatoPerc || 0;
            const budgetBarColor = bup > 100 ? '#ef4444' : bup > 80 ? '#f59e0b' : '#4ade80';
            return (
              <div key={c.id} onClick={() => setSelected(c)} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '18px 20px', cursor: 'pointer', transition: 'all 0.18s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = semColor; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

                {/* Nome + stato */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0' }}>{c.nome}</div>
                  <div style={{ background: c.stato === 'In corso' ? 'rgba(74,222,128,0.12)' : 'rgba(148,163,184,0.1)', color: c.stato === 'In corso' ? '#4ade80' : '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: `1px solid ${c.stato === 'In corso' ? 'rgba(74,222,128,0.3)' : 'rgba(148,163,184,0.2)'}`, whiteSpace: 'nowrap' }}>
                    {c.stato || 'In corso'}
                  </div>
                </div>
                {c.indirizzo && <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: 12 }}>{c.indirizzo}</div>}

                {/* Budget preventivo — ben visibile */}
                <div style={{ background: 'rgba(51,65,85,0.4)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>💼 Budget Preventivato</div>
                  <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '1.05rem', fontWeight: 700, color: '#94a3b8' }}>{fmt(c.budget)}</div>
                </div>

                {/* KPI grid: 4 valori */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
                  <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Costi Reali</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.88rem', fontWeight: 700, color: '#f59e0b' }}>{fmt(s.totCosti)}</div>
                  </div>
                  <div style={{ background: 'rgba(34,211,238,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ricavi</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.88rem', fontWeight: 700, color: '#22d3ee' }}>{fmt(s.totRicavi)}</div>
                  </div>
                  <div style={{ background: s.scostamento > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.06)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Scostamento</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.88rem', fontWeight: 700, color: s.scostamento > 0 ? '#ef4444' : '#4ade80' }}>
                      {s.scostamento > 0 ? '+' : ''}{fmt(s.scostamento)}
                    </div>
                  </div>
                  <div style={{ background: `rgba(${mp >= 30 ? '74,222,128' : mp >= 15 ? '245,158,11' : '239,68,68'},0.08)`, borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Margine</div>
                    <div style={{ fontFamily: 'Space Mono,monospace', fontSize: '0.88rem', fontWeight: 700, color: semColor }}>{mp}%</div>
                  </div>
                </div>

                {/* Barra utilizzo budget */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#475569', marginBottom: 4 }}>
                    <span>Utilizzo budget</span>
                    <span style={{ color: budgetBarColor }}>{bup}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, bup)}%`, background: budgetBarColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Semaforo margine={mp} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm(`Eliminare "${c.nome}" e tutti i suoi dati?`)) {
                          supabase.from('cantieri').delete().eq('id', c.id).then(() => load());
                        }
                      }}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#fca5a5', fontSize: '0.75rem', padding: '4px 10px', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      🗑️ Elimina
                    </button>
                    <span style={{ color: '#334155', fontSize: '0.72rem' }}>Apri →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave} className="modal-form">
              <h2 className="modal-title">🏗️ Nuovo Cantiere</h2>
              <label>Nome Cantiere<input required value={newC.nome} onChange={e => setNewC({ ...newC, nome: e.target.value })} /></label>
              <label>Indirizzo<input value={newC.indirizzo} onChange={e => setNewC({ ...newC, indirizzo: e.target.value })} /></label>
              <label>💼 Budget Preventivato (EUR)<input required type="number" step="0.01" placeholder="es. 45000" value={newC.budget} onChange={e => setNewC({ ...newC, budget: e.target.value })} /></label>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Annulla</button>
                <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando...' : 'Crea Cantiere'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
