/* global React, ReactDOM */
const { useState, useEffect, useRef, useMemo } = React;

// ============================================================
// Helpers
// ============================================================
function useT() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('sf-lang') || 'ko'; } catch (e) { return 'ko'; }
  });
  useEffect(() => {
    try { localStorage.setItem('sf-lang', lang); } catch (e) {}
    document.documentElement.lang = lang;
    document.body.dataset.lang = lang;
  }, [lang]);
  const t = window.I18N[lang];
  return { lang, setLang, t };
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', as: Tag = 'div', stagger = false, ...props }) {
  const ref = useReveal();
  const cls = `${stagger ? 'reveal-stagger' : 'reveal'} ${className}`.trim();
  return <Tag ref={ref} className={cls} {...props}>{children}</Tag>;
}

function Eyebrow({ children }) {
  return <div className="eyebrow"><span className="dot"></span>{children}</div>;
}

function Multiline({ text }) {
  return text.split('\n').map((l, i) => (
    <React.Fragment key={i}>{i > 0 && <br />}{l}</React.Fragment>
  ));
}

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-svg">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

// ============================================================
// Header
// ============================================================
// 직원 전용 DSP 플랫폼 (회사 Google 계정으로만 로그인됨)
const TEAM_LOGIN_URL = 'https://platform.shineflowseattle.com';

