import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../lib/supabaseClient';
import { generateAttendancePdf } from '../utils/pdfGenerator';

// Generatore di colori dinamico basato sul nome
const getWorkerColor = (nome) => {
  if (!nome) return { bg: '#94a3b8', border: '#475569', text: '#0f172a' };

  // Hash semplice della stringa
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Colori HSL per garantire leggibilità
  const hue = Math.abs(hash % 360);
  const saturation = 70; // %
  const lightness = 60; // %

  return {
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    border: `hsl(${hue}, ${saturation}%, ${lightness - 20}%)`,
    text: `hsl(${hue}, ${saturation}%, 15%)` // Testo scuro per contrasto
  };
};

// Modal per aggiungere un turno
function FormNuovoTurno({ date, dipendenti, cantieri, onClose, onSaved }) {
  const [form, setForm] = useState({
    dipendente_id: dipendenti[0]?.id || '',
    cantiere_id: cantieri[0]?.id || '',
    data: date || '',
    ore_lavorate: '8',
    tipo_turno: 'Mattina',
    note: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('gestione_cantiere').insert([{
      dipendente_id: form.dipendente_id,
      cantiere_id: form.cantiere_id || null,
      data: form.data,
      ore_lavorate: parseFloat(form.ore_lavorate),
      note: `${form.tipo_turno}${form.note ? ' — ' + form.note : ''}`,
    }]);
    setSaving(false);
    if (!error) { onSaved(); onClose(); }
    else alert('Errore: ' + error.message);
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2 className="modal-title">📅 Aggiungi Turno</h2>
      <label>Dipendente
        <select required value={form.dipendente_id} onChange={e => setForm({ ...form, dipendente_id: e.target.value })}>
          {dipendenti.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </label>
      <label>Cantiere
        <select value={form.cantiere_id} onChange={e => setForm({ ...form, cantiere_id: e.target.value })}>
          <option value="">Nessun cantiere</option>
          {cantieri.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </label>
      <label>Data<input type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
      <label>Tipo Turno
        <select value={form.tipo_turno} onChange={e => setForm({ ...form, tipo_turno: e.target.value })}>
          <option>Mattina</option>
          <option>Pomeriggio</option>
          <option>Completo</option>
          <option>Straordinario</option>
        </select>
      </label>
      <label>Ore Lavorate<input type="number" step="0.5" value={form.ore_lavorate} onChange={e => setForm({ ...form, ore_lavorate: e.target.value })} /></label>
      <label>Note<input placeholder="Facoltativo…" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></label>
      <div className="modal-actions">
        <button type="button" className="btn-cancel" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Salvando…' : 'Salva Turno'}</button>
      </div>
    </form>
  );
}

// Popup evento (Dettaglio su click calendario)
function EventPopup({ event, position, onClose, onDelete }) {
  const style = {
    position: 'fixed',
    top: Math.min(position.y, window.innerHeight - 200),
    left: Math.min(position.x, window.innerWidth - 260),
    zIndex: 1000,
  };

  return (
    <div className="event-popup" style={style}>
      <button className="popup-close" onClick={onClose}>✕</button>
      <div className="popup-title">{event.title}</div>
      <div className="popup-date">{new Date(event.start).toLocaleDateString('it-IT', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      {event.extendedProps?.cantiere && <div className="popup-detail" style={{ color: '#60a5fa' }}>🏗️ {event.extendedProps.cantiere}</div>}
      {event.extendedProps?.ore && <div className="popup-detail">🕐 {event.extendedProps.ore}h lavorate</div>}
      {event.extendedProps?.note && <div className="popup-detail">📝 {event.extendedProps.note}</div>}
      {event.extendedProps?.id && (
        <button className="popup-delete" onClick={() => onDelete(event.extendedProps.id)}>
          🗑️ Elimina Turno
        </button>
      )}
    </div>
  );
}

export default function PlanningView() {
  const [events, setEvents] = useState([]);
  const [dipendenti, setDipendenti] = useState([]);
  const [cantieri, setCantieri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { date } | null
  const [popup, setPopup] = useState(null); // { event, position }
  const [filterDip, setFilterDip] = useState('tutti');
  const [filterCantiere, setFilterCantiere] = useState('tutti');
  const [stats, setStats] = useState({});
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'table'
  const [currentDateRange, setCurrentDateRange] = useState({ start: new Date(), end: new Date() });

  const calRef = useRef(null);

  const loadData = async () => {
    setLoading(true);

    // Build query based on filter
    let presQuery = supabase
      .from('gestione_cantiere')
      .select('id, data, ore_lavorate, note, dipendenti(id, nome), cantiere_id, cantieri(nome)')
      .order('data', { ascending: false });

    if (filterCantiere !== 'tutti') {
      presQuery = presQuery.eq('cantiere_id', filterCantiere);
    }

    const { data: pres } = await presQuery;
    const { data: dip } = await supabase.from('dipendenti').select('id, nome').order('nome');
    const { data: cant } = await supabase.from('cantieri').select('id, nome').order('nome');

    setDipendenti(dip || []);
    setCantieri(cant || []);

    const fcEvents = (pres || []).map(p => {
      const nome = p.dipendenti?.nome || 'Sconosciuto';
      const cantiereNome = p.cantieri?.nome || 'Nessun cantiere';
      const colors = getWorkerColor(nome);
      // Evita bug del fuso orario: new Date("YYYY-MM-DD") crea data UTC 00:00.
      // In fuso orario negativo (es. PST), getDay() vede il giorno prima.
      // Usiamo getUTCDay() per essere consistenti con la data inserita.
      const isSunday = new Date(p.data).getUTCDay() === 0;
      return {
        id: String(p.id),
        title: `${nome} (${p.ore_lavorate}h)`,
        start: p.data,
        backgroundColor: isSunday ? '#dc2626' : colors.bg,
        borderColor: isSunday ? '#7f1d1d' : colors.border,
        textColor: isSunday ? '#fff' : colors.text,
        extendedProps: {
          id: p.id,
          dipendente: nome,
          dipendente_id: p.dipendenti?.id,
          cantiere: cantiereNome,
          cantiere_id: p.cantiere_id,
          ore: p.ore_lavorate,
          note: p.note,
          data: p.data // per sorting tabella
        },
      };
    });

    setEvents(fcEvents);
    calculateStats(fcEvents, dip || []);
    setLoading(false);
  };

  const calculateStats = (currentEvents, allDipendenti) => {
    // Se siamo in vista calendario, usiamo il range visibile (approssimato al mese corrente se modale chiusa)
    // Ma per semplicità, calcoliamo le statistiche sugli eventi FILTRATI visibili

    // Filtra eventi in base al filtro dipendente
    let filtered = currentEvents;
    if (filterDip !== 'tutti') {
      filtered = currentEvents.filter(e => e.extendedProps?.dipendente_id === parseInt(filterDip));
    }

    // Calcola statistiche solo per il mese corrente (default) o range visibile
    // Per ora, semplifichiamo: calcoliamo su TUTTI gli eventi caricati che corrispondono ai filtri
    // Idealmente dovremmo filtrare per mese corrente.

    // Proviamo a filtrare per il mese CORRENTE visualizzato nel calendario se disponibile
    let msgStats = "totale";
    let eventsForStats = filtered;

    if (calRef.current) {
      const calApi = calRef.current.getApi();
      const start = calApi.view.currentStart;
      const end = calApi.view.currentEnd;

      // Filtra per range
      eventsForStats = filtered.filter(e => {
        // Usiamo p.data direttamente o forziamo UTC per il confronto
        const d = new Date(e.start + 'T00:00:00Z');
        return d >= start && d < end;
      });
      msgStats = "mese corrente";
    }

    const newStats = {};
    (allDipendenti || []).forEach(d => { newStats[d.nome] = 0; });

    eventsForStats.forEach(e => {
      const nome = e.extendedProps?.dipendente;
      if (nome) newStats[nome] = (newStats[nome] || 0) + (e.extendedProps?.ore || 0);
    });

    setStats(newStats);
  };

  // Ricalcola statistiche quando cambia la vista del calendario
  const handleDatesSet = (dateInfo) => {
    // Filtriamo gli eventi per il range visualizzato
    const start = dateInfo.start;
    const end = dateInfo.end;

    const eventsInView = events.filter(e => {
      const d = new Date(e.start + 'T00:00:00Z');
      return d >= start && d < end;
    });

    // Ricalcola stats
    const newStats = {};
    dipendenti.forEach(d => { newStats[d.nome] = 0; });

    eventsInView.forEach(e => {
      // Applica anche filtro dipendente se attivo
      if (filterDip !== 'tutti' && e.extendedProps?.dipendente_id !== parseInt(filterDip)) return;

      const nome = e.extendedProps?.dipendente;
      if (nome) newStats[nome] = (newStats[nome] || 0) + (e.extendedProps?.ore || 0);
    });

    setStats(newStats);
  };

  useEffect(() => { loadData(); }, [filterCantiere]); // Ricarica se cambia cantiere

  // Effetto per aggiornare stats quando cambia filterDip senza ricaricare tutto
  useEffect(() => {
    if (events.length > 0 && calRef.current) {
      handleDatesSet({
        start: calRef.current.getApi().view.currentStart,
        end: calRef.current.getApi().view.currentEnd
      });
    } else if (events.length > 0) {
      // Fallback se calendario non montato (es. view tabella)
      // Calcola su tutto o mese corrente default
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      handleDatesSet({ start, end });
    }
  }, [filterDip, events]);


  const filteredEvents = filterDip === 'tutti'
    ? events
    : events.filter(e => e.extendedProps?.dipendente_id === parseInt(filterDip));

  const handleDateClick = (info) => {
    // const dow = new Date(info.dateStr).getDay();
    // if (dow === 0) return; // Domenica sbloccata se si vuole
    setModal({ date: info.dateStr });
  };

  const handleEventClick = (info) => {
    const rect = info.el.getBoundingClientRect();
    setPopup({
      event: info.event,
      position: { x: rect.left, y: rect.bottom + 8 },
    });
  };

  const handleDeleteTurno = async (id) => {
    if (!window.confirm('Eliminare questo turno?')) return;
    await supabase.from('gestione_cantiere').delete().eq('id', id);
    setPopup(null);
    loadData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Assicura che la data sia in formato YYYY-MM-DD
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return datePart;
  };

  const handleDownloadPdf = () => {
    // Get current view date from calendar or default to now
    let date = new Date();
    if (calRef.current) {
      date = calRef.current.getApi().getDate();
    }

    // Filter events for this month
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const monthlyEvents = events.filter(e => {
      const d = new Date(e.start + 'T00:00:00Z');
      return d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
    });

    generateAttendancePdf(date, dipendenti, monthlyEvents);
  };

  return (
    <div className="planning-view">
      {/* Header con filtri e toggle vista */}
      <div className="planning-header">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterCantiere}
            onChange={e => setFilterCantiere(e.target.value)}
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
            <option value="tutti">🏗️ Tutti i Cantieri</option>
            {cantieri.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <div className="nav-tabs" style={{ background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <button
              className={`nav-tab ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            >
              📅 Calendario
            </button>
            <button
              className={`nav-tab ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            >
              📋 Elenco
            </button>
          </div>

          <button
            onClick={handleDownloadPdf}
            className="action-btn"
            style={{ borderColor: '#60a5fa', color: '#60a5fa' }}
          >
            📄 PDF Presenze
          </button>
        </div>

        <div className="worker-legend">
          <button
            className={`legend-chip ${filterDip === 'tutti' ? 'active' : ''}`}
            onClick={() => setFilterDip('tutti')}
            style={filterDip === 'tutti' ? { background: '#475569', borderColor: '#94a3b8' } : {}}
          >
            Tutti
          </button>
          {dipendenti.map(d => {
            const colors = getWorkerColor(d.nome);
            return (
              <button
                key={d.id}
                className={`legend-chip ${filterDip === d.id ? 'active' : ''}`}
                onClick={() => setFilterDip(filterDip === d.id ? 'tutti' : d.id)}
                style={{
                  background: filterDip === d.id ? colors.bg : 'transparent',
                  borderColor: colors.border,
                  color: filterDip === d.id ? colors.text : colors.bg,
                }}
              >
                <span
                  className="legend-dot"
                  style={{ background: colors.bg, borderColor: colors.border }}
                />
                {d.nome}
              </button>
            );
          })}
        </div>
        <button className="action-btn" onClick={() => setModal({ date: new Date().toISOString().split('T')[0] })}>
          + Aggiungi Turno
        </button>
      </div>

      {/* Stats Cards (visibili solo in calendar mode o sempre? Facciamo sempre per ora ma calcolate sul mese corrente) */}
      <div className="worker-stats">
        {Object.entries(stats).map(([nome, ore]) => {
          // Mostra solo se > 0 o se fa parte dei dipendenti filtrati
          if (ore === 0 && filterDip !== 'tutti') return null;

          const colors = getWorkerColor(nome);
          return (
            <div key={nome} className="worker-stat-card" style={{ borderColor: colors.border }}>
              <div className="ws-dot" style={{ background: colors.bg }} />
              <div className="ws-name">{nome}</div>
              <div className="ws-ore">{ore}h</div>
              <div className="ws-label">mese corr.</div>
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      {viewMode === 'calendar' ? (
        <div className="calendar-box">
          {loading ? (
            <div className="loading-spinner">Caricamento calendario…</div>
          ) : (
            <FullCalendar
              ref={calRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="it"
              firstDay={1}
              height="auto"
              events={filteredEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              datesSet={handleDatesSet} // Callback quando cambia mese/vista
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth',
              }}
              buttonText={{ today: 'Oggi', month: 'Mese' }}
              eventDisplay="block"
              dayMaxEvents={3}
            />
          )}

          {/* Legenda dinamica rimossa perché i colori sono auto-generati e mostrati sopra */}
          <div className="calendar-legend">
            <div className="legend-item" style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '0.78rem' }}>
              💡 Clicca su un giorno per aggiungere un turno
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="table-section">
          <div className="excel-table-wrap">
            <table className="excel-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Dipendente</th>
                  <th>Cantiere</th>
                  <th>Ore</th>
                  <th>Note</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Nessun turno trovato</td></tr>
                ) : (
                  filteredEvents.sort((a, b) => new Date(b.start) - new Date(a.start)).map(evt => (
                    <tr key={evt.id}>
                      <td>{formatDate(evt.extendedProps.data)}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: evt.backgroundColor,
                          color: evt.textColor,
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {evt.extendedProps.dipendente}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8' }}>{evt.extendedProps.cantiere}</td>
                      <td style={{ fontFamily: 'Space Mono', fontWeight: '700', color: '#22d3ee' }}>{evt.extendedProps.ore}h</td>
                      <td style={{ fontStyle: 'italic', color: '#94a3b8' }}>{evt.extendedProps.note || '-'}</td>
                      <td>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteTurno(evt.id)}
                          title="Elimina"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Aggiungi Turno */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <FormNuovoTurno
              date={modal.date}
              dipendenti={dipendenti}
              cantieri={cantieri}
              onClose={() => setModal(null)}
              onSaved={loadData}
            />
          </div>
        </div>
      )}

      {/* Popup evento */}
      {popup && (
        <>
          <div className="popup-backdrop" onClick={() => setPopup(null)} />
          <EventPopup
            event={popup.event}
            position={popup.position}
            onClose={() => setPopup(null)}
            onDelete={handleDeleteTurno}
          />
        </>
      )}
    </div>
  );
}
