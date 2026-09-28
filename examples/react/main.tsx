import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@tun-systemic/react/styles.css';
import './demo.css';
import './supervision.css';
import { App } from './App.js';
import { Showcase } from './Showcase.js';
const root = document.getElementById('root');
if (!root) throw new Error('The demo root element is missing.');
// The original technical lab remains a separately addressable page session.
const technicalLab = new URLSearchParams(window.location.search).get('lab') === '1';
if (technicalLab) document.title = 'TUN Systemic Design — Technical Component Lab';
createRoot(root).render(<StrictMode>{technicalLab ? <>
  <aside className="sc-technical-return" aria-label="Showcase navigation"><a href="./#overview">Return to the public showcase</a> · Separate local simulation; navigation starts a new page session.</aside>
  <App />
</> : <Showcase />}</StrictMode>);
