import { avg, byDate } from './utils';
export function achievements(grades, subjects) {
  const s = [...grades].sort(byDate); let cur = 0, best = 0;
  s.forEach((g) => { cur = g.value >= 6 ? cur + 1 : 0; best = Math.max(best, cur); });
  const n = grades.length, gen = avg(grades);
  const avgs = subjects.map((x) => avg(grades.filter((g) => g.subjectId === x.id))).filter((v) => v != null);
  const A = (id, icon, title, desc, v, max) => ({ id, icon, title, desc, cur: Math.min(v, max), max, done: v >= max });
  return {
    streak: cur, best,
    list: [
      A('first', 'Rocket', 'Si parte', 'Registra il primo voto', n, 1),
      A('ten', 'ListChecks', 'Dieci voti', 'Registra 10 voti', n, 10),
      A('fifty', 'Trophy', 'Mezzo centinaio', 'Registra 50 voti', n, 50),
      A('ten10', 'Crown', 'Il dieci', 'Prendi un 10', grades.filter((g) => g.value === 10).length, 1),
      A('eight5', 'Target', 'Alto livello', '5 voti da 8 in su', grades.filter((g) => g.value >= 8).length, 5),
      A('s5', 'Flame', 'Serie da 5', '5 voti sufficienti di fila', best, 5),
      A('s10', 'Zap', 'Serie da 10', '10 voti sufficienti di fila', best, 10),
      A('a7', 'TrendingUp', 'Media del 7', 'Media generale da 7 con almeno 5 voti', n >= 5 && gen >= 7 ? 1 : 0, 1),
      A('a8', 'Medal', "Media dell'8", 'Media generale da 8 con almeno 5 voti', n >= 5 && gen >= 8 ? 1 : 0, 1),
      A('ok', 'ShieldCheck', 'Tutto in regola', 'Tutte le materie sufficienti (almeno 3 con voti)', avgs.length >= 3 && avgs.every((v) => v >= 6) ? 1 : 0, 1),
    ],
  };
}
