import { avg, fmt, periodOf, PERIODS } from './utils';
export async function makePagella({ subjects, grades, mode, email }) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF(); const names = PERIODS[mode].full;
  const a = (arr) => (arr.length ? fmt(avg(arr)) : '-');
  const per = (arr, p) => arr.filter((g) => periodOf(g.date, mode) === p);
  doc.setFontSize(22); doc.setTextColor(124, 58, 237); doc.text('MEDIA VOTES', 14, 20);
  doc.setFontSize(12); doc.setTextColor(70); doc.text('Pagella del ' + new Date().toLocaleDateString('it-IT'), 14, 28); doc.text(email || '', 14, 34);
  const rows = subjects.map((s) => { const gs = grades.filter((g) => g.subjectId === s.id); return [s.name, a(per(gs, 1)), a(per(gs, 2)), a(gs), String(gs.length)]; });
  rows.push(['MEDIA GENERALE', a(per(grades, 1)), a(per(grades, 2)), a(grades), String(grades.length)]);
  autoTable(doc, { startY: 42, head: [['Materia', names[0], names[1], 'Totale', 'Voti']], body: rows, headStyles: { fillColor: [124, 58, 237] }, didParseCell: (d) => { if (d.section === 'body' && d.row.index === rows.length - 1) d.cell.styles.fontStyle = 'bold'; } });
  doc.save('pagella-media-votes.pdf');
}
