"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   KEYFRAME STYLES  (injected once on mount)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes gridPan {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(60px, 60px); }
  }
  @keyframes float1 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-22px) rotate(3deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(18px) rotate(-4deg); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-14px) scale(1.04); }
  }
  @keyframes scanline {
    0%   { top: -4px; }
    100% { top: 100%; }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.92); opacity: 0.6; }
    70%  { transform: scale(1.12); opacity: 0; }
    100% { transform: scale(0.92); opacity: 0; }
  }
  @keyframes counterUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes slideRight {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .nav-link {
    position: relative;
    color: rgba(255,255,255,0.72);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0;
    width: 100%; height: 1.5px;
    background: #52ba4f;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .nav-link:hover { color: #fff; }
  .nav-link:hover::after { transform: scaleX(1); }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    background: #1A37AA;
    color: #fff;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9375rem;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background 0.22s, transform 0.18s, box-shadow 0.22s;
    box-shadow: 0 4px 20px rgba(26,55,170,0.35);
  }
  .btn-primary:hover {
    background: #2a4fc4;
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(26,55,170,0.45);
  }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 32px;
    background: transparent;
    color: #fff;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9375rem;
    text-decoration: none;
    border: 1.5px solid rgba(255,255,255,0.3);
    cursor: pointer;
    transition: background 0.22s, border-color 0.22s, transform 0.18s;
  }
  .btn-ghost:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.55);
    transform: translateY(-2px);
  }

  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 32px;
    background: transparent;
    color: #1A37AA;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9375rem;
    text-decoration: none;
    border: 1.5px solid #1A37AA;
    cursor: pointer;
    transition: background 0.22s, transform 0.18s, box-shadow 0.22s;
  }
  .btn-outline:hover {
    background: #1A37AA;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26,55,170,0.28);
  }

  .feature-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e8ecf4;
    padding: 36px 28px;
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s;
    cursor: default;
  }
  .feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(26,55,170,0.12), 0 4px 12px rgba(15,25,35,0.06);
  }
  .feature-card:hover .feature-icon {
    transform: scale(1.1);
  }
  .feature-icon {
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .step-card:hover .step-num {
    color: #1A37AA;
  }
  .stat-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 28px 24px;
    text-align: center;
    transition: background 0.22s;
  }
  .stat-card:hover { background: rgba(255,255,255,0.1); }

  .mobile-menu {
    display: none;
    position: fixed;
    inset: 0;
    background: #111c2d;
    z-index: 200;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
  }
  .mobile-menu.open { display: flex; }

  @media (max-width: 767px) {
    .hide-mobile { display: none !important; }
    .hero-title { font-size: clamp(2rem, 8vw, 3rem) !important; }
    .hero-sub { font-size: 1rem !important; }
    .section-title { font-size: clamp(1.6rem, 5vw, 2.4rem) !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .cta-btns { flex-direction: column !important; align-items: stretch !important; }
    .cta-btns a, .cta-btns button { justify-content: center; }
    .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
    .hero-btns { flex-direction: column !important; align-items: stretch !important; }
    .hero-btns a { justify-content: center; text-align: center; }
  }
  @media (max-width: 479px) {
    .stats-grid { grid-template-columns: 1fr !important; }
    .footer-cols { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .footer-cols { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

/* ─────────────────────────────────────────────
   SVG ICON COMPONENTS
───────────────────────────────────────────── */
function IconEnquiry({ size = 28, color = "#1A37AA" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8 10h8M8 14h5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconQuotation({ size = 28, color = "#1A37AA" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="9" y1="17" x2="13" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="9" y1="9" x2="10" y2="9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconClients({ size = 28, color = "#1A37AA" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconReports({ size = 28, color = "#1A37AA" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 20h18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheck({ color = "#52ba4f" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7.5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────── */
function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

/* ─────────────────────────────────────────────
   STAT ITEM WITH ANIMATED COUNTER
───────────────────────────────────────────── */
function StatItem({ value, suffix, label, started }) {
  const count = useCounter(value, 1600, started);
  return (
    <div className="stat-card">
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "clamp(2.4rem, 5vw, 3.2rem)",
        fontWeight: 700,
        color: "#fff",
        lineHeight: 1,
        letterSpacing: "-0.02em",
        marginBottom: 6,
      }}>
        {count}{suffix}
      </div>
      <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", fontWeight: 500, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Inject global CSS once
  useEffect(() => {
    const tag = document.getElementById("__homepage_styles__");
    if (tag) return;
    const style = document.createElement("style");
    style.id = "__homepage_styles__";
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }, []);

  // Navbar scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Stats intersection observer
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", background: "#f4f6fb", minHeight: "100vh" }}>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button onClick={() => setMenuOpen(false)} style={{
          position: "absolute", top: 20, right: 20,
          background: "none", border: "none", color: "#fff", cursor: "pointer",
        }}>
          <IconClose />
        </button>
        {[
          { label: "Features", href: "#features" },
          { label: "How It Works", href: "#how-it-works" },
          { label: "Login", href: "/login" },
        ].map(({ label, href }) => (
          <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
            color: "#fff", textDecoration: "none", fontSize: "1.25rem",
            fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif",
          }}>{label}</a>
        ))}
      </div>

      {/* ──────────────────────────────────────────
          NAVBAR
      ────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(17,28,45,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "background 0.35s, backdrop-filter 0.35s, border-color 0.35s",
        padding: "0 clamp(20px, 5vw, 64px)",
      }}>
        <div style={{
          maxWidth: 1320, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 75,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}>
            <div style={{
              width: 160, height: 55, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(26,55,170,0.3), rgba(42,79,196,0.2))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 6px 20px rgba(26,55,170,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
              padding: "6px 12px",
            }}>
              <Image
                src="/logo.png"
                alt="Unique Sorter Logo"
                width={140}
                height={45}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
                priority
              />
            </div>
            <div className="hide-mobile">
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "1.5rem", color: "#fff", lineHeight: 1.1,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}>Unique Sorter</div>
              <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 500 }}>
                CRM PLATFORM
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 48 }}>
            <a href="#features" className="nav-link" style={{ fontSize: "1.1rem", fontWeight: 500 }}>Features</a>
            <a href="#how-it-works" className="nav-link" style={{ fontSize: "1.1rem", fontWeight: 500 }}>How It Works</a>
            <a href="#stats" className="nav-link" style={{ fontSize: "1.1rem", fontWeight: 500 }}>About</a>
          </div>

          {/* CTA */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" style={{
              color: "rgba(255,255,255,0.8)", textDecoration: "none",
              fontSize: "0.875rem", fontWeight: 500, padding: "8px 16px",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.8)"}
            >
              Login 
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            style={{ display: "none", background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            className="show-mobile"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <style>{`.show-mobile { display: block !important; } @media (min-width: 768px) { .show-mobile { display: none !important; } }`}</style>
        </div>
      </nav>

      {/* ──────────────────────────────────────────
          HERO
      ────────────────────────────────────────── */}
      <section style={{
        position: "relative", minHeight: "100vh",
        background: "linear-gradient(160deg, #0d1a2d 0%, #111c2d 45%, #0a1628 100%)",
        display: "flex", alignItems: "center",
        overflow: "hidden",
        padding: "0 clamp(20px, 5vw, 64px)",
      }}>
        {/* Animated grid */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", opacity: 0.18,
        }}>
          <div style={{
            position: "absolute", inset: "-10%",
            backgroundImage: `
              linear-gradient(rgba(26,55,170,0.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(26,55,170,0.35) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            animation: "gridPan 20s linear infinite",
          }} />
        </div>

        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: "10%", left: "8%",
          width: 520, height: 520,
          background: "radial-gradient(circle, rgba(26,55,170,0.28) 0%, transparent 70%)",
          animation: "float1 9s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", right: "5%",
          width: 420, height: 420,
          background: "radial-gradient(circle, rgba(82,186,79,0.18) 0%, transparent 70%)",
          animation: "float2 11s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", right: "20%",
          width: 300, height: 300,
          background: "radial-gradient(circle, rgba(26,55,170,0.15) 0%, transparent 70%)",
          animation: "float3 7s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        {/* Geometric accent ring */}
        <div style={{
          position: "absolute", top: "12%", right: "8%",
          width: 200, height: 200, borderRadius: "50%",
          border: "1px solid rgba(26,55,170,0.25)",
          animation: "rotateSlow 30s linear infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)",
            width: 8, height: 8, borderRadius: "50%",
            background: "#1A37AA",
          }} />
        </div>
        <div style={{
          position: "absolute", top: "14%", right: "9.5%",
          width: 160, height: 160, borderRadius: "50%",
          border: "1px dashed rgba(82,186,79,0.2)",
          animation: "rotateSlow 20s linear infinite reverse",
          pointerEvents: "none",
        }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1320, margin: "0 auto", width: "100%", paddingTop: 100, paddingBottom: 80 }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(26,55,170,0.2)", border: "1px solid rgba(26,55,170,0.35)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 32,
            animation: "fadeUp 0.6s ease both",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#52ba4f",
              boxShadow: "0 0 8px #52ba4f",
            }} />
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.85rem", fontWeight: 600,
              color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>Business CRM Platform</span>
          </div>

          <h1 className="hero-title" style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(2.8rem, 7vw, 4.8rem)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 820,
            marginBottom: 12,
            animation: "fadeUp 0.7s 0.1s ease both",
            textTransform: "uppercase",
          }}>
            Unique Sorter
          </h1>

          <p className="hero-sub" style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "rgba(255,255,255,0.6)",
            maxWidth: 560,
            lineHeight: 1.7,
            marginTop: 20,
            marginBottom: 44,
            animation: "fadeUp 0.7s 0.2s ease both",
          }}>
            The complete business management platform — from customer enquiries
            and quotations to client tracking and performance analytics, all in one place.
          </p>

          <div className="hero-btns" style={{
            display: "flex", gap: 14, flexWrap: "wrap",
            animation: "fadeUp 0.7s 0.3s ease both",
          }}>
            <Link href="/login" className="btn-primary" style={{ fontSize: "1rem", padding: "15px 36px" }}>
              Login Here <IconArrow />
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{
            display: "flex", gap: 24, marginTop: 56, flexWrap: "wrap",
            animation: "fadeUp 0.7s 0.45s ease both",
          }}>
            {[
              "Enquiry Management",
              "PDF Quotations",
              "Client Tracking",
              "Sales Reports",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <IconCheck />
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", fontWeight: 500, fontFamily: "'Barlow Condensed', sans-serif" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          animation: "fadeIn 1s 1s ease both",
        }}>
          <div style={{
            width: 24, height: 38, border: "1.5px solid rgba(255,255,255,0.2)",
            borderRadius: 12, display: "flex", justifyContent: "center", paddingTop: 6,
          }}>
            <div style={{
              width: 4, height: 8, background: "rgba(255,255,255,0.5)", borderRadius: 2,
              animation: "scanline 1.8s ease-in-out infinite",
              position: "relative",
            }} />
          </div>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>SCROLL</span>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          STATS BAND
      ────────────────────────────────────────── */}
      <section id="stats" ref={statsRef} style={{
        background: "linear-gradient(135deg, #111c2d 0%, #1A37AA 100%)",
        padding: "64px clamp(20px, 5vw, 64px)",
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div className="stats-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}>
            <StatItem value={500} suffix="+" label="Enquiries Managed" started={statsVisible} />
            <StatItem value={98} suffix="%" label="On-time Quotations" started={statsVisible} />
            <StatItem value={120} suffix="+" label="Active Clients" started={statsVisible} />
            <StatItem value={3} suffix="x" label="Faster Workflow" started={statsVisible} />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          FEATURES
      ────────────────────────────────────────── */}
      <section id="features" style={{
        padding: "100px clamp(20px, 5vw, 64px)",
        background: "#f4f6fb",
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{
              display: "inline-block",
              background: "rgba(26,55,170,0.08)",
              border: "1px solid rgba(26,55,170,0.15)",
              borderRadius: 100, padding: "5px 16px", marginBottom: 16,
            }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.8rem", fontWeight: 600,
                color: "#1A37AA", letterSpacing: "0.12em", textTransform: "uppercase",
              }}>Core Capabilities</span>
            </div>
            <h2 className="section-title" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 700, color: "#0f1923",
              letterSpacing: "0.01em",
              marginBottom: 16,
              textTransform: "uppercase",
            }}>
              Everything your business needs<br />
              <span style={{ color: "#1A37AA" }}>In One Platform</span>
            </h2>
            <p style={{
              fontSize: "1.05rem", color: "#5a6a7e",
              maxWidth: 520, margin: "0 auto", lineHeight: 1.7,
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400,
            }}>
              Purpose-built for industrial equipment sales teams to manage the
              full customer lifecycle efficiently.
            </p>
          </div>

          {/* Cards */}
          <div className="features-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}>
            {[
              {
                icon: <IconEnquiry size={28} />,
                title: "Enquiry Management",
                desc: "Capture, track, and follow up on every customer enquiry. Full audit trail, status tracking, and team notes — nothing slips through.",
                color: "#1A37AA",
                link: "/dashboard/enquiry",
                items: ["Structured capture form", "Status tracking pipeline", "Audit log history"],
              },
              {
                icon: <IconQuotation size={28} />,
                title: "Quotation System",
                desc: "Generate professional PDF quotations instantly. Multiple templates, line-item control, GST handling, and one-click sharing.",
                color: "#1A37AA",
                link: "/dashboard/quotations",
                items: ["PDF export & sharing", "GST-compliant format", "Multiple templates"],
              },
              {
                icon: <IconClients size={28} />,
                title: "Client Tracking",
                desc: "Maintain a complete view of every client — their history, requirements, and deal status — to build lasting relationships.",
                color: "#1A37AA",
                link: "/dashboard/clients",
                items: ["Full client profiles", "Deal history view", "Contact management"],
              },
              {
                icon: <IconReports size={28} />,
                title: "Reports & Analytics",
                desc: "Real-time dashboards that turn raw sales data into clear insights. Track pipeline health, conversion rates, and revenue trends.",
                color: "#1A37AA",
                link: "/dashboard/reports",
                items: ["Sales pipeline view", "Conversion tracking", "Revenue analytics"],
              },
            ].map(({ icon, title, desc, color, link, items }) => (
              <div key={title} className="feature-card" style={{ position: "relative", overflow: "hidden" }}>
                {/* Top accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${color}, #52ba4f)`,
                  transform: "scaleX(0)", transformOrigin: "left",
                  transition: "transform 0.3s ease",
                }}
                  className="card-accent"
                />
                <style>{`.feature-card:hover .card-accent { transform: scaleX(1) !important; }`}</style>

                <div className="feature-icon" style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `rgba(26,55,170,0.08)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  {icon}
                </div>

                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "1.2rem", fontWeight: 700,
                  color: "#0f1923", marginBottom: 10,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}>{title}</h3>

                <p style={{ fontSize: "0.95rem", color: "#5a6a7e", lineHeight: 1.65, marginBottom: 20, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400 }}>
                  {desc}
                </p>

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {items.map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <IconCheck />
                      <span style={{ fontSize: "0.85rem", color: "#5a6a7e", fontWeight: 500, fontFamily: "'Barlow Condensed', sans-serif" }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href={link} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: "0.9rem", fontWeight: 600, color: color,
                  textDecoration: "none",
                  transition: "gap 0.2s",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}
                  onMouseEnter={e => e.currentTarget.style.gap = "10px"}
                  onMouseLeave={e => e.currentTarget.style.gap = "6px"}
                >
                  Explore <IconArrow />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          HOW IT WORKS
      ────────────────────────────────────────── */}
      <section id="how-it-works" style={{
        padding: "100px clamp(20px, 5vw, 64px)",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", right: -120, top: "50%", transform: "translateY(-50%)",
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(26,55,170,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{
              display: "inline-block",
              background: "rgba(82,186,79,0.08)",
              border: "1px solid rgba(82,186,79,0.2)",
              borderRadius: 100, padding: "5px 16px", marginBottom: 16,
            }}>
              <span style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.8rem", fontWeight: 600,
                color: "#3d8f3b", letterSpacing: "0.12em", textTransform: "uppercase",
              }}>Simple Process</span>
            </div>
            <h2 className="section-title" style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 700, color: "#0f1923",
              letterSpacing: "0.01em", marginBottom: 16,
              textTransform: "uppercase",
            }}>
              Three Steps To A Smarter Workflow
            </h2>
            <p style={{
              fontSize: "1.05rem", color: "#5a6a7e",
              maxWidth: 480, margin: "0 auto", lineHeight: 1.7,
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400,
            }}>
              Get your team operational in minutes, not weeks.
            </p>
          </div>

          {/* Steps */}
          <div className="steps-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
            position: "relative",
          }}>
            {/* Connector line (desktop) */}
            <div style={{
              position: "absolute",
              top: 40, left: "calc(16.67% + 24px)", right: "calc(16.67% + 24px)",
              height: 1, background: "linear-gradient(90deg, #e8ecf4, #1A37AA, #e8ecf4)",
              zIndex: 0,
            }} className="hide-mobile" />

            {[
              {
                num: "01",
                title: "Capture Enquiries",
                desc: "Customers submit enquiries via a structured form. Your team receives instant notifications and can track every enquiry from initial contact to closure.",
                action: "Try the enquiry form",
                href: "/enquiry",
              },
              {
                num: "02",
                title: "Generate Quotations",
                desc: "Convert enquiries to professional PDF quotations in seconds. Add line items, apply GST, set validity, and send directly — all from the dashboard.",
                action: "View quotations",
                href: "/dashboard/quotations",
              },
              {
                num: "03",
                title: "Track & Analyse",
                desc: "Monitor your entire sales pipeline in real time. Know which deals are closing, where bottlenecks are, and how the team is performing — always.",
                action: "Go to dashboard",
                href: "/dashboard",
              },
            ].map(({ num, title, desc, action, href }) => (
              <div key={num} className="step-card" style={{
                position: "relative", zIndex: 1,
                background: "#fff",
                border: "1px solid #e8ecf4",
                borderRadius: 14,
                padding: "36px 28px",
                transition: "box-shadow 0.28s, transform 0.28s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 16px 48px rgba(26,55,170,0.1)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div className="step-num" style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "3.5rem", fontWeight: 700,
                  color: "#e8ecf4",
                  lineHeight: 1, marginBottom: 16,
                  transition: "color 0.22s",
                  letterSpacing: "-0.02em",
                }}>{num}</div>

                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "1.2rem", fontWeight: 700,
                  color: "#0f1923", marginBottom: 12,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}>{title}</h3>

                <p style={{ fontSize: "0.95rem", color: "#5a6a7e", lineHeight: 1.65, marginBottom: 24, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400 }}>
                  {desc}
                </p>

                <Link href={href} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: "0.9rem", fontWeight: 600, color: "#1A37AA",
                  textDecoration: "none", transition: "gap 0.2s",
                  fontFamily: "'Barlow Condensed', sans-serif",
                }}
                  onMouseEnter={e => e.currentTarget.style.gap = "10px"}
                  onMouseLeave={e => e.currentTarget.style.gap = "6px"}
                >
                  {action} <IconArrow />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          CTA BAND
      ────────────────────────────────────────── */}
      <section style={{
        padding: "100px clamp(20px, 5vw, 64px)",
        background: "linear-gradient(160deg, #0d1a2d 0%, #111c2d 60%, #0a1628 100%)",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 400,
          background: "radial-gradient(ellipse, rgba(26,55,170,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Pulse ring on logo */}
        <div style={{
          position: "relative", display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          marginBottom: 32,
        }}>
          <div style={{
            position: "absolute", width: 80, height: 80, borderRadius: "50%",
            border: "1.5px solid rgba(26,55,170,0.4)",
            animation: "pulse-ring 2.5s ease-out infinite",
          }} />
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg, #1A37AA, #2a4fc4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(26,55,170,0.5)",
            position: "relative", zIndex: 1,
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", fontFamily: "'Syne', sans-serif" }}>U</span>
          </div>
        </div>

        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(2rem, 4.5vw, 3rem)",
          fontWeight: 700, color: "#fff",
          letterSpacing: "0.01em",
          marginBottom: 18,
          position: "relative", zIndex: 1,
          textTransform: "uppercase",
        }}>
          Ready To Streamline<br />Your Sales Operation?
        </h2>

        <p style={{
          fontSize: "1.05rem", color: "rgba(255,255,255,0.55)",
          maxWidth: 440, margin: "0 auto 40px",
          lineHeight: 1.7, position: "relative", zIndex: 1,
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400,
        }}>
          Your team is one login away from a faster, smarter way to manage
          enquiries, quotations, and clients.
        </p>

        <div className="cta-btns" style={{
          display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
          position: "relative", zIndex: 1,
        }}>
          <Link href="/login" className="btn-primary" style={{ fontSize: "1rem", padding: "15px 40px" }}>
            Access Platform <IconArrow />
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          FOOTER
      ────────────────────────────────────────── */}
      <footer style={{
        background: "#0a111f",
        padding: "64px clamp(20px, 5vw, 64px) 32px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div className="footer-cols" style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.2fr",
            gap: 48, marginBottom: 56,
          }}>
            {/* Brand column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "linear-gradient(135deg, #1A37AA, #2a4fc4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem" }}>U</span>
                </div>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    color: "#fff", fontSize: "1rem",
                    letterSpacing: "0.02em", textTransform: "uppercase",
                  }}>Unique Sorter</div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                    AND EQUIPMENT PVT. LTD.
                  </div>
                </div>
              </div>
              <p style={{
                fontSize: "0.9rem", color: "rgba(255,255,255,0.4)",
                lineHeight: 1.75, maxWidth: 280,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 400,
              }}>
                Industrial sorting equipment specialists. Our CRM platform powers
                every step of the customer journey — from first enquiry to
                successful delivery.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18,
              }}>Platform</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Enquiries", href: "/dashboard/enquiry" },
                  { label: "Quotations", href: "/dashboard/quotations" },
                  { label: "Reports", href: "/dashboard/reports" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} style={{
                      fontSize: "0.875rem", color: "rgba(255,255,255,0.45)",
                      textDecoration: "none", transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = "#fff"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18,
              }}>Company</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "About Us", href: "#" },
                  { label: "Products", href: "/dashboard/products" },
                  { label: "Contact", href: "/enquiry" },
                    { label: "Login", href: "/login" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} style={{
                      fontSize: "0.875rem", color: "rgba(255,255,255,0.45)",
                      textDecoration: "none", transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.target.style.color = "#fff"}
                      onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 18,
              }}>Quick Access</h4>
              <Link href="/login" style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, padding: "12px 16px", textDecoration: "none",
                transition: "background 0.22s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              >
                <IconClients size={18} color="rgba(255,255,255,0.5)" />
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  Team Login
                </span>
              </Link>
            </div>
          </div>

          {/* Footer bottom */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 28,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12,
          }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.28)" }}>
              © {new Date().getFullYear()} Unique Sorter And Equipment Pvt. Ltd. All rights reserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#52ba4f" }} />
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
