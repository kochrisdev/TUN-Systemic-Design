import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@tun-systemic/react/styles.css';
import './demo.css';
import { App } from './App.js';
const root = document.getElementById('root');
if (!root) throw new Error('The demo root element is missing.');
createRoot(root).render(<StrictMode><App /></StrictMode>);
