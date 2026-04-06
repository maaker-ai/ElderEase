"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Target: 1260 x 2736 (6.9" iPhone)
const W = 1260;
const H = 2736;

type SlideText = {
  tagline: string;
  subtitle: string;
  caption: string;
};

const LOCALIZED_SLIDES: Record<string, SlideText[]> = {
  en: [
    { tagline: "Never Miss", subtitle: "a Dose", caption: "Simple reminders\nfor every medication" },
    { tagline: "All Your", subtitle: "Medications", caption: "Organized list\neasy to manage" },
    { tagline: "Track Your", subtitle: "History", caption: "Calendar view\nstay on schedule" },
    { tagline: "Personalize", subtitle: "Your Experience", caption: "Large text & high contrast\ndesigned for comfort" },
    { tagline: "Simple", subtitle: "Pricing", caption: "Unlock all features\none-time purchase" },
  ],
  "zh-Hans": [
    { tagline: "永不", subtitle: "漏服", caption: "简单提醒\n每种药物都不遗漏" },
    { tagline: "所有", subtitle: "药物", caption: "清晰列表\n轻松管理" },
    { tagline: "追踪", subtitle: "服药记录", caption: "日历视图\n按时服药" },
    { tagline: "个性化", subtitle: "您的体验", caption: "大字体与高对比度\n专为舒适设计" },
    { tagline: "简单", subtitle: "定价", caption: "解锁全部功能\n一次购买" },
  ],
  "zh-Hant": [
    { tagline: "永不", subtitle: "漏服", caption: "簡單提醒\n每種藥物都不遺漏" },
    { tagline: "所有", subtitle: "藥物", caption: "清晰列表\n輕鬆管理" },
    { tagline: "追蹤", subtitle: "服藥記錄", caption: "日曆視圖\n按時服藥" },
    { tagline: "個性化", subtitle: "您的體驗", caption: "大字體與高對比度\n專為舒適設計" },
    { tagline: "簡單", subtitle: "定價", caption: "解鎖全部功能\n一次購買" },
  ],
  ja: [
    { tagline: "服薬忘れ", subtitle: "ゼロ", caption: "シンプルなリマインダー\nすべてのお薬を管理" },
    { tagline: "すべての", subtitle: "お薬", caption: "整理されたリスト\n簡単に管理" },
    { tagline: "服薬", subtitle: "履歴", caption: "カレンダー表示\nスケジュール通りに" },
    { tagline: "カスタマイズ", subtitle: "あなたの体験", caption: "大きな文字と高コントラスト\n快適さのために設計" },
    { tagline: "シンプルな", subtitle: "料金", caption: "すべての機能を解放\n一回の購入で" },
  ],
  ko: [
    { tagline: "복약", subtitle: "잊지 마세요", caption: "간단한 알림\n모든 약물을 관리" },
    { tagline: "모든", subtitle: "약물", caption: "정리된 목록\n쉬운 관리" },
    { tagline: "복약", subtitle: "기록", caption: "캘린더 보기\n일정대로 복용" },
    { tagline: "맞춤", subtitle: "설정", caption: "큰 글씨와 고대비\n편안함을 위한 설계" },
    { tagline: "간단한", subtitle: "가격", caption: "모든 기능 잠금 해제\n일회성 구매" },
  ],
  de: [
    { tagline: "Nie wieder", subtitle: "vergessen", caption: "Einfache Erinnerungen\nfür jedes Medikament" },
    { tagline: "Alle Ihre", subtitle: "Medikamente", caption: "Übersichtliche Liste\nleicht zu verwalten" },
    { tagline: "Verfolgen Sie", subtitle: "Ihre Historie", caption: "Kalenderansicht\npünktlich einnehmen" },
    { tagline: "Personalisieren", subtitle: "Sie Ihr Erlebnis", caption: "Große Schrift & hoher Kontrast\nfür Komfort gestaltet" },
    { tagline: "Einfache", subtitle: "Preise", caption: "Alle Funktionen freischalten\neinmaliger Kauf" },
  ],
  fr: [
    { tagline: "Ne ratez", subtitle: "plus une dose", caption: "Rappels simples\npour chaque médicament" },
    { tagline: "Tous vos", subtitle: "médicaments", caption: "Liste organisée\nfacile à gérer" },
    { tagline: "Suivez votre", subtitle: "historique", caption: "Vue calendrier\nrestez à l'heure" },
    { tagline: "Personnalisez", subtitle: "votre expérience", caption: "Grand texte & contraste élevé\nconçu pour le confort" },
    { tagline: "Tarification", subtitle: "simple", caption: "Débloquez toutes les fonctions\nachat unique" },
  ],
  es: [
    { tagline: "Nunca olvides", subtitle: "una dosis", caption: "Recordatorios simples\npara cada medicamento" },
    { tagline: "Todos tus", subtitle: "medicamentos", caption: "Lista organizada\nfácil de gestionar" },
    { tagline: "Rastrea tu", subtitle: "historial", caption: "Vista calendario\ntoma a tiempo" },
    { tagline: "Personaliza", subtitle: "tu experiencia", caption: "Texto grande y alto contraste\ndiseñado para comodidad" },
    { tagline: "Precios", subtitle: "simples", caption: "Desbloquea todas las funciones\ncompra única" },
  ],
  ru: [
    { tagline: "Не пропустите", subtitle: "приём", caption: "Простые напоминания\nдля каждого лекарства" },
    { tagline: "Все ваши", subtitle: "лекарства", caption: "Удобный список\nлегко управлять" },
    { tagline: "Отслеживайте", subtitle: "историю", caption: "Календарный вид\nпринимайте вовремя" },
    { tagline: "Настройте", subtitle: "под себя", caption: "Крупный текст и высокий контраст\nсоздано для удобства" },
    { tagline: "Простые", subtitle: "цены", caption: "Разблокируйте все функции\nразовая покупка" },
  ],
  it: [
    { tagline: "Mai più", subtitle: "una dose persa", caption: "Promemoria semplici\nper ogni farmaco" },
    { tagline: "Tutti i tuoi", subtitle: "farmaci", caption: "Lista organizzata\nfacile da gestire" },
    { tagline: "Traccia la", subtitle: "tua cronologia", caption: "Vista calendario\nassumi in orario" },
    { tagline: "Personalizza", subtitle: "la tua esperienza", caption: "Testo grande e alto contrasto\nprogettato per il comfort" },
    { tagline: "Prezzi", subtitle: "semplici", caption: "Sblocca tutte le funzioni\nacquisto unico" },
  ],
  ar: [
    { tagline: "لا تفوّت", subtitle: "جرعة أبدًا", caption: "تذكيرات بسيطة\nلكل دواء" },
    { tagline: "جميع", subtitle: "أدويتك", caption: "قائمة منظمة\nسهلة الإدارة" },
    { tagline: "تتبع", subtitle: "سجلك", caption: "عرض التقويم\nتناول في الموعد" },
    { tagline: "خصّص", subtitle: "تجربتك", caption: "نص كبير وتباين عالٍ\nمصمم للراحة" },
    { tagline: "أسعار", subtitle: "بسيطة", caption: "افتح جميع الميزات\nشراء لمرة واحدة" },
  ],
  id: [
    { tagline: "Jangan Lewatkan", subtitle: "Dosis", caption: "Pengingat sederhana\nuntuk setiap obat" },
    { tagline: "Semua", subtitle: "Obat Anda", caption: "Daftar terorganisir\nmudah dikelola" },
    { tagline: "Lacak", subtitle: "Riwayat", caption: "Tampilan kalender\nminum tepat waktu" },
    { tagline: "Sesuaikan", subtitle: "Pengalaman Anda", caption: "Teks besar & kontras tinggi\ndirancang untuk kenyamanan" },
    { tagline: "Harga", subtitle: "Sederhana", caption: "Buka semua fitur\npembelian sekali" },
  ],
};

