/* Inline SVG diagrams keyed by name. They use CSS classes from site.css so they follow the theme. */
"use strict";

module.exports = {
  "toilet-tank": {
    caption: "Inside the tank. Water enters through the fill valve, stops when the float rises, and leaves through the flush valve when the flapper lifts.",
    svg: `<svg viewBox="0 0 560 360" role="img" aria-label="Diagram of a toilet tank showing the fill valve, float cup, refill tube, overflow tube, flapper, chain, and supply shutoff">
  <rect x="70" y="40" width="400" height="260" rx="10" class="stroke fill-panel"/>
  <rect x="72" y="140" width="396" height="158" rx="6" class="fill-water"/>
  <line x1="72" y1="140" x2="468" y2="140" class="stroke-muted" stroke-dasharray="6 5"/>
  <!-- handle and lever -->
  <rect x="34" y="78" width="42" height="12" rx="3" class="fill-ink"/>
  <line x1="76" y1="96" x2="250" y2="100" class="stroke"/>
  <!-- fill valve -->
  <rect x="118" y="60" width="18" height="230" rx="3" class="stroke fill-muted"/>
  <rect x="106" y="50" width="42" height="16" rx="4" class="stroke fill-panel"/>
  <rect x="104" y="150" width="46" height="48" rx="6" class="stroke fill-panel"/>
  <!-- refill tube -->
  <path d="M136 72 C 200 62, 270 64, 318 86" class="stroke-accent" stroke-dasharray="1 0"/>
  <path d="M318 86 l-6 -8 m6 8 l-9 2" class="stroke-accent"/>
  <!-- overflow tube -->
  <rect x="312" y="88" width="22" height="196" rx="3" class="stroke fill-panel"/>
  <!-- flush valve seat + flapper -->
  <ellipse cx="365" cy="288" rx="32" ry="9" class="stroke fill-muted"/>
  <ellipse cx="365" cy="276" rx="30" ry="10" class="fill-accent"/>
  <line x1="365" y1="266" x2="252" y2="102" class="stroke-muted" stroke-dasharray="4 4"/>
  <!-- supply -->
  <path d="M127 290 V 340 H 60" class="stroke"/>
  <circle cx="60" cy="340" r="9" class="stroke fill-panel"/>
  <!-- labels -->
  <text x="150" y="65" class="lbl">Fill valve</text>
  <text x="156" y="176" class="lbl">Float cup</text>
  <text x="156" y="192" class="sub">slides up to set water level</text>
  <text x="200" y="52" class="sub">Refill tube: clip it above the overflow</text>
  <text x="340" y="120" class="lbl">Overflow tube</text>
  <text x="340" y="136" class="sub">water should stop 1 in below its top</text>
  <text x="400" y="262" class="lbl">Flapper</text>
  <text x="400" y="278" class="sub">seals the flush valve</text>
  <text x="250" y="222" class="lbl">Chain</text>
  <text x="250" y="238" class="sub">½ in of slack</text>
  <text x="40" y="70" class="lbl">Handle</text>
  <text x="80" y="330" class="lbl">Supply shutoff (clockwise = off)</text>
</svg>`,
  },

  "p-trap": {
    caption: "Under a bathroom sink. The clog is almost always on the stopper's pivot rod or in the bottom of the U. Slip-nut washers go taper-first toward the joint.",
    svg: `<svg viewBox="0 0 560 320" role="img" aria-label="Diagram of a sink drain showing the pop-up stopper, pivot rod, tailpiece, P-trap with slip nuts, water seal, and trap arm into the wall">
  <!-- basin -->
  <path d="M60 40 H320 L290 100 H90 Z" class="stroke fill-panel"/>
  <!-- stopper -->
  <ellipse cx="190" cy="40" rx="16" ry="5" class="fill-ink"/>
  <rect x="186" y="42" width="8" height="52" class="fill-ink"/>
  <!-- tailpiece -->
  <rect x="178" y="100" width="24" height="72" class="stroke fill-panel"/>
  <!-- pivot rod -->
  <line x1="202" y1="150" x2="270" y2="138" class="stroke"/>
  <circle cx="204" cy="150" r="7" class="stroke fill-muted"/>
  <line x1="270" y1="138" x2="270" y2="60" class="stroke-muted"/>
  <!-- trap: outer pipe -->
  <path d="M190 172 V 220 A 30 30 0 0 0 250 220 V 200 H 400" fill="none" stroke="var(--line-2)" stroke-width="24" stroke-linecap="butt" stroke-linejoin="round"/>
  <path d="M190 172 V 220 A 30 30 0 0 0 250 220 V 200 H 400" fill="none" stroke="var(--panel)" stroke-width="18" stroke-linecap="butt" stroke-linejoin="round"/>
  <!-- water seal -->
  <path d="M190 198 V 220 A 30 30 0 0 0 250 220 V 205" fill="none" stroke="rgba(11,107,138,0.35)" stroke-width="18" stroke-linecap="butt" stroke-linejoin="round"/>
  <!-- hair clog -->
  <ellipse cx="220" cy="246" rx="16" ry="7" class="fill-bad"/>
  <!-- slip nuts -->
  <rect x="174" y="166" width="32" height="12" rx="2" class="stroke fill-panel"/>
  <rect x="234" y="188" width="32" height="12" rx="2" class="stroke fill-panel"/>
  <!-- wall -->
  <rect x="400" y="120" width="40" height="180" class="stroke fill-muted"/>
  <!-- labels -->
  <text x="210" y="34" class="lbl">Pop-up stopper</text>
  <text x="280" y="140" class="lbl">Pivot rod</text>
  <text x="280" y="156" class="sub">hair wraps here first</text>
  <text x="60" y="150" class="lbl">Tailpiece</text>
  <text x="40" y="184" class="lbl">Slip nuts</text>
  <text x="40" y="200" class="sub">hand-tight only</text>
  <text x="300" y="248" class="lbl">Water seal</text>
  <text x="300" y="264" class="sub">blocks sewer gas</text>
  <text x="120" y="290" class="lbl">Hair + soap scum settles here</text>
  <text x="290" y="190" class="lbl">Trap arm</text>
  <text x="446" y="210" class="lbl">Wall</text>
  <text x="446" y="226" class="sub">snake from here</text>
</svg>`,
  },

  "light-switch": {
    caption: "A single-pole switch interrupts one hot wire. The two hots go on the brass screws in either order; neutrals never touch the switch.",
    svg: `<svg viewBox="0 0 560 300" role="img" aria-label="Single-line diagram: hot wire from the breaker to one brass terminal of a single-pole switch, from the other brass terminal to the light, ground on the green screw, neutrals bypassing the switch">
  <!-- breaker panel -->
  <rect x="30" y="100" width="70" height="100" rx="6" class="stroke fill-panel"/>
  <rect x="52" y="120" width="26" height="14" rx="2" class="fill-ink"/>
  <rect x="52" y="140" width="26" height="14" rx="2" class="fill-accent"/>
  <rect x="52" y="160" width="26" height="14" rx="2" class="fill-ink"/>
  <text x="34" y="222" class="lbl">Breaker panel</text>
  <text x="34" y="238" class="sub">flip the one for this room OFF</text>
  <!-- switch box -->
  <rect x="220" y="70" width="120" height="150" rx="6" class="stroke fill-panel"/>
  <rect x="262" y="96" width="36" height="98" rx="4" class="stroke fill-muted"/>
  <rect x="274" y="126" width="12" height="28" rx="2" class="fill-ink"/>
  <circle cx="262" cy="108" r="7" class="fill-warn"/>
  <circle cx="262" cy="182" r="7" class="fill-warn"/>
  <circle cx="298" cy="182" r="7" class="fill-good"/>
  <!-- hot in -->
  <line x1="100" y1="108" x2="255" y2="108" class="stroke"/>
  <!-- hot out -->
  <line x1="262" y1="189" x2="262" y2="200" class="stroke"/>
  <path d="M262 200 H 420 V 150" class="stroke"/>
  <!-- light -->
  <circle cx="420" cy="128" r="22" class="stroke fill-panel"/>
  <path d="M410 150 h20 M412 158 h16" class="stroke"/>
  <text x="452" y="120" class="lbl">Light</text>
  <!-- neutral passing through -->
  <path d="M100 250 H 480 V 150 H 444" class="stroke-muted" stroke-dasharray="6 5"/>
  <text x="120" y="270" class="lbl">Neutral (white) goes straight to the light</text>
  <text x="120" y="286" class="sub">joined with a wire nut in the back of the box. Leave it alone.</text>
  <!-- ground -->
  <path d="M298 189 V 206 H 322" class="stroke-good"/>
  <text x="352" y="212" class="sub" fill="var(--good)">Ground (bare) → green screw</text>
  <!-- labels -->
  <text x="110" y="96" class="lbl">Hot (black) in</text>
  <text x="196" y="60" class="lbl">Brass screws: hot in / hot out, either order</text>
</svg>`,
  },

  gfci: {
    caption: "The back of a GFCI. Power from the breaker goes on LINE. Outlets you want protected downstream go on LOAD. Swap them and it won't reset.",
    svg: `<svg viewBox="0 0 660 336" role="img" aria-label="Front and back of a GFCI receptacle showing TEST and RESET buttons, LINE terminals at the bottom connected to the breaker cable, LOAD terminals at the top under a sticker connected to downstream outlets, and the green ground screw">
  <!-- front -->
  <rect x="40" y="30" width="120" height="240" rx="12" class="stroke fill-panel"/>
  <rect x="70" y="52" width="60" height="58" rx="8" class="stroke fill-muted"/>
  <rect x="84" y="66" width="7" height="20" class="fill-ink"/><rect x="109" y="66" width="7" height="20" class="fill-ink"/><circle cx="100" cy="98" r="5" class="fill-ink"/>
  <rect x="70" y="122" width="60" height="26" rx="4" class="fill-bad"/>
  <text x="100" y="140" class="lbl" text-anchor="middle" fill="#fff" style="fill:#fff">RESET</text>
  <rect x="70" y="154" width="60" height="26" rx="4" class="fill-ink"/>
  <text x="100" y="172" class="lbl" text-anchor="middle" style="fill:var(--bg)">TEST</text>
  <rect x="70" y="190" width="60" height="58" rx="8" class="stroke fill-muted"/>
  <rect x="84" y="204" width="7" height="20" class="fill-ink"/><rect x="109" y="204" width="7" height="20" class="fill-ink"/><circle cx="100" cy="236" r="5" class="fill-ink"/>
  <text x="100" y="292" class="lbl" text-anchor="middle">Front</text>
  <!-- back -->
  <rect x="240" y="30" width="150" height="240" rx="12" class="stroke fill-panel"/>
  <!-- LOAD (top) -->
  <circle cx="262" cy="70" r="8" class="fill-warn"/>
  <circle cx="368" cy="70" r="8" class="fill-muted"/>
  <rect x="250" y="52" width="130" height="38" rx="4" fill="rgba(226,176,74,0.35)" stroke="var(--warn)" stroke-dasharray="4 3"/>
  <text x="315" y="112" class="lbl" text-anchor="middle">LOAD</text>
  <text x="315" y="127" class="sub" text-anchor="middle">under the yellow sticker</text>
  <!-- LINE (bottom) -->
  <circle cx="262" cy="230" r="8" class="fill-warn"/>
  <circle cx="368" cy="230" r="8" class="fill-muted"/>
  <text x="315" y="208" class="lbl" text-anchor="middle">LINE</text>
  <circle cx="315" cy="252" r="8" class="fill-good"/>
  <text x="315" y="292" class="lbl" text-anchor="middle">Back</text>
  <!-- cables -->
  <path d="M254 230 H 200 V 300 H 30" class="stroke"/>
  <path d="M376 230 H 420 V 306 H 30" class="stroke-muted"/>
  <text x="36" y="326" class="sub">From the breaker (hot black → brass, white → silver)</text>
  <path d="M254 70 H 200 V 14 H 460" class="stroke"/>
  <path d="M376 70 H 420 V 20 H 460" class="stroke-muted"/>
  <text x="440" y="46" class="lbl">To downstream outlets</text>
  <text x="440" y="62" class="sub">they become protected too</text>
  <text x="440" y="78" class="sub">(leave LOAD empty if none)</text>
  <text x="440" y="252" class="sub" style="fill:var(--good)">Green: ground</text>
  <text x="440" y="236" class="sub">Brass = black (hot)</text>
  <text x="440" y="220" class="sub">Silver = white (neutral)</text>
</svg>`,
  },

  studs: {
    caption: "Behind the drywall. Studs sit 16 inches apart center to center; drywall screws run up each one, and wires run up from every outlet.",
    svg: `<svg viewBox="0 0 560 300" role="img" aria-label="Wall section showing studs at 16 inch centers, a TV bracket lag-screwed into two studs, drywall screws along a stud that a magnet can find, and a wire running up from an outlet">
  <rect x="20" y="40" width="520" height="230" class="stroke fill-panel"/>
  <!-- studs -->
  <rect x="76" y="40" width="8" height="230" class="fill-muted"/>
  <rect x="156" y="40" width="8" height="230" class="fill-muted"/>
  <rect x="236" y="40" width="8" height="230" class="fill-muted"/>
  <rect x="316" y="40" width="8" height="230" class="fill-muted"/>
  <rect x="396" y="40" width="8" height="230" class="fill-muted"/>
  <rect x="476" y="40" width="8" height="230" class="fill-muted"/>
  <!-- dimension -->
  <line x1="80" y1="24" x2="160" y2="24" class="stroke-accent"/>
  <line x1="80" y1="18" x2="80" y2="30" class="stroke-accent"/>
  <line x1="160" y1="18" x2="160" y2="30" class="stroke-accent"/>
  <text x="120" y="14" class="lbl" text-anchor="middle">16 in on center</text>
  <text x="250" y="14" class="sub">each stud is 1½ in wide</text>
  <!-- screws along a stud -->
  <circle cx="240" cy="70" r="4" class="fill-ink"/><circle cx="240" cy="120" r="4" class="fill-ink"/><circle cx="240" cy="170" r="4" class="fill-ink"/><circle cx="240" cy="220" r="4" class="fill-ink"/>
  <text x="228" y="124" class="sub" text-anchor="end">magnet finds these screws</text>
  <!-- bracket -->
  <rect x="300" y="86" width="196" height="64" rx="4" class="stroke-accent" fill="rgba(209,82,26,0.10)"/>
  <circle cx="320" cy="100" r="5" class="fill-accent"/><circle cx="320" cy="136" r="5" class="fill-accent"/>
  <circle cx="480" cy="100" r="5" class="fill-accent"/><circle cx="480" cy="136" r="5" class="fill-accent"/>
  <text x="398" y="123" class="lbl" text-anchor="middle">TV bracket: 2 lags per stud</text>
  <!-- outlet + wire -->
  <rect x="404" y="212" width="18" height="30" rx="2" class="stroke fill-panel"/>
  <circle cx="413" cy="221" r="2" class="fill-ink"/><circle cx="413" cy="233" r="2" class="fill-ink"/>
  <path d="M413 212 V 44" class="stroke-bad" stroke-dasharray="5 4"/>
  <text x="404" y="200" class="sub" text-anchor="end" style="fill:var(--bad)">wire runs straight up from the outlet</text>
  <text x="404" y="214" class="sub" text-anchor="end" style="fill:var(--bad)">never drill in this line</text>
  <text x="30" y="288" class="sub">outlets are nailed to a stud: there's always one beside a box</text>
</svg>`,
  },
};