function Header({ lang, setLang, t, onContact }) {
  const [scrolled, setScrolled] = useState(false);
  const [onLight, setOnLight] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // detect if header overlaps a light section
      const lightSections = document.querySelectorAll('.section-light, .proof');
      let overlap = false;
      const headerH = 70;
      lightSections.forEach(s => {
        const r = s.getBoundingClientRect();
        if (r.top <= headerH && r.bottom >= headerH) overlap = true;
      });
      setOnLight(overlap);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${onLight ? 'on-light' : ''}`}>
      <a href="#top" className="logo" aria-label="Shineflow home">
        <img src="assets/logo.png" alt="SHINEFLOW" />
      </a>
      <nav className="nav">
        <a href="#why">{t.nav.why}</a>
        <a href="#what">{t.nav.services}</a>
        <a href="#process">{t.nav.process}</a>
        <a href="#cases">{t.nav.cases}</a>
        <a href="#faq">{t.nav.faq}</a>
      </nav>
      <div className="header-right">
        <a className="team-login" href={TEAM_LOGIN_URL}>{t.nav.teamLogin}</a>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button className={lang === 'ko' ? 'active' : ''} onClick={() => setLang('ko')}>KR</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
        </div>
        <button className="btn btn-ghost" onClick={onContact}>
          {t.nav.contact}
          <span className="btn-arrow"><ArrowIcon /></span>
        </button>
      </div>
    </header>
  );
}

// ============================================================
// Hero
// ============================================================
function Hero({ t, onContact }) {
  return (
    <section className="hero" id="top">
      <div className="hero-stage" aria-hidden="true">
        <div className="hero-keyvisual-wrap">
          <img className="hero-keyvisual" src="assets/hero-keyvisual.jpg" alt="" />
          <div className="hero-laser-track">
            <div className="hero-laser-glow"></div>
            <div className="hero-laser-line"></div>
            <div className="hero-laser-comet"></div>
          </div>
        </div>
        <div className="hero-vignette"></div>
      </div>
      <div className="hero-content">
        <Reveal className="hero-eyebrow-line"><Multiline text={t.hero.eyebrow} /></Reveal>
        <Reveal>
          <h1 className="hero-title">
            {t.hero.title1}<br />{t.hero.title2}
          </h1>
        </Reveal>
        <Reveal className="hero-cta-row">
          <button className="btn btn-primary" onClick={onContact}>
            {t.hero.ctaPrimary}
            <span className="btn-arrow"><ArrowIcon /></span>
          </button>
          <a className="btn btn-ghost" href="#why">{t.hero.ctaSecondary}</a>
        </Reveal>
      </div>
      <div className="hero-ticker">
        <div>{t.hero.tickerLeft}</div>
        <div className="scroll-hint"><span className="line"></span>{t.hero.tickerRight}</div>
      </div>
    </section>
  );
}

// ============================================================
// Brand band (marquee)
// ============================================================
const BRAND_LOGOS = Array.from({ length: 26 }, (_, i) => `assets/brands/brand-${String(i + 1).padStart(2, '0')}.png`);

function BrandBand({ t }) {
  // Duplicate the list so the marquee loops seamlessly
  const loop = [...BRAND_LOGOS, ...BRAND_LOGOS];
  return (
    <section className="brand-band" aria-label={t.brands.label}>
      <div className="brand-band-label">{t.brands.label}</div>
      <div className="brand-marquee">
        <div className="brand-track">
          {loop.map((src, i) => (
            <div className="brand-cell" key={i}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Proof / Quick why
// ============================================================
function Proof({ t }) {
  return (
    <section className="section proof section-light" id="proof">
      <div className="container">
        <Reveal className="section-head" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Eyebrow>{t.proof.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal className="proof-text">
          <Multiline text={t.proof.body} />
        </Reveal>
        <Reveal className="proof-image">
          <img src="assets/collage-2.jpg" alt="" />
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// Why DSP
// ============================================================
function WhyDSP({ t }) {
  return (
    <section className="section" id="why">
      <div className="container">
        <Reveal className="section-head">
          <Eyebrow>{t.why.eyebrow}</Eyebrow>
          <h2 className="h-section"><Multiline text={t.why.title} /></h2>
          <p className="body-lg" style={{ maxWidth: 760 }}>{t.why.body}</p>
        </Reveal>
        <Reveal className="why-grid" stagger>
          {t.why.cards.map((c) => (
            <div className="why-card" key={c.num}>
              <div className="num">{c.num}</div>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </Reveal>
        <Reveal>
          <div style={{ marginTop: 56, fontSize: 13, color: 'var(--muted-on-dark)' }}>{t.why.perfTitle}</div>
          <div className="perf-stats" style={{ '--perf-cols': t.why.perf.length }}>
            {t.why.perf.map((p, i) => (
              <div className="perf-stat" key={i}>
                <div className="big"><span className="accent">{p.big}</span></div>
                <div className="meta">{p.meta}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(246,242,235,0.4)' }}>{t.why.footnote}</div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// What DSP Does
// ============================================================
const journeyIcons = [
  // discover - magnifier
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/></svg>,
  // consider - heart
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  // return - refresh
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  // repeat - trending up
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
];
const surfaceIcons = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
];

function WhatDSPDoes({ t }) {
  return (
    <section className="section section-light" id="what">
      <div className="container">
        <Reveal className="section-head">
          <Eyebrow>{t.what.eyebrow}</Eyebrow>
          <h2 className="h-section"><Multiline text={t.what.title} /></h2>
          <p className="body-lg" style={{ maxWidth: 760 }}>{t.what.body}</p>
        </Reveal>
        <Reveal className="journey" stagger>
          {t.what.journey.map((j, i) => (
            <div className="journey-card" key={j.num}>
              <div className="journey-num">{j.num}</div>
              <div className="journey-icon">{journeyIcons[i]}</div>
              <h4>{j.t} <span style={{ color: 'rgba(16,16,16,0.45)', fontWeight: 400, fontSize: 13 }}>· {j.sub}</span></h4>
              <p>{j.d}</p>
            </div>
          ))}
        </Reveal>

        <Reveal className="surface-list">
          <div>
            <h3>{t.what.surfaceTitle}</h3>
            <p>{t.what.surfaceBody}</p>
          </div>
          <div className="surface-grid">
            {t.what.surfaces.map((s, i) => (
              <div className="surface-item" key={i}>
                {surfaceIcons[i]}
                <span>{s}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div style={{ marginTop: 64, marginBottom: 16, fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', color: 'rgba(16,16,16,0.7)' }}>{t.what.compareTitle}</div>
          <div className="compare">
            <table>
              <thead>
                <tr>
                  {t.what.compare.head.map((h, i) => (
                    <th key={i} className={i === 1 ? 'dsp' : ''}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.what.compare.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={ci === 0 ? 'crit' : (ci === 1 ? 'dsp' : '')}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="compare-foot">{t.what.compare.foot}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// Dashboard / AMC × AI
// ============================================================
function Dashboard({ t }) {
  // 12 weeks of data — sales line ascending, spend rising more gradually
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const w = i + 1;
    // Smooth ascending growth with slight variance
    const sales = 32 + i * 6.4 + Math.sin(i * 0.9) * 4 + (i > 7 ? (i - 7) * 3.2 : 0);
    const spend = 14 + i * 1.6 + Math.cos(i * 0.7) * 1.2;
    return { w, sales, spend };
  });
  const maxSales = Math.max(...weeks.map(d => d.sales)) * 1.15;
  const W = 720, H = 220, P = { l: 36, r: 16, t: 16, b: 28 };
  const xFor = (i) => P.l + (i / (weeks.length - 1)) * (W - P.l - P.r);
  const yFor = (v) => H - P.b - (v / maxSales) * (H - P.t - P.b);

  const salesPath = weeks.map((d, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(d.sales).toFixed(1)}`).join(' ');
  const spendPath = weeks.map((d, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(d.spend).toFixed(1)}`).join(' ');
  const salesArea = `${salesPath} L${xFor(weeks.length - 1).toFixed(1)},${H - P.b} L${xFor(0).toFixed(1)},${H - P.b} Z`;

  // ROAS bars by campaign
  const camps = [
    { name: 'Awareness', v: 2.8 },
    { name: 'Consideration', v: 3.6 },
    { name: 'Retarget — DPV', v: 4.7 },
    { name: 'Cart Abandon', v: 5.2 },
    { name: 'Brand Loyal', v: 6.1 },
  ];
  const maxBar = 7;

  // Donut — device
  const devices = [
    { label: t.dash.ringLegend[0], v: 18, color: '#FF7A1A' },
    { label: t.dash.ringLegend[1], v: 64, color: '#F6F2EB' },
    { label: t.dash.ringLegend[2], v: 18, color: 'rgba(246,242,235,0.32)' },
  ];
  let acc = 0;
  const C = 2 * Math.PI * 38; // circumference for r=38

  return (
    <section className="section dash" id="dashboard">
      <div className="container">
        <Reveal className="section-head">
          <Eyebrow>{t.dash.eyebrow}</Eyebrow>
          <h2 className="h-section"><Multiline text={t.dash.title} /></h2>
          <p className="body-lg" style={{ maxWidth: 760 }}><Multiline text={t.dash.body} /></p>
        </Reveal>

        <Reveal className="dash-frame">
          <div className="dash-frame-top">
            <div className="dash-tabs">
              <span className="dot dot-r"></span>
              <span className="dot dot-y"></span>
              <span className="dot dot-g"></span>
              <span className="dash-tab active">Overview</span>
              <span className="dash-tab">Campaigns</span>
              <span className="dash-tab">Audiences</span>
              <span className="dash-tab">AMC Insights</span>
            </div>
            <div className="dash-frame-meta">LIVE · UPDATED 2m ago</div>
          </div>

          {/* KPI cards */}
          <div className="kpi-grid">
            {t.dash.kpis.map((k, i) => (
              <div key={i} className="kpi">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.value}</div>
                <div className="kpi-delta">↑ {k.delta}</div>
              </div>
            ))}
          </div>

          <div className="dash-grid">
            {/* Big chart */}
            <div className="dash-card dash-card-wide">
              <div className="dash-card-head">
                <div className="dash-card-title">{t.dash.chartTitle}</div>
                <div className="dash-legend">
                  <span><i className="sw sw-orange"></i>{t.dash.chartLegend[0]}</span>
                  <span><i className="sw sw-cream"></i>{t.dash.chartLegend[1]}</span>
                </div>
              </div>
              <svg className="dash-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75, 1].map((f, i) => (
                  <line key={i} x1={P.l} x2={W - P.r} y1={H - P.b - f * (H - P.t - P.b)} y2={H - P.b - f * (H - P.t - P.b)} stroke="rgba(246,242,235,0.08)" strokeDasharray="2 4" />
                ))}
                <path d={salesArea} fill="url(#salesGrad)" />
                <path d={spendPath} fill="none" stroke="rgba(246,242,235,0.55)" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d={salesPath} fill="none" stroke="#FF7A1A" strokeWidth="2.2" className="chart-line" />
                {weeks.map((d, i) => (
                  <circle key={i} cx={xFor(i)} cy={yFor(d.sales)} r={i === weeks.length - 1 ? 4 : 2.5} fill="#FF7A1A" />
                ))}
                {/* x labels */}
                {weeks.filter((_, i) => i % 2 === 0).map((d, idx) => {
                  const i = idx * 2;
                  return <text key={i} x={xFor(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="rgba(246,242,235,0.45)" fontFamily="Geist">W{d.w}</text>;
                })}
                {/* y labels */}
                {[0.25, 0.5, 0.75, 1].map((f, i) => (
                  <text key={i} x={P.l - 6} y={H - P.b - f * (H - P.t - P.b) + 3} textAnchor="end" fontSize="9" fill="rgba(246,242,235,0.45)" fontFamily="Geist">${(maxSales * f).toFixed(0)}k</text>
                ))}
              </svg>
            </div>

            {/* Donut */}
            <div className="dash-card">
              <div className="dash-card-head">
                <div className="dash-card-title">{t.dash.ring}</div>
              </div>
              <div className="ring-wrap">
                <svg viewBox="0 0 100 100" className="ring">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(246,242,235,0.06)" strokeWidth="10" />
                  {devices.map((d, i) => {
                    const len = (d.v / 100) * C;
                    const dash = `${len} ${C - len}`;
                    const offset = -acc;
                    acc += len;
                    return (
                      <circle key={i} cx="50" cy="50" r="38" fill="none"
                        stroke={d.color} strokeWidth="10"
                        strokeDasharray={dash} strokeDashoffset={offset}
                        transform="rotate(-90 50 50)" />
                    );
                  })}
                </svg>
                <div className="ring-center">
                  <div className="ring-num">2.41M</div>
                  <div className="ring-cap">Reach</div>
                </div>
              </div>
              <div className="ring-legend">
                {devices.map((d, i) => (
                  <div key={i}><i style={{ background: d.color }}></i>{d.label} <b>{d.v}%</b></div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="dash-card">
              <div className="dash-card-head">
                <div className="dash-card-title">{t.dash.bars}</div>
              </div>
              <div className="bars">
                {camps.map((c, i) => (
                  <div key={i} className="bar-row">
                    <div className="bar-label">{c.name}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(c.v / maxBar) * 100}%` }}></div>
                    </div>
                    <div className="bar-val">{c.v.toFixed(1)}x</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audience table */}
            <div className="dash-card dash-card-wide">
              <div className="dash-card-head">
                <div className="dash-card-title">{t.dash.table}</div>
              </div>
              <table className="dash-table">
                <thead>
                  <tr>
                    {t.dash.tableHead.map((h, i) => <th key={i} className={i === 0 ? '' : 'num'}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {t.dash.tableRows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td key={j} className={j === 0 ? '' : 'num'}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dash-foot">{t.dash.footnote}</div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// Full Why Shineflow
// ============================================================
function FullWhyShineflow({ t }) {
  return (
    <section className="section" id="services">
      <div className="container">
        <Reveal className="section-head">
          <Eyebrow>{t.full.eyebrow}</Eyebrow>
          <h2 className="h-section"><Multiline text={t.full.title} /></h2>
          <p className="body-lg" style={{ maxWidth: 820 }}>{t.full.body}</p>
        </Reveal>
        <Reveal className="cap-grid" stagger>
          {t.full.caps.map((c) => (
            <div className="cap" key={c.num}>
              <div className="cap-num">{c.num}</div>
              <h4>{c.t}</h4>
              <p>{c.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// Operating model
// ============================================================
function OperatingModel({ t }) {
  return (
    <section className="section" id="process">
      <div className="container">
        <Reveal className="section-head">
          <Eyebrow>{t.ops.eyebrow}</Eyebrow>
          <h2 className="h-section"><Multiline text={t.ops.title} /></h2>
          <p className="body-lg" style={{ maxWidth: 820 }}>{t.ops.body}</p>
        </Reveal>

        <Reveal className="ops-strip">
          {t.ops.strip.map((s) => (
            <div className="ops-strip-item" key={s.n}>
              <div className="n">{s.n}</div>
              <div className="t">{s.t}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className="ops-grid" stagger>
          {t.ops.cards.map((c) => (
            <div className="ops-card" key={c.num}>
              <div className="ops-card-head">
                <span className="ops-card-num">{c.num}</span>
                <div>
                  <h4>{c.t}</h4>
                  <div className="label-en">{c.en}</div>
                </div>
              </div>
              <p>{c.d}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// Performance & Cases
// ============================================================
function Cases({ t }) {
  return (
    <section className="section section-light" id="cases">
      <div className="container">
        <Reveal className="section-head">
          <Eyebrow>{t.cases.eyebrow}</Eyebrow>
          <h2 className="h-section"><Multiline text={t.cases.title} /></h2>
          <p className="body-lg" style={{ maxWidth: 720 }}>{t.cases.body}</p>
        </Reveal>

        <Reveal className="case-feature">
          <div>
            <span className="tag">{t.cases.caseTag}</span>
            <h3>{t.cases.caseTitle}</h3>
            <div className="case-sub">{t.cases.caseSub}</div>
            <dl>
              <div>
                <dt>{t.cases.caseFields.challenge}</dt>
                <dd>{t.cases.caseChallenge}</dd>
              </div>
              <div>
                <dt>{t.cases.caseFields.approach}</dt>
                <dd>{t.cases.caseApproach}</dd>
              </div>
            </dl>
            <div className="case-link-row">
              <a className="btn btn-ghost" href="cases.html">{t.cases.seeMore}<span className="btn-arrow"><ArrowIcon /></span></a>
              <span className="placeholder-tag">{t.cases.placeholder}</span>
            </div>
          </div>
          <div className="case-results">
            {t.cases.caseResults.map((r, i) => (
              <div className="case-result" key={i}>
                <div className="v"><span className="accent">{r.v}</span></div>
                <div className="l">{r.l}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div style={{ marginTop: 64, marginBottom: 24, fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', color: 'rgba(16,16,16,0.7)' }}>{t.cases.reviewsTitle}</div>
        </Reveal>
        <Reveal className="reviews" stagger>
          {t.cases.reviews.map((r, i) => (
            <div className="review" key={i}>
              <div className="review-quote">{r.q}</div>
              <div className="review-author">
                <div className="review-avatar">{r.name.charAt(0)}</div>
                <div className="review-meta">
                  <div className="review-name">{r.name}</div>
                  <div className="review-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// Creative Gallery
// ============================================================
function CreativeGallery({ t }) {
  return (
    <section className="section" id="creative">
      <div className="container">
        <Reveal className="section-head">
          <Eyebrow>{t.creative.eyebrow}</Eyebrow>
          <h2 className="h-section"><Multiline text={t.creative.title} /></h2>
          <p className="body-lg" style={{ maxWidth: 720 }}>{t.creative.body}</p>
        </Reveal>
        <Reveal className="gallery" stagger>
          {t.creative.items.map((it, i) => (
            <div className="gallery-card" key={i}>
              <div className="gallery-img"></div>
              <div className="gallery-meta">
                <div className="t">{it.t}</div>
                <div className="d">{it.d}</div>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal>
          <div style={{ marginTop: 24, fontSize: 12, color: 'rgba(246,242,235,0.45)', textAlign: 'center' }}>{t.creative.note}</div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQ({ t }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="container">
        <Reveal className="section-head" style={{ textAlign: 'center', alignItems: 'center' }}>
          <Eyebrow>{t.faq.eyebrow}</Eyebrow>
          <h2 className="h-section">{t.faq.title}</h2>
        </Reveal>
        <Reveal className="faq">
          {t.faq.items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq-item ${isOpen ? 'open' : ''}`} key={i}>
                <button className="faq-q" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                  <span>{it.q}</span>
                  <span className="icn">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                </button>
                <div className="faq-a" style={{ maxHeight: isOpen ? '500px' : '0' }}>
                  <div className="faq-a-inner">{it.a}</div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// Final CTA + form
// ============================================================
function FinalCTA({ t }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', company: '', brand: '', email: '', phone: '',
    store: '', spend: '', message: '',
    goals: [], channels: [], consent: false,
  });

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm(f => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.consent) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 900);
  };

  return (
    <section className="section final-cta" id="contact">
      <div className="container">
        <div className="cta-grid">
          <Reveal className="cta-copy">
            <Eyebrow>{t.cta.eyebrow}</Eyebrow>
            <h2 className="h-section"><Multiline text={t.cta.title} /></h2>
            <p className="body-lg">{t.cta.body}</p>
            <div className="cta-meta">
              <div className="cta-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span><Multiline text={t.footer.address} /></span>
              </div>
              <div className="cta-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href={`mailto:${t.footer.email}`}>{t.footer.email}</a>
              </div>
            </div>
          </Reveal>

          <Reveal>
            {!done ? (
              <form className="form" onSubmit={submit}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.cta.formTitle}</div>
                <div className="form-row">
                  <div className="field">
                    <label>{t.cta.fields.name} *</label>
                    <input required value={form.name} onChange={e => upd('name', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>{t.cta.fields.company} *</label>
                    <input required value={form.company} onChange={e => upd('company', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>{t.cta.fields.brand}</label>
                    <input value={form.brand} onChange={e => upd('brand', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>{t.cta.fields.email} *</label>
                    <input type="email" required value={form.email} onChange={e => upd('email', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>{t.cta.fields.phone}</label>
                    <input value={form.phone} onChange={e => upd('phone', e.target.value)} />
                  </div>
                  <div className="field">
                    <label>{t.cta.fields.store}</label>
                    <input value={form.store} onChange={e => upd('store', e.target.value)} placeholder="amazon.com/stores/..." />
                  </div>
                </div>
                <div className="field">
                  <label>{t.cta.fields.currentSpend}</label>
                  <select value={form.spend} onChange={e => upd('spend', e.target.value)}>
                    <option value="">—</option>
                    {t.cta.fields.spendOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t.cta.fields.goals}</label>
                  <div className="checkbox-row">
                    {t.cta.fields.goalOptions.map(o => (
                      <label className="chip-check" key={o}>
                        <input type="checkbox" checked={form.goals.includes(o)} onChange={() => toggleArr('goals', o)} />
                        <span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></span>
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>{t.cta.fields.channels}</label>
                  <div className="checkbox-row">
                    {t.cta.fields.channelOptions.map(o => (
                      <label className="chip-check" key={o}>
                        <input type="checkbox" checked={form.channels.includes(o)} onChange={() => toggleArr('channels', o)} />
                        <span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></span>
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>{t.cta.fields.message}</label>
                  <textarea value={form.message} onChange={e => upd('message', e.target.value)} placeholder={t.cta.fields.messagePh} />
                </div>
                <label className="chip-check" style={{ width: 'fit-content' }}>
                  <input type="checkbox" checked={form.consent} onChange={e => upd('consent', e.target.checked)} required />
                  <span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></span>
                  <span>{t.cta.fields.consent}</span>
                </label>
                <div className="form-submit-row">
                  <span className="form-note">{t.cta.note}</span>
                  <button type="submit" className="btn btn-primary" disabled={submitting || !form.consent}>
                    {submitting ? t.cta.submitting : t.cta.submit}
                    <span className="btn-arrow"><ArrowIcon /></span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="form">
                <div className="success-state">
                  <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{t.cta.successTitle}</div>
                  <div style={{ fontSize: 15, color: 'rgba(246,242,235,0.65)', maxWidth: 360 }}>{t.cta.successBody}</div>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="logo" style={{ marginBottom: 16, height: 18 }}>
            <img src="assets/logo.png" alt="SHINEFLOW" />
          </div>
          <p>{t.footer.tag}</p>
        </div>
        <div>
          <h5>{t.footer.contact}</h5>
          <ul>
            <li style={{ color: 'rgba(246,242,235,0.7)', whiteSpace: 'pre-line', fontSize: 13 }}>{t.footer.address}</li>
            <li><a href={`mailto:${t.footer.email}`}>{t.footer.email}</a></li>
          </ul>
        </div>
        <div>
          <h5>{t.footer.services}</h5>
          <ul>{t.footer.serviceList.map(s => <li key={s}><a href="#services">{s}</a></li>)}</ul>
        </div>
        <div>
          <h5>{t.footer.company}</h5>
          <ul>
            <li><a href="#why">{t.footer.companyList[0]}</a></li>
            <li><a href="cases.html">{t.footer.companyList[1]}</a></li>
            <li><a href="#faq">{t.footer.companyList[2]}</a></li>
            <li><a href="#contact">{t.footer.companyList[3]}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t.footer.copyright}</span>
        <span style={{ display: 'flex', gap: 18 }}>
          {t.footer.legal.map(l => <a key={l} href="#">{l}</a>)}
        </span>
      </div>
    </footer>
  );
}

// ============================================================
// App
// ============================================================
function App() {
  const { lang, setLang, t } = useT();
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <>
      <Header lang={lang} setLang={setLang} t={t} onContact={scrollToContact} />
      <Hero t={t} onContact={scrollToContact} />
      <BrandBand t={t} />
      <Proof t={t} />
      <WhyDSP t={t} />
      <WhatDSPDoes t={t} />
      <Dashboard t={t} />
      <FullWhyShineflow t={t} />
      <OperatingModel t={t} />
      <Cases t={t} />
      <CreativeGallery t={t} />
      <FAQ t={t} />
      <FinalCTA t={t} />
      <Footer t={t} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
