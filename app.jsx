// app.jsx — entry. Tokens, tweaks, root render.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#0e3b2a", "#d6362a", "#f0b400", "#f7f1df", "#0c0c0d"],
  "dark": false,
  "density": "regular",
  "type": "broadcast",
  "headline": "",
  "tagline": "",
  "heroVariant": "reel"
}/*EDITMODE-END*/;

function applyPalette(el, palette) {
  if (!el || !palette) return;
  const [green, red, gold, paper, ink] = palette;
  el.style.setProperty("--green", green);
  el.style.setProperty("--red", red);
  el.style.setProperty("--gold", gold);
  el.style.setProperty("--paper", paper);
  el.style.setProperty("--ink", ink);
  el.style.setProperty("--paper-2", mix(paper, ink, 0.07));
  el.style.setProperty("--paper-edge", mix(paper, ink, 0.14));
  el.style.setProperty("--ink-2", mix(ink, paper, 0.15));
}
function mix(hex1, hex2, amt) {
  const p = (h) => [1,3,5].map(i => parseInt(h.slice(i, i+2), 16));
  const [r1,g1,b1] = p(hex1);
  const [r2,g2,b2] = p(hex2);
  const r = Math.round(r1 * (1-amt) + r2 * amt);
  const g = Math.round(g1 * (1-amt) + g2 * amt);
  const b = Math.round(b1 * (1-amt) + b2 * amt);
  return "#" + [r,g,b].map(c => c.toString(16).padStart(2, "0")).join("");
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    if (rootRef.current) applyPalette(rootRef.current, t.palette);
  }, [t.palette]);

  return (
    <div
      ref={rootRef}
      data-theme={t.dark ? "dark" : "light"}
      data-density={t.density}
      data-type={t.type}
      style={{ minHeight: "100vh", background: "var(--paper)" }}
    >
      <Router tweaks={t} heroVariant={t.heroVariant} />

      <TweaksPanel title="Tweaks · Global Cup">
        <TweakSection label="Palette" />
        <TweakColor
          label="Festival theme"
          value={t.palette}
          options={[
            ["#0e3b2a", "#d6362a", "#f0b400", "#f7f1df", "#0c0c0d"],
            ["#003d2b", "#e63946", "#fcbf49", "#fff8ec", "#0a0a0a"],
            ["#1a4ed1", "#ff007a", "#f4b500", "#fbf2e0", "#101a2f"],
            ["#0c2a4a", "#d4ff00", "#ffffff", "#f5f5f0", "#0c0c0d"],
            ["#1c4e80", "#cb4154", "#f0a202", "#fffbe7", "#0a0a0a"],
          ]}
          onChange={(v) => setTweak("palette", v)}
        />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />

        <TweakSection label="Hero" />
        <TweakRadio
          label="Hero variant" value={t.heroVariant}
          options={["reel", "poster", "bracket"]}
          onChange={(v) => setTweak("heroVariant", v)}
        />
        <TweakText label="Headline" value={t.headline}
          placeholder="Use \\n for line break"
          onChange={(v) => setTweak("headline", v)} />
        <TweakText label="Tagline" value={t.tagline}
          placeholder="One sentence under the headline"
          onChange={(v) => setTweak("tagline", v)} />

        <TweakSection label="System" />
        <TweakRadio label="Density" value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakRadio label="Type" value={t.type}
          options={["broadcast", "editorial", "sport-tech"]}
          onChange={(v) => setTweak("type", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
