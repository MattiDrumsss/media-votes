import { useRef, useState } from 'react';
import { Pencil, Trash2, Download, Upload, FileText } from 'lucide-react';
import { useStore } from '../store.jsx';
import { SubjIcon, COLORS, ICONS } from '../icons.jsx';
import { makePagella } from '../pdf';
import { PERIODS } from '../utils';

export default function Settings({ ask }) {
  const { subjects, allGrades, events, addSubject, updateSubject, deleteSubject, importData, session, signOut, mode, setMode } = useStore();
  const [name, setName] = useState(''); const [err, setErr] = useState('');
  const [edit, setEdit] = useState(null); const [ed, setEd] = useState({}); const [eerr, setEerr] = useState('');
  const [msg, setMsg] = useState(''); const file = useRef();
  const add = async (e) => { e.preventDefault(); const r = await addSubject(name); setErr(r || ''); if (!r) setName(''); };
  const save = async () => { const r = await updateSubject(edit, ed); setEerr(r || ''); if (!r) setEdit(null); };
  const del = (s) => { const n = allGrades.filter((g) => g.subjectId === s.id).length; ask({ title: 'Elimina materia', text: n ? `La materia "${s.name}" contiene ${n} ${n === 1 ? 'voto' : 'voti'}: eliminandola verranno eliminati anche i voti associati.` : `Eliminare la materia "${s.name}"?`, onOk: () => deleteSubject(s.id) }); };
  const exp = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ subjects, grades: allGrades, events }, null, 2)], { type: 'application/json' }));
    a.download = `media-votes-backup-${new Date().toLocaleDateString('en-CA')}.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const imp = (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let obj; try { obj = JSON.parse(r.result); } catch { return setMsg('File non valido.'); }
      ask({ title: 'Importa backup', ok: 'Importa', text: 'I dati attuali verranno sostituiti con quelli del backup. Continuare?', onOk: async () => setMsg((await importData(obj)) || 'Backup importato.') });
    };
    r.readAsText(f);
  };
  return (
    <div>
      <header className="top"><div><h1>Impostazioni</h1></div></header>
      <div className="cols">
        <div className="card"><h3>Account</h3>
          <p className="muted">Collegato come <b>{session?.user?.email}</b></p>
          <div className="row"><button className="btn ghost" onClick={signOut}>Esci</button></div>
        </div>
        <div className="card"><h3>Periodo scolastico</h3>
          <p className="muted">Come divide l'anno la tua scuola?</p>
          <div className="seg">
            <button className={mode === 'quad' ? 'on' : ''} onClick={() => setMode('quad')}>Quadrimestri</button>
            <button className={mode === 'tri' ? 'on' : ''} onClick={() => setMode('tri')}>Trimestre + pentamestre</button>
          </div>
          <p className="muted small">{mode === 'quad' ? '1° quadrimestre: settembre–gennaio. 2° quadrimestre: febbraio–agosto.' : 'Trimestre: settembre–dicembre. Pentamestre: gennaio–agosto.'}</p>
        </div>
        <div className="card"><h3>Gestione materie</h3>
          <form className="row" onSubmit={add}><input className="grow" placeholder="Nuova materia" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn" type="submit">Aggiungi</button></form>
          {err && <p className="err">{err}</p>}
          <div className="list">
            {subjects.map((s) => (
              <div key={s.id} className="line">
                {edit === s.id ? (
                  <div className="editbox">
                    <input autoFocus value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} />
                    <div className="swatches">{COLORS.map((c) => <button key={c} type="button" className={`sw ${ed.color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setEd({ ...ed, color: c })} aria-label={`Colore ${c}`} />)}</div>
                    <div className="icopick">{Object.entries(ICONS).map(([k, I]) => <button key={k} type="button" className={ed.icon === k ? 'on' : ''} onClick={() => setEd({ ...ed, icon: k })} aria-label={k}><I size={18} /></button>)}</div>
                    <div className="row"><button className="btn" onClick={save}>Salva</button><button className="btn ghost" onClick={() => { setEdit(null); setEerr(''); }}>Annulla</button></div>
                  </div>
                ) : (
                  <div className="row"><SubjIcon s={s} /><span className="grow">{s.name}</span>
                    <button className="icon-btn" onClick={() => { setEdit(s.id); setEd({ name: s.name, color: s.color, icon: s.icon }); setEerr(''); }} aria-label="Modifica materia"><Pencil size={17} /></button>
                    <button className="icon-btn red" onClick={() => del(s)} aria-label="Elimina materia"><Trash2 size={17} /></button></div>
                )}
              </div>
            ))}
          </div>
          {eerr && <p className="err">{eerr}</p>}
        </div>
        <div className="card"><h3>Pagella in PDF</h3>
          <p className="muted">Medie di ogni materia per {PERIODS[mode].full[0]}, {PERIODS[mode].full[1]} e totale.</p>
          <button className="btn" onClick={() => makePagella({ subjects, grades: allGrades, mode, email: session?.user?.email })}><FileText size={18} />Scarica pagella</button>
        </div>
        <div className="card"><h3>Backup dei dati</h3>
          <p className="muted">Scarica un file JSON con materie, voti e verifiche, oppure ripristinalo.</p>
          <div className="row wrap"><button className="btn" onClick={exp}><Download size={18} />Esporta backup</button><button className="btn ghost" onClick={() => file.current.click()}><Upload size={18} />Importa backup</button></div>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={imp} />
          {msg && <p className="muted">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
