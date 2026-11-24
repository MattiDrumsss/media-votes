import { useRef, useState } from 'react';
import { Pencil, Trash2, Check, X, Download, Upload } from 'lucide-react';
import { useStore } from '../store.jsx';

export default function Settings({ ask }) {
  const st = useStore();
  const { subjects, grades, addSubject, renameSubject, deleteSubject, importData, session, signOut } = st;
  const [name, setName] = useState(''); const [err, setErr] = useState('');
  const [edit, setEdit] = useState(null); const [en, setEn] = useState(''); const [eerr, setEerr] = useState('');
  const [msg, setMsg] = useState(''); const file = useRef();
  const add = async (e) => { e.preventDefault(); const r = await addSubject(name); setErr(r || ''); if (!r) setName(''); };
  const rename = async (id) => { const r = await renameSubject(id, en); setEerr(r || ''); if (!r) setEdit(null); };
  const del = (s) => { const n = grades.filter((g) => g.subjectId === s.id).length; ask({ title: 'Elimina materia', text: n ? `La materia "${s.name}" contiene ${n} ${n === 1 ? 'voto' : 'voti'}: eliminandola verranno eliminati anche i voti associati.` : `Eliminare la materia "${s.name}"?`, onOk: () => deleteSubject(s.id) }); };
  const exp = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ subjects, grades }, null, 2)], { type: 'application/json' }));
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
        <div className="card"><h3>Gestione materie</h3>
          <form className="row" onSubmit={add}><input className="grow" placeholder="Nuova materia" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn" type="submit">Aggiungi</button></form>
          {err && <p className="err">{err}</p>}
          <div className="list">
            {subjects.map((s) => (
              <div key={s.id} className="row between line">
                {edit === s.id ? <><input className="grow" autoFocus value={en} onChange={(e) => setEn(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && rename(s.id)} /><button className="icon-btn" onClick={() => rename(s.id)} aria-label="Salva"><Check size={18} /></button><button className="icon-btn" onClick={() => { setEdit(null); setEerr(''); }} aria-label="Annulla"><X size={18} /></button></>
                  : <><span className="grow">{s.name}</span><button className="icon-btn" onClick={() => { setEdit(s.id); setEn(s.name); setEerr(''); }} aria-label="Modifica nome"><Pencil size={17} /></button><button className="icon-btn red" onClick={() => del(s)} aria-label="Elimina materia"><Trash2 size={17} /></button></>}
              </div>
            ))}
          </div>
          {eerr && <p className="err">{eerr}</p>}
        </div>
        <div className="card"><h3>Account</h3>
          <p className="muted">Collegato come <b>{session?.user?.email}</b></p>
          <div className="row"><button className="btn ghost" onClick={signOut}>Esci</button></div>
        </div>
        <div className="card"><h3>Backup dei dati</h3>
          <p className="muted">Scarica un file JSON con materie e voti, oppure ripristinalo su un altro dispositivo.</p>
          <div className="row wrap"><button className="btn" onClick={exp}><Download size={18} />Esporta backup</button><button className="btn ghost" onClick={() => file.current.click()}><Upload size={18} />Importa backup</button></div>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={imp} />
          {msg && <p className="muted">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
