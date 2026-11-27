import { avg, fmt, periodOf, PERIODS } from './utils';

const rgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return [168, 85, 247]; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rnd = (v) => (v == null ? null : Math.floor(v + 0.5));
const lvl = (r) => (r == null ? [148, 163, 184] : r < 6 ? [239, 68, 68] : r === 6 ? [217, 119, 6] : [16, 185, 129]);
const show = (r) => (r == null ? '-' : String(r));
async function loadLogo() {
  try {
    const b = await (await fetch('/icon-192.png')).blob();
    return await new Promise((res) => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); });
  } catch { return null; }
}

export async function makePagella({ subjects, grades, mode, email }) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210; const names = PERIODS[mode].full; const img = await loadLogo();
  const per = (arr, p) => arr.filter((g) => periodOf(g.date, mode) === p);

  // fascia in alto con sfumatura viola
  for (let i = 0; i < 48; i++) { const t = i / 47; doc.setFillColor(Math.round(22 + 54 * t), Math.round(14 + 15 * t), Math.round(53 + 96 * t)); doc.rect((i * W) / 48, 0, W / 48 + 0.3, 42, 'F'); }
  if (img) doc.addImage(img, 'PNG', 14, 8, 26, 26);
  const tx = img ? 46 : 14;
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.text('PAGELLA', tx, 21);
  doc.setFontSize(11); doc.setTextColor(216, 180, 254); doc.text('MEDIA VOTES', tx, 29);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(226, 232, 240);
  doc.text(new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }), W - 14, 21, { align: 'right' });
  doc.text(email || '', W - 14, 27, { align: 'right' });

  // dati
  const rows = subjects.map((s) => {
    const gs = grades.filter((g) => g.subjectId === s.id);
    const ex = [avg(per(gs, 1)), avg(per(gs, 2)), avg(gs)];
    return { name: s.name, color: rgb(s.color), n: gs.length, exact: ex, r: ex.map(rnd) };
  });
  const gex = [avg(per(grades, 1)), avg(per(grades, 2)), avg(grades)];
  rows.push({ name: 'MEDIA GENERALE', color: [76, 29, 149], n: grades.length, exact: gex, r: gex.map(rnd), total: true });
  const withG = rows.filter((r) => !r.total && r.r[2] != null);
  const suff = withG.filter((r) => r.r[2] >= 6).length;

  // riquadri riepilogo
  const bw = (W - 28 - 12) / 3;
  [['MEDIA GENERALE', show(rnd(gex[2])), lvl(rnd(gex[2])), gex[2] != null ? `esatta ${fmt(gex[2])}` : ''], ['MATERIE SUFFICIENTI', `${suff}/${withG.length}`, [76, 29, 149], 'con media da 6 in su'], ['VOTI REGISTRATI', String(grades.length), [76, 29, 149], 'in tutto l\'anno']].forEach(([l, v, c, sub], i) => {
    const x = 14 + i * (bw + 6);
    doc.setFillColor(245, 243, 255); doc.roundedRect(x, 50, bw, 28, 4, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(120, 113, 150); doc.text(l, x + 5, 58);
    doc.setFontSize(20); doc.setTextColor(...c); doc.text(v, x + 5, 69);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(140, 134, 170); doc.text(sub, x + 5, 75);
  });

  // tabella
  autoTable(doc, {
    startY: 86, margin: { left: 14, right: 14 }, theme: 'plain',
    head: [['Materia', names[0], names[1], 'Finale', 'Voti']],
    body: rows.map((r) => [r.name, show(r.r[0]), show(r.r[1]), show(r.r[2]), String(r.n)]),
    styles: { font: 'helvetica', fontSize: 10, cellPadding: { top: 3, bottom: 6, left: 4, right: 4 }, valign: 'top', lineColor: [233, 228, 250], lineWidth: { bottom: 0.3 } },
    headStyles: { fillColor: [76, 29, 149], textColor: 255, fontStyle: 'bold', halign: 'center', valign: 'middle', cellPadding: { top: 4, bottom: 4, left: 4, right: 4 }, lineWidth: 0 },
    columnStyles: { 0: { halign: 'left', cellWidth: 60, fontStyle: 'bold', cellPadding: { top: 5, bottom: 5, left: 11, right: 4 } }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center', fillColor: [245, 243, 255] }, 4: { halign: 'center', textColor: [120, 113, 150] } },
    didParseCell: (d) => {
      if (d.section === 'head' && d.column.index === 0) d.cell.styles.halign = 'left';
      if (d.section !== 'body') return;
      const m = rows[d.row.index];
      if (d.column.index >= 1 && d.column.index <= 3) { d.cell.styles.textColor = lvl(m.r[d.column.index - 1]); d.cell.styles.fontSize = 15; d.cell.styles.fontStyle = 'bold'; }
      if (m.total) { d.cell.styles.fillColor = [237, 233, 254]; d.cell.styles.fontStyle = 'bold'; }
    },
    didDrawCell: (d) => {
      if (d.section !== 'body') return;
      const m = rows[d.row.index], c = d.cell;
      if (d.column.index === 0) { doc.setFillColor(...m.color); doc.roundedRect(c.x + 3, c.y + 3.5, 3, c.height - 7, 1.5, 1.5, 'F'); }
      if (d.column.index >= 1 && d.column.index <= 3) {
        const ex = m.exact[d.column.index - 1];
        if (ex != null) { doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(140, 134, 170); doc.text(fmt(ex), c.x + c.width / 2, c.y + c.height - 2.2, { align: 'center' }); }
      }
    },
  });

  let y = doc.lastAutoTable.finalY + 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 113, 150);
  const note = doc.splitTextToSize("Il voto grande e la media arrotondata all'intero, come potrebbe essere riportata in pagella. Il numero piccolo sotto e la media esatta.", W - 28);
  doc.text(note, 14, y); y += note.length * 4 + 8;

  // colpo d'occhio
  const bars = rows.filter((r) => !r.total && r.exact[2] != null);
  if (bars.length) {
    if (y > 245) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(40, 30, 80); doc.text("Colpo d'occhio", 14, y); y += 7;
    bars.forEach((r) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 55, 90); doc.text(r.name.length > 22 ? r.name.slice(0, 21) + '.' : r.name, 14, y + 4);
      doc.setFillColor(237, 233, 254); doc.roundedRect(60, y, 118, 5, 2.5, 2.5, 'F');
      doc.setFillColor(...r.color); doc.roundedRect(60, y, Math.max(4, (r.exact[2] / 10) * 118), 5, 2.5, 2.5, 'F');
      doc.setFont('helvetica', 'bold'); doc.setTextColor(...lvl(r.r[2])); doc.text(`${fmt(r.exact[2])}  (${r.r[2]})`, 182, y + 4);
      y += 8;
    });
  }

  // piè di pagina
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setDrawColor(233, 228, 250); doc.setLineWidth(0.3); doc.line(14, 287, W - 14, 287);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(150, 144, 180);
    doc.text('Generato con MEDIA VOTES', 14, 292); doc.text(`Pagina ${i} di ${n}`, W - 14, 292, { align: 'right' });
  }
  doc.save('pagella-media-votes.pdf');
}
