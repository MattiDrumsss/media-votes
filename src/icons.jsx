import { BookOpen, Calculator, Languages, FlaskConical, Globe, Dumbbell, Palette, Music, Cpu, Landmark } from 'lucide-react';
export const ICONS = { book: BookOpen, calc: Calculator, lang: Languages, flask: FlaskConical, globe: Globe, sport: Dumbbell, art: Palette, music: Music, cpu: Cpu, history: Landmark };
export const COLORS = ['#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];
export const SubjIcon = ({ s, size = 20 }) => { const I = ICONS[s.icon] || BookOpen; return <span className="sico" style={{ '--c': s.color || '#a855f7' }}><I size={size} /></span>; };
