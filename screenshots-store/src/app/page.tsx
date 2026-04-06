"use client";

import { useRef } from "react";

// Target: 1260 x 2736 (6.9" iPhone)
const W = 1260;
const H = 2736;

// Scale for preview (display at 40%)
const SCALE = 0.4;

const slides = [
  { id: 1, bg: "linear-gradient(160deg, #FFF8E7 0%, #FFE4B5 100%)", tagline: "Never Miss", subtitle: "a Dose", caption: "Simple reminders\nfor every medication", screenSlide: "today" },
  { id: 2, bg: "linear-gradient(160deg, #FFF5E0 0%, #FFDCA8 100%)", tagline: "All Your", subtitle: "Medications", caption: "Organized list\neasy to manage", screenSlide: "medications" },
  { id: 3, bg: "linear-gradient(160deg, #FFF0D6 0%, #FFD49A 100%)", tagline: "Track Your", subtitle: "History", caption: "Calendar view\nstay on schedule", screenSlide: "history" },
  { id: 4, bg: "linear-gradient(160deg, #FFFBF0 0%, #FEF3C7 100%)", tagline: "Personalize", subtitle: "Your Experience", caption: "Large text & high contrast\ndesigned for comfort", screenSlide: "settings" },
  { id: 5, bg: "linear-gradient(160deg, #FFF8E7 0%, #FFE4B5 100%)", tagline: "Simple", subtitle: "Pricing", caption: "Unlock all features\none-time purchase", screenSlide: "paywall" },
];

function PhoneMockup({ screenSlide }: { screenSlide: string }) {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: "white",
        borderRadius: 54,
        border: "8px solid #2D2D2D",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 30px 80px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 36,
          background: "#2D2D2D",
          borderRadius: 20,
          zIndex: 10,
        }}
      />
      <img
        src={`/app-captures/en/${screenSlide}.png`}
        alt={screenSlide}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function Slide({ slide, index }: { slide: (typeof slides)[number]; index: number }) {
  const isHeroSlide = index === 0;

  return (
    <div
      id={`slide-${slide.id}`}
      style={{
        width: W,
        height: H,
        background: slide.bg,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "100px 80px 0",
        flexShrink: 0,
      }}
    >
      <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "rgba(255,180,50,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,180,50,0.04)", pointerEvents: "none" }} />

      {isHeroSlide && (
        <div style={{ width: 140, height: 140, borderRadius: 32, overflow: "hidden", marginBottom: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
          <img src="/icon.png" alt="ElderEase" style={{ width: 140, height: 140, objectFit: "cover" }} />
        </div>
      )}

      <div
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
          fontSize: 116,
          fontWeight: 900,
          color: "#2D2D2D",
          textAlign: "center",
          lineHeight: 1.05,
          letterSpacing: "-2px",
          marginBottom: 16,
        }}
      >
        {slide.tagline}
        <br />
        <span style={{ color: "#D97706" }}>{slide.subtitle}</span>
      </div>

      <div
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
          fontSize: 48,
          color: "#78716C",
          textAlign: "center",
          lineHeight: 1.5,
          marginBottom: 48,
          whiteSpace: "pre-line",
        }}
      >
        {slide.caption}
      </div>

      <div
        style={{
          transform: "scale(2.4)",
          transformOrigin: "top center",
          filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.2))",
        }}
      >
        <PhoneMockup screenSlide={slide.screenSlide} />
      </div>
    </div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        overflowX: "auto",
        background: "#FFFBF0",
        minHeight: "100vh",
        alignItems: "flex-start",
      }}
    >
      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: 20,
          transformOrigin: "top left",
          transform: `scale(${SCALE})`,
          width: `${(W + 20) * slides.length}px`,
          height: `${H}px`,
          flexShrink: 0,
        }}
      >
        {slides.map((slide, i) => (
          <Slide key={slide.id} slide={slide} index={i} />
        ))}
      </div>
    </div>
  );
}
