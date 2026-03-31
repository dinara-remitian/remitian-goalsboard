import { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import './SplashScreen.css';

const SZ = 120;

const CHARACTERS = [
  { key: "villain", name: "Ultimate Villain", color: "#ff6b6b", glow: "rgba(255,80,40,.45)", left: "50%", top: "5%", anim: "splF1 4.5s" },
  { key: "overlord", name: "Chaos Overlord", color: "#5eedcc", glow: "rgba(0,240,190,.4)", left: "80%", top: "15%", anim: "splF2 5s" },
  { key: "sorcerer", name: "Dark Sorcerer", color: "#c084fc", glow: "rgba(180,100,255,.4)", left: "88%", top: "47%", anim: "splF3 4.2s" },
  { key: "slayer", name: "Dragon Slayer", color: "#fbbf24", glow: "rgba(255,170,30,.4)", left: "78%", top: "78%", anim: "splF2 5.5s" },
  { key: "knight", name: "Shadow Knight", color: "#94a3b8", glow: "rgba(160,170,190,.35)", left: "50%", top: "88%", anim: "splF1 4.8s" },
  { key: "smasher", name: "Goblin Smasher", color: "#fb923c", glow: "rgba(255,140,50,.4)", left: "22%", top: "78%", anim: "splF3 3.8s" },
  { key: "scout", name: "Village Scout", color: "#4ade80", glow: "rgba(60,220,100,.4)", left: "12%", top: "47%", anim: "splF1 4.6s" },
  { key: "peasant", name: "Lost Peasant", color: "#d6d3d1", glow: "rgba(200,190,170,.35)", left: "20%", top: "15%", anim: "splF2 5.2s" },
];

const EMBERS = [
  [5, 70, 4, "#ff6b1a", 0], [12, 55, 3, "#ffb366", 0.8], [88, 60, 4, "#ff8c42", 0.4],
  [93, 48, 3, "#ff6b1a", 1.2], [38, 35, 3, "#ffb366", 1.8], [62, 38, 2, "#ff8c42", 2.2],
  [25, 72, 2, "#ff6b1a", 2.6], [75, 65, 3, "#ffb366", 0.5], [50, 80, 3, "#ff6b1a", 1.4],
  [8, 40, 2, "#ffb366", 2.0], [92, 30, 2, "#ff8c42", 1.6], [45, 55, 3, "#ff6b1a", 0.3],
];

export default function SplashScreen({ onEnter }) {
  const [ready, setReady] = useState(false);
  const images = dataService.getCharacterImages();
  const logo = dataService.getLogoImage();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const h = () => onEnter();
    window.addEventListener("click", h);
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("click", h);
      window.removeEventListener("keydown", h);
    };
  }, [onEnter, ready]);

  return (
    <div className="splash-container">
      {/* Torch glows */}
      <div className="splash-torch" style={{ left: "2%", top: "8%", width: 220, height: 220, animationDuration: "2s" }} />
      <div className="splash-torch" style={{ right: "2%", top: "8%", width: 220, height: 220, animationDuration: "2.3s" }} />
      <div className="splash-torch splash-torch--purple" style={{ left: "10%", bottom: "8%", width: 180, height: 180, animationDuration: "2.8s" }} />
      <div className="splash-torch splash-torch--teal" style={{ right: "10%", bottom: "8%", width: 180, height: 180, animationDuration: "3.1s" }} />

      {/* Embers */}
      {EMBERS.map(([l, b, s, c, d], i) => (
        <div
          key={i}
          className="spl-e"
          style={{ left: `${l}%`, bottom: `${b}%`, width: s, height: s, background: c, animationDelay: `${d}s` }}
        />
      ))}

      {/* Center block */}
      <div className="splash-center">
        <div className="splash-brand">
          <span className="splash-brand-text">Remitian</span>
          <div className="splash-lightning">&#9889;</div>
        </div>

        <div className="splash-logo-wrap">
          <div className="splash-logo-glow" />
          <img src={logo} alt="" className="splash-logo-img" />
          <div className="splash-title-overlay">
            <h1 className="spl-shimmer splash-title">GoalsBoard</h1>
            <p className="splash-subtitle">WHERE LEGENDS TRACK THEIR CONQUESTS</p>
          </div>
        </div>

        <div className="splash-cta">
          <span className="splash-cta-text">Tap anywhere to enter the realm</span>
        </div>
      </div>

      {/* Characters */}
      {CHARACTERS.map((c) => (
        <div
          key={c.key}
          className="splash-character"
          style={{ left: c.left, top: c.top, animation: `${c.anim} ease-in-out infinite` }}
        >
          <div style={{ position: "relative" }}>
            <div
              className="splash-character-glow"
              style={{ width: SZ * 1.4, height: SZ * 1.4, background: `radial-gradient(circle,${c.glow} 0%,transparent 60%)` }}
            />
            <img src={images[c.key]} alt={c.name} style={{ width: SZ, position: "relative", zIndex: 1, pointerEvents: "none" }} />
          </div>
          <span
            className="splash-character-label"
            style={{ color: c.color, textShadow: `0 0 16px ${c.glow}` }}
          >
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
}
