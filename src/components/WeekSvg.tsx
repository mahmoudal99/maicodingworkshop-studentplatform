interface Props {
  weekNum: string;
  accent: string;
  versionKey: string;
}

function getSvgKey(weekNum: string, versionKey: string): string {
  const num = parseInt(weekNum.replace("W", ""));
  if (versionKey === "A") {
    if (num === 1) return "computers-think";
    if (num === 2) return "problem-solving";
    if (num === 3) return "js-basics";
    if (num === 4) return "loops-functions";
    if (num === 5) return "web-ai";
    if (num === 6) return "demo-day";
  } else {
    if (num === 1) return "problem-solving";
    if (num === 2) return "js-basics";
    if (num === 3) return "loops-functions";
    if (num === 4) return "web-ai";
    if (num === 5) return "project-work";
    if (num === 6) return "demo-day";
  }
  return "demo-day";
}

export default function WeekSvg({ weekNum, accent, versionKey }: Props) {
  const key = getSvgKey(weekNum, versionKey);

  const svgs: Record<string, React.ReactNode> = {
    "computers-think": (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="45" y="50" width="70" height="50" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        <rect x="55" y="58" width="14" height="14" rx="2" fill="currentColor" opacity="0.15"/>
        <rect x="73" y="58" width="14" height="14" rx="2" fill="currentColor" opacity="0.15"/>
        <rect x="91" y="58" width="14" height="14" rx="2" fill="currentColor" opacity="0.15"/>
        <rect x="55" y="78" width="50" height="4" rx="2" fill="currentColor" opacity="0.1"/>
        <rect x="55" y="86" width="35" height="4" rx="2" fill="currentColor" opacity="0.1"/>
        <text x="30" y="30" fontFamily="monospace" fontSize="14" fill="currentColor" opacity="0.5" className="svg-pulse">1</text>
        <text x="70" y="25" fontFamily="monospace" fontSize="12" fill="currentColor" opacity="0.35" className="svg-float">0</text>
        <text x="110" y="35" fontFamily="monospace" fontSize="16" fill="currentColor" opacity="0.6" className="svg-pulse" style={{animationDelay:"0.5s"}}>1</text>
        <text x="45" y="130" fontFamily="monospace" fontSize="11" fill="currentColor" opacity="0.35" className="svg-float" style={{animationDelay:"1s"}}>0</text>
        <text x="95" y="125" fontFamily="monospace" fontSize="13" fill="currentColor" opacity="0.45" className="svg-pulse" style={{animationDelay:"0.7s"}}>1</text>
        <text x="125" y="70" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.3" className="svg-float" style={{animationDelay:"1.5s"}}>0</text>
        <text x="20" y="75" fontFamily="monospace" fontSize="15" fill="currentColor" opacity="0.4" className="svg-pulse" style={{animationDelay:"1.2s"}}>1</text>
        <text x="130" y="110" fontFamily="monospace" fontSize="12" fill="currentColor" opacity="0.3" className="svg-float" style={{animationDelay:"0.3s"}}>1</text>
      </svg>
    ),
    "problem-solving": (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="55" y="10" width="50" height="28" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <text x="80" y="28" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="currentColor" opacity="0.6">START</text>
        <line x1="80" y1="38" x2="80" y2="52" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        <polygon points="80,52 110,75 80,98 50,75" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <text x="80" y="79" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="currentColor" opacity="0.5">IF?</text>
        <line x1="110" y1="75" x2="135" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        <text x="122" y="70" fontFamily="monospace" fontSize="7" fill="currentColor" opacity="0.4">YES</text>
        <rect x="115" y="62" width="35" height="26" rx="4" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
        <text x="132" y="79" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="currentColor" opacity="0.4">DO A</text>
        <line x1="50" y1="75" x2="25" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        <text x="32" y="70" fontFamily="monospace" fontSize="7" fill="currentColor" opacity="0.4">NO</text>
        <rect x="10" y="62" width="35" height="26" rx="4" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
        <text x="27" y="79" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="currentColor" opacity="0.4">DO B</text>
        <line x1="80" y1="98" x2="80" y2="115" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        <rect x="55" y="115" width="50" height="28" rx="14" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <text x="80" y="133" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="currentColor" opacity="0.6">END</text>
        <circle cx="80" cy="75" r="3" fill="currentColor" opacity="0.3" className="svg-pulse"/>
      </svg>
    ),
    "js-basics": (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="25" y="40" fontFamily="monospace" fontSize="36" fill="currentColor" opacity="0.15">{"{"}</text>
        <text x="105" y="130" fontFamily="monospace" fontSize="36" fill="currentColor" opacity="0.15">{"}"}</text>
        <text x="35" y="65" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.5">let</text>
        <text x="55" y="65" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.7">x</text>
        <text x="65" y="65" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.4">=</text>
        <rect x="74" y="55" width="36" height="16" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="currentColor" fillOpacity="0.05"/>
        <text x="80" y="67" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="currentColor" opacity="0.7">42</text>
        <text x="112" y="65" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.3">;</text>
        <text x="35" y="88" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.5">let</text>
        <text x="55" y="88" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.7">y</text>
        <text x="65" y="88" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.4">=</text>
        <rect x="74" y="78" width="50" height="16" rx="3" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="currentColor" fillOpacity="0.05"/>
        <text x="80" y="90" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="currentColor" opacity="0.7">{'"hi"'}</text>
        <text x="126" y="88" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.3">;</text>
        <rect x="35" y="100" width="2" height="14" fill="currentColor" opacity="0.6" className="svg-blink"/>
      </svg>
    ),
    "loops-functions": (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 30 A40 40 0 1 1 79.99 30" stroke="currentColor" strokeWidth="2" opacity="0.25" fill="none" strokeDasharray="4 4"/>
        <path d="M80 30 A40 40 0 1 1 45 55" stroke="currentColor" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round"/>
        <polygon points="42,50 50,58 38,58" fill="currentColor" opacity="0.5"/>
        <text x="72" y="78" fontFamily="monospace" fontSize="8" fill="currentColor" opacity="0.4">for(i)</text>
        <rect x="28" y="108" width="26" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        <text x="41" y="125" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.6">[0]</text>
        <rect x="58" y="108" width="26" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
        <text x="71" y="125" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.7">[1]</text>
        <rect x="88" y="108" width="26" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
        <text x="101" y="125" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.8">[2]</text>
        <rect x="118" y="108" width="26" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeDasharray="3 3"/>
        <text x="131" y="125" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.3">...</text>
        <circle cx="80" cy="55" r="3" fill="currentColor" opacity="0.4" className="svg-pulse"/>
      </svg>
    ),
    "web-ai": (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="25" width="85" height="65" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        <line x1="20" y1="40" x2="105" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
        <circle cx="30" cy="33" r="2.5" fill="currentColor" opacity="0.2"/>
        <circle cx="38" cy="33" r="2.5" fill="currentColor" opacity="0.2"/>
        <circle cx="46" cy="33" r="2.5" fill="currentColor" opacity="0.2"/>
        <text x="30" y="55" fontFamily="monospace" fontSize="8" fill="currentColor" opacity="0.4">{"<h1>"}</text>
        <rect x="30" y="60" width="40" height="4" rx="2" fill="currentColor" opacity="0.1"/>
        <rect x="30" y="68" width="55" height="4" rx="2" fill="currentColor" opacity="0.08"/>
        <rect x="30" y="76" width="30" height="4" rx="2" fill="currentColor" opacity="0.06"/>
        <circle cx="125" cy="55" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>
        <circle cx="125" cy="55" r="8" fill="currentColor" opacity="0.1"/>
        <circle cx="120" cy="51" r="2" fill="currentColor" opacity="0.5"/>
        <circle cx="130" cy="51" r="2" fill="currentColor" opacity="0.5"/>
        <path d="M119 58 Q125 63 131 58" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none" strokeLinecap="round"/>
        <line x1="105" y1="55" x2="103" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeDasharray="2 2"/>
        <text x="40" y="115" fontFamily="monospace" fontSize="8" fill="currentColor" opacity="0.3">{"</html>"}</text>
        <text x="90" y="105" fontFamily="monospace" fontSize="7" fill="currentColor" opacity="0.3">AI</text>
        <circle cx="125" cy="55" r="22" stroke="currentColor" strokeWidth="0.5" opacity="0.15" className="svg-pulse"/>
      </svg>
    ),
    "demo-day": (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="svg-float" style={{animationDuration:"2.5s"}}>
          <path d="M80 25 C80 25 65 50 65 80 C65 95 72 105 80 110 C88 105 95 95 95 80 C95 50 80 25 80 25Z" stroke="currentColor" strokeWidth="1.5" opacity="0.5" fill="currentColor" fillOpacity="0.05"/>
          <circle cx="80" cy="65" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
          <circle cx="80" cy="65" r="2.5" fill="currentColor" opacity="0.3"/>
          <path d="M65 85 L55 95 L60 85" stroke="currentColor" strokeWidth="1.5" opacity="0.3" fill="currentColor" fillOpacity="0.05"/>
          <path d="M95 85 L105 95 L100 85" stroke="currentColor" strokeWidth="1.5" opacity="0.3" fill="currentColor" fillOpacity="0.05"/>
        </g>
        <line x1="80" y1="115" x2="80" y2="145" stroke="currentColor" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4"/>
        <polygon points="73,115 80,120 87,115" fill="currentColor" opacity="0.2" className="svg-pulse"/>
        <text x="80" y="155" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="currentColor" opacity="0.3">DEPLOY</text>
      </svg>
    ),
    "project-work": (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="35" width="100" height="75" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>
        <line x1="30" y1="52" x2="130" y2="52" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
        <circle cx="42" cy="44" r="3" fill="currentColor" opacity="0.2"/>
        <circle cx="52" cy="44" r="3" fill="currentColor" opacity="0.2"/>
        <circle cx="62" cy="44" r="3" fill="currentColor" opacity="0.2"/>
        <rect x="42" y="62" width="50" height="5" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="42" y="72" width="70" height="5" rx="2" fill="currentColor" opacity="0.09"/>
        <rect x="42" y="82" width="35" height="5" rx="2" fill="currentColor" opacity="0.06"/>
        <rect x="42" y="92" width="55" height="5" rx="2" fill="currentColor" opacity="0.08"/>
        <path d="M105 120 L120 135" stroke="currentColor" strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
        <circle cx="100" cy="115" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
        <text x="100" y="119" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="currentColor" opacity="0.4" className="svg-pulse">{"\u2714"}</text>
      </svg>
    ),
  };

  return (
    <div className="week-hero-svg" style={{ color: accent }}>
      {svgs[key] || svgs["demo-day"]}
    </div>
  );
}
