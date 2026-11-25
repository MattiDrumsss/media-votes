import React from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from './store.jsx';
import App from './App.jsx';
import './styles.css';
import { applyTheme } from './theme';
applyTheme();
matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);
createRoot(document.getElementById('root')).render(<StoreProvider><App /></StoreProvider>);

if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