const slideConfigs = [
  { id: 1, bg: "linear-gradient(160deg, #FFF8E7 0%, #FFE4B5 100%)", screenSlide: "today" },
  { id: 2, bg: "linear-gradient(160deg, #FFF5E0 0%, #FFDCA8 100%)", screenSlide: "medications" },
  { id: 3, bg: "linear-gradient(160deg, #FFF0D6 0%, #FFD49A 100%)", screenSlide: "history" },
  { id: 4, bg: "linear-gradient(160deg, #FFFBF0 0%, #FEF3C7 100%)", screenSlide: "settings" },
  { id: 5, bg: "linear-gradient(160deg, #FFF8E7 0%, #FFE4B5 100%)", screenSlide: "paywall" },
];

function getSlides(lang: string) {
  const texts = LOCALIZED_SLIDES[lang] || LOCALIZED_SLIDES.en;
  return slideConfigs.map((config, i) => ({
    ...config,
    tagline: texts[i].tagline,
    subtitle: texts[i].subtitle,
    caption: texts[i].caption,
  }));
}

function PhoneMockup({ screenSlide, lang }: { screenSlide: string; lang: string }) {
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
        src={`/app-captures/${lang}/${screenSlide}.png`}
        alt={screenSlide}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function SlideContent({ slideId, lang }: { slideId: number; lang: string }) {
  const slides = getSlides(lang);
  const slide = slides.find((s) => s.id === slideId);
  if (!slide) return <div>Slide not found</div>;

  const isHeroSlide = slideId === 1;

  return (
    <div
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
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: "rgba(255,180,50,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,180,50,0.04)", pointerEvents: "none" }} />

      {/* App icon (hero only) */}
      {isHeroSlide && (
        <div style={{ width: 140, height: 140, borderRadius: 32, overflow: "hidden", marginBottom: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
          <img src="/icon.png" alt="ElderEase" style={{ width: 140, height: 140, objectFit: "cover" }} />
        </div>
      )}

      {/* Heading */}
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
        <span style={{ color: "#D97706" }}>
          {slide.subtitle}
        </span>
      </div>

      {/* Caption */}
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

      {/* Phone mockup */}
      <div
        style={{
          transform: "scale(2.4)",
          transformOrigin: "top center",
          filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.2))",
        }}
      >
        <PhoneMockup screenSlide={slide.screenSlide} lang={lang} />
      </div>
    </div>
  );
}

function ExportContent() {
  const searchParams = useSearchParams();
  const slideParam = searchParams.get("slide");
  const langParam = searchParams.get("lang");
  const slideId = slideParam ? parseInt(slideParam) : 1;
  const lang = langParam || "en";

  return (
    <div style={{ width: W, height: H, overflow: "hidden" }}>
      <SlideContent slideId={slideId} lang={lang} />
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExportContent />
    </Suspense>
  );
}
