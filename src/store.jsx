import { createContext, useContext, useEffect, useState } from 'react';
import { uid } from './utils';
const KEY = 'mediavotes:v1';
const seed = () => ({ subjects: ['Italiano', 'Matematica', 'Inglese', 'Storia'].map((name) => ({ id: uid(), name })), grades: [] });
const load = () => {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.subjects) && Array.isArray(d.grades)) return d;
  } catch {}
  return seed();
};
const Ctx = createContext();
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [data, setData] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} }, [data]);
  const check = (name, except) => {
    name = name.trim();
    if (!name) return 'Inserisci un nome.';
    if (data.subjects.some((s) => s.id !== except && s.name.toLowerCase() === name.toLowerCase())) return 'Esiste già una materia con questo nome.';
    return null;
  };
  const api = {
    ...data,
    addSubject(name) {
      const e = check(name); if (e) return e;
      setData((d) => ({ ...d, subjects: [...d.subjects, { id: uid(), name: name.trim() }] }));
    },
    renameSubject(id, name) {
      const e = check(name, id); if (e) return e;
      setData((d) => ({ ...d, subjects: d.subjects.map((s) => (s.id === id ? { ...s, name: name.trim() } : s)) }));
    },
    deleteSubject: (id) => setData((d) => ({ subjects: d.subjects.filter((s) => s.id !== id), grades: d.grades.filter((g) => g.subjectId !== id) })),
    saveGrade: (g) => setData((d) => ({ ...d, grades: g.id ? d.grades.map((x) => (x.id === g.id ? g : x)) : [...d.grades, { ...g, id: uid() }] })),
    deleteGrade: (id) => setData((d) => ({ ...d, grades: d.grades.filter((g) => g.id !== id) })),
    importData(obj) {
      if (!obj || !Array.isArray(obj.subjects) || !Array.isArray(obj.grades)) return 'File non valido.';
      const subjects = obj.subjects.filter((s) => s && s.id && typeof s.name === 'string').map((s) => ({ id: String(s.id), name: s.name }));
      const ids = new Set(subjects.map((s) => s.id));
      const grades = obj.grades
        .filter((g) => g && ids.has(String(g.subjectId)) && Number(g.value) >= 1 && Number(g.value) <= 10)
        .map((g) => ({ id: String(g.id || uid()), subjectId: String(g.subjectId), value: Number(g.value), date: g.date || '', type: g.type || 'scritto', note: g.note || '' }));
      setData({ subjects, grades });
      return null;
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
