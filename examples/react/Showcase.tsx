import { useEffect, useRef, useState } from 'react';
import { GuidedDemo } from './GuidedDemo.js';
import { ComponentExplorer } from './ComponentExplorer.js';
import { EvidenceExamples } from './EvidenceExamples.js';
import { SupervisionLab } from './SupervisionLab.js';
import { showcaseLinks, showcaseView, type ShowcaseView } from './showcase-navigation.js';
import './showcase.css';

const labels: Record<ShowcaseView, string> = { overview: 'Overview', demo: 'Guided demo', components: 'Components', trust: 'Trust & control' };
const descriptions: Record<ShowcaseView, string> = {
  overview: 'Interactive AI Product Design System', demo: 'Guided Demo', components: 'Component Explorer', trust: 'Trust & Control Lab',
};
export function Showcase() {
  const [view, setView] = useState(() => showcaseView(window.location.hash));
  const [visited, setVisited] = useState<Set<ShowcaseView>>(() => new Set([showcaseView(window.location.hash)]));
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.tunTheme || 'system');
  const menuButton = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);
  useEffect(() => {
    const change = () => {
      const next = showcaseView(window.location.hash);
      setView(next); setVisited(old => new Set([...old, next])); setMenuOpen(false);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.title = `TUN Systemic Design — ${descriptions[view]}`;
    if (first.current) { first.current = false; return; }
    if (view !== 'demo') main.current?.querySelector<HTMLElement>(`[data-route="${view}"] [data-view-title]`)?.focus();
  }, [view]);
  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menuOpen]);
  function selectTheme(value: string) {
    setTheme(value);
    if (value === 'system') delete document.documentElement.dataset.tunTheme;
    else document.documentElement.dataset.tunTheme = value;
  }
  return <div className="sc-site">
    <a className="skip-link" href="#showcase-main" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Skip to content</a>
    <header className="sc-header">
      <a className="sc-brand" href="#overview" aria-label="TUN Systemic Design overview">TUN<span>SYSTEMIC DESIGN</span></a>
      <div className="sc-header-controls">
        <label className="sc-theme"><span>Theme</span><select value={theme} onChange={e => selectTheme(e.target.value)}>
          <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
        </select></label>
        <button ref={menuButton} type="button" className="sc-menu-button" aria-expanded={menuOpen} aria-controls="showcase-navigation" onClick={() => setMenuOpen(open => !open)}>Menu</button>
      </div>
      <nav id="showcase-navigation" className="sc-nav" aria-label="Main navigation" data-open={menuOpen}>
        {(Object.keys(labels) as ShowcaseView[]).map(item => <a key={item} href={`#${item}`} aria-current={view === item ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{labels[item]}</a>)}
        <a href={showcaseLinks.documentation} target="_blank" rel="noopener noreferrer">Documentation<span className="sc-sr-only"> (opens in a new tab)</span></a>
        <a href={showcaseLinks.repository} target="_blank" rel="noopener noreferrer">GitHub<span className="sc-sr-only"> (opens in a new tab)</span></a>
      </nav>
    </header>
    <aside className="sc-simulation" aria-label="Simulation boundary"><strong>Interactive simulation.</strong> No messages, connected accounts, or external actions. No persistent AI memory.</aside>
    <main ref={main} id="showcase-main" className="sc-main" tabIndex={-1}>
      <div data-route="overview" hidden={view !== 'overview'}><Overview /></div>
      {visited.has('demo') && <div data-route="demo" hidden={view !== 'demo'}><GuidedDemo active={view === 'demo'} /></div>}
      {visited.has('components') && <div data-route="components" hidden={view !== 'components'}><ComponentExplorer /></div>}
      {visited.has('trust') && <div data-route="trust" hidden={view !== 'trust'}><TrustLab /></div>}
    </main>
    <footer className="sc-footer"><div><strong>TUN Systemic Design</strong><p>Human Intent. Machine Intelligence. Systemic Design.</p></div>
      <div><a href={showcaseLinks.documentation} target="_blank" rel="noopener noreferrer">Read the documentation<span className="sc-sr-only"> (opens in a new tab)</span></a>
        <p>Reference UI library v0.1 · Not a production agent runtime.</p></div>
    </footer>
  </div>;
}
function Overview() {
  return <>
    <section className="sc-hero" aria-labelledby="overview-title">
      <div><p className="sc-kicker">A DESIGN SYSTEM FOR AI-NATIVE PRODUCTS</p>
        <h1 id="overview-title" data-view-title tabIndex={-1}>Design intelligence<br />around <em>humanity.</em></h1>
        <p className="sc-lede">Make context visible. Keep actions controllable. Make outcomes accountable.</p>
        <div className="sc-actions"><a className="sc-button sc-primary" href="#demo">Try the guided demo <span aria-hidden="true">→</span></a><a className="sc-button" href="#components">Explore 14 components</a></div>
        <p className="sc-small">No sign-in. No API keys. A working reference, not a mockup.</p>
      </div>
      <div className="sc-system-card" aria-label="The TUN relationship">
        <span className="sc-kicker">THE RELATIONSHIP WE DESIGN</span>
        <div className="sc-system-row"><b>01</b><div><strong>Human intent</strong><span>You define the outcome.</span></div></div>
        <div className="sc-system-row"><b>02</b><div><strong>Visible intelligence</strong><span>Inspect context, plans, and evidence.</span></div></div>
        <div className="sc-system-row"><b>03</b><div><strong>Bounded action</strong><span>Authorize the exact proposal.</span></div></div>
        <div className="sc-system-row"><b>04</b><div><strong>Accountable outcome</strong><span>Verify what happened. Keep control.</span></div></div>
        <p className="sc-small">Capability is not permission.</p>
      </div>
    </section>
    <section className="sc-section" aria-labelledby="paths-title"><p className="sc-kicker">THREE WAYS TO EXPLORE</p><h2 id="paths-title">Start simple. Go deeper.</h2>
      <div className="sc-paths">
        <article className="sc-path"><span className="sc-index">01 / EXPERIENCE</span><h3>Follow one clear task.</h3><p>Prepare a project update, inspect its basis, and approve or reject a simulated publication.</p><a href="#demo">Open guided demo <span aria-hidden="true">→</span></a></article>
        <article className="sc-path"><span className="sc-index">02 / BUILD</span><h3>Explore the building blocks.</h3><p>Fourteen real React components, representative states, usage boundaries, and API links.</p><a href="#components">Open component explorer <span aria-hidden="true">→</span></a></article>
        <article className="sc-path"><span className="sc-index">03 / CHALLENGE</span><h3>See what happens at the edges.</h3><p>Missing evidence, uncertain outcomes, stop requests, and recovery without rewriting history.</p><a href="#trust">Open trust & control lab <span aria-hidden="true">→</span></a></article>
      </div>
    </section>
    <section className="sc-principles sc-section" aria-labelledby="principles-title"><div><p className="sc-kicker">BEYOND THE INTERFACE</p><h2 id="principles-title">Design the relationship.<br />Not just the screen.</h2><p>People, agents, information, authority, and outcomes belong in the same design conversation.</p><a href={showcaseLinks.specification} target="_blank" rel="noopener noreferrer">Read the draft specification<span className="sc-sr-only"> (opens in a new tab)</span></a></div>
      <div><p className="sc-principle-line">Simplicity with <strong>Boldness.</strong></p><p className="sc-principle-line">Consistency with <strong>Conciseness.</strong></p><p className="sc-principle-line">Clarity with <strong>Confidence.</strong></p><p className="sc-small">Clear communication must never manufacture certainty.</p></div>
    </section>
  </>;
}
function TrustLab() {
  return <>
    <header className="sc-page-heading"><p className="sc-kicker">TRUST & CONTROL LAB</p><h1 data-view-title tabIndex={-1}>Capability needs boundaries.</h1><p className="sc-lede">Explore the moments when a system should explain, wait, verify, or recover.</p></header>
    <nav className="sc-trust-jumps" aria-label="Trust scenarios">
      <button className="sc-button" onClick={() => document.getElementById('trust-evidence')?.focus()}>Evidence & memory</button>
      <button className="sc-button" onClick={() => document.getElementById('trust-supervision')?.focus()}>Stopping & recovery</button>
      <a className="sc-button" href="#demo">Approval & unknown outcomes</a>
    </nav>
    <section id="trust-evidence" tabIndex={-1} className="sc-section"><h2>Evidence and memory</h2><p>These are synthetic examples. Source access, confidence, and remembered preferences do not grant authority.</p><EvidenceExamples /></section>
    <section id="trust-supervision" tabIndex={-1} className="sc-section"><SupervisionLab /></section>
    <section className="sc-panel"><h2>Need the full engineering view?</h2><p>The original technical lab is preserved. It is a separate page session, not a control surface for the guided demo.</p>
      <a href="?lab=1" target="_blank" rel="noopener noreferrer">Open the full technical lab (new tab)</a></section>
  </>;
}
