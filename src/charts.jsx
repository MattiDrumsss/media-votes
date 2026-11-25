import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { byDate } from './utils';
import { acc } from './theme';

export const tip = { contentStyle: { background: '#17142a', border: '1px solid #3b2d6b', borderRadius: 12, color: '#fff' }, cursor: { stroke: '#a855f7', fill: 'rgba(168,85,247,.1)' } };
const axis = { stroke: '#8b86a3', fontSize: 12 };
export const Chart = ({ children }) => <div className="chart"><ResponsiveContainer width="100%" height={260}>{children}</ResponsiveContainer></div>;

export function Trend({ data, name }) {
  if (data.length < 2) return <div className="empty">Servono almeno 2 voti per vedere l'andamento.</div>;
  const c = acc();
  return (
    <Chart>
      <ComposedChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs><linearGradient id="trendg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.45} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke="#8b86a32e" vertical={false} />
        <XAxis dataKey="d" {...axis} /><YAxis domain={[1, 10]} {...axis} /><Tooltip {...tip} />
        <Area type="monotone" dataKey="v" stroke="none" fill="url(#trendg)" tooltipType="none" animationDuration={1800} animationEasing="ease-out" />
        <Line type="monotone" dataKey="v" name={name} stroke={c} strokeWidth={3.5} className="glow-line" dot={{ r: 4, fill: c, stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 8 }} animationDuration={1600} animationEasing="ease-out" />
      </ComposedChart>
    </Chart>
  );
}
export const gradeSeries = (gs) => [...gs].sort(byDate).map((g) => ({ d: new Date(g.date + 'T00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }), v: g.value }));
export { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, axis };
