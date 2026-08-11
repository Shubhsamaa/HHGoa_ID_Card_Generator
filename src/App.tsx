import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Badge,
  Camera,
  Check,
  ChevronRight,
  Code2,
  ImagePlus,
  Loader2,
  Maximize2,
  Move,
  RefreshCcw,
  RotateCcw,
  Share2,
  Sparkles,
  UserRound,
  WandSparkles,
  X,
} from 'lucide-react';
import { generateGraphic, type GenerateResult } from '@/lib/generate';
import { generateBuilderTitle, HASHTAG } from '@/lib/builderTitles';
import { cropPhoto } from '@/lib/image';
import { EVENT } from '@/lib/constants';

type Step = 'upload' | 'crop' | 'details' | 'result';
type Format = 'pfp' | 'card';

function App() {
  const [step, setStep] = useState<Step>('upload');
  const [format, setFormat] = useState<Format>('pfp');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [name, setName] = useState('');
  const [stack, setStack] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [shareToast, setShareToast] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleGenerate = useCallback(async (photo: File, selectedFormat: Format, cardInput?: { name: string; stack: string }) => {
    setGenerating(true);
    setError('');
    try {
      const generated = await generateGraphic(photo, selectedFormat, cardInput);
      setResult(generated);
      setStep('result');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The graphic could not be created. Try another photo.');
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleFile = useCallback((photo: File) => {
    setError('');
    if (!photo.type.startsWith('image/') && !/\.(heic|heif)$/i.test(photo.name)) {
      setError('Use a JPG, PNG, or HEIC photo.');
      return;
    }
    setFile(photo);
    setPreviewUrl(URL.createObjectURL(photo));
    if (format === 'pfp') handleGenerate(photo, 'pfp');
    else setStep('crop');
  }, [format, handleGenerate]);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const download = () => {
    if (!result) return;
    const anchor = document.createElement('a');
    anchor.href = result.dataUrl;
    anchor.download = `hhgoa-2026-${result.format}.png`;
    anchor.click();
  };

  const share = () => {
    if (!result) return;
    const text = encodeURIComponent(result.caption);
    const url = encodeURIComponent(result.shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
    setShareToast(true);
    window.setTimeout(() => setShareToast(false), 3000);
  };

  const confirmCrop = async () => {
    if (!file) return;
    const cropped = await cropPhoto(file, cropZoom, cropOffset);
    setFile(cropped);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(cropped));
    setStep('details');
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setResult(null);
    setPreviewUrl('');
    setName('');
    setStack('');
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const predictedTitle = name || stack ? generateBuilderTitle(name, stack) : 'Your title appears here';
  const stepIndex = step === 'upload' ? 1 : step === 'crop' ? 2 : step === 'details' ? 3 : 4;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#005C37] text-[#FFED00]">
      {/* Ambient background layers */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none fixed inset-0 bg-dots opacity-30" />
      <div className="pointer-events-none fixed -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#FF0A8A]/15 blur-[120px] glow-pulse" />
      <div className="pointer-events-none fixed -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#FFED00]/10 blur-[120px] glow-pulse" style={{ animationDelay: '2s' }} />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#FF0A8A]/10 blur-[100px] glow-pulse" style={{ animationDelay: '1s' }} />

      {/* Header */}
<header
  className="sticky top-0 z-[100] w-full"
  style={{
    background: '#005C37',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  }}
>
  <div className="mx-auto flex h-[72px] w-full items-center justify-between px-6 sm:px-10 lg:px-16">

    {/* LEFT — LOGO / BRAND */}
    <div className="flex items-center">
      <div className="display text-[24px] font-black tracking-tight text-[#FFED00] sm:text-[28px]">
        HH GOA
      </div>

      <div className="ml-3 hidden h-7 w-px bg-[#FFED00]/30 sm:block" />

      <div className="ml-3 hidden text-[9px] font-bold uppercase tracking-[0.25em] text-white/60 sm:block">
        FRAME BUILDER / 2026
      </div>
    </div>

    {/* RIGHT NAVIGATION */}
    <div className="flex items-center gap-5 sm:gap-8">

      {/* CHECK */}
      <a
        href="#builder"
        className="
          hidden
          text-[13px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-white
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:text-[#FFED00]
          sm:block
        "
      >
        CHECK
      </a>

      {/* HYPE */}
      <a
        href="#about"
        className="
          hidden
          text-[13px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-white
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:text-[#FFED00]
          sm:block
        "
      >
        HYPE
      </a>

      {/* APPLY TICKET */}
      <a
        href={`https://${EVENT.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          group
          relative
          flex
          h-[52px]
          w-[150px]
          items-center
          justify-center
          overflow-hidden
          bg-[#FFED00]
          text-[#005C37]
          shadow-[0_4px_18px_rgba(255,237,0,0.22)]
          transition-all
          duration-200
          hover:-translate-y-1
          hover:shadow-[0_8px_28px_rgba(255,237,0,0.35)]
          active:translate-y-[1px]
          sm:h-[56px]
          sm:w-[165px]
        "
      >

        {/* TOP DECORATIVE STRIP */}
        <span
          className="absolute left-0 right-0 top-0 h-[7px]"
          style={{
            background:
              'repeating-linear-gradient(135deg, #FF0A8A 0px, #FF0A8A 8px, #005C37 8px, #005C37 14px, #FFED00 14px, #FFED00 20px)',
          }}
        />

        {/* BOTTOM DECORATIVE STRIP */}
        <span
          className="absolute bottom-0 left-0 right-0 h-[7px]"
          style={{
            background:
              'repeating-linear-gradient(135deg, #FF0A8A 0px, #FF0A8A 8px, #005C37 8px, #005C37 14px, #FFED00 14px, #FFED00 20px)',
          }}
        />

        {/* APPLY TEXT */}
        <span className="display relative z-10 pt-0.5 text-[24px] font-black tracking-wide sm:text-[27px]">
          APPLY
        </span>

        {/* Hover shine */}
        <span
          className="
            pointer-events-none
            absolute
            inset-y-0
            -left-1/2
            w-1/3
            rotate-[20deg]
            bg-white/20
            transition-all
            duration-500
            group-hover:left-[120%]
          "
        />
      </a>
    </div>
  </div>
</header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-14 pt-8 sm:px-10 sm:pt-12">
        {/* Hero */}
        <section className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
          <div className="max-w-[760px]">
            <h1 className="display text-[18vw] font-medium uppercase leading-[.78] tracking-[-.045em] sm:text-[120px] lg:text-[148px]" style={{ textShadow: '0 6px 0 rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.3)' }}>Frame<br /><span className="shimmer-text">your</span><br />moment.</h1>
            <p className="mt-8 max-w-[520px] text-sm leading-7 text-white/65 sm:text-base">Turn one photo into a piece of HH Goa 2026. Pick your format, make it yours, and leave with something worth posting.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><Camera size={14} className="text-[#FFED00]" /> Auto color-grade</div>
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><WandSparkles size={14} className="text-[#FF0A8A]" /> AI-styled frames</div>
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><Share2 size={14} className="text-[#FFED00]" /> One-click share</div>
            </div>
          </div>
          <div className="hidden justify-end lg:flex"><HeroVisual /></div>
        </section>

        {/* Marquee */}
        <div className="my-10 overflow-hidden border-y border-white/10 py-3 text-[10px] uppercase tracking-[.28em] text-white/45 sm:my-14">
          <div className="marquee-track flex min-w-max gap-10"><span>{HASHTAG}</span><span>·</span><span>Made for builders</span><span>·</span><span>Ready for X</span><span>·</span><span>HH Goa 2026</span><span>·</span><span>{HASHTAG}</span><span>·</span><span>Made for builders</span><span>·</span><span>Ready for X</span><span>·</span><span>HH Goa 2026</span><span>·</span></div>
        </div>

        {/* Builder / result section */}
        {step !== 'result' ? (
          <section className="grid gap-8 lg:grid-cols-[.74fr_1.26fr] lg:gap-14">
            <div className="space-y-7">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[.2em] text-white/50"><StepMarker number={stepIndex} /><span>Build your graphic</span></div>
              {step === 'upload' && <UploadPanel format={format} setFormat={setFormat} inputRef={inputRef} dragActive={dragActive} setDragActive={setDragActive} onDrop={onDrop} onFile={handleFile} error={error} />}
              {step === 'crop' && <CropPanel previewUrl={previewUrl} zoom={cropZoom} setZoom={setCropZoom} offset={cropOffset} setOffset={setCropOffset} onBack={reset} onConfirm={confirmCrop} />}
              {step === 'details' && <DetailsPanel previewUrl={previewUrl} name={name} setName={setName} stack={stack} setStack={setStack} predictedTitle={predictedTitle} generating={generating} onBack={() => setStep('crop')} onGenerate={() => file && handleGenerate(file, 'card', { name, stack })} />}
              {generating && step === 'upload' && (
                <div className="glass-strong flex items-center gap-3 rounded-2xl p-4 text-xs uppercase tracking-[.15em] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                  <Loader2 size={18} className="animate-spin text-[#FFED00]" /> Composing your frame...
                </div>
              )}
            </div>
            <aside className="hidden lg:block"><Manifest /></aside>
          </section>
        ) : (
          <section className="mt-4">
            <ResultPanel result={result!} onDownload={download} onShare={share} onReset={reset} shareToast={shareToast} />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-5 py-5 backdrop-blur-md sm:px-10" style={{ background: 'rgba(0,93,55,0.4)' }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[.2em] text-white/40">
          <span className="flex items-center gap-2"><Sparkles size={12} className="text-[#FFED00]/50" /> HH Goa 2026</span>
          <span>{EVENT.dateLine}</span>
          <span className="text-[#FF0A8A]/70">{HASHTAG}</span>
        </div>
      </footer>
    </div>
  );
}

/* ── 3D tilt hook ── */
function useTilt(maxDeg = 14) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
  };
  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

/* ── Hero visual: animated Goa scene + side Hindi mark ── */
function HeroVisual() {
  return (
    <div className="relative flex min-h-[430px] w-full items-center justify-center overflow-visible" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes goaFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotateZ(-0.4deg); }
          50% { transform: translate3d(0, -9px, 0) rotateZ(0.4deg); }
        }
        @keyframes goaSun {
          0%, 100% { transform: scale(1); opacity: .78; }
          50% { transform: scale(1.07); opacity: 1; }
        }
        @keyframes goaWave1 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-18px); }
        }
        @keyframes goaWave2 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(14px); }
        }
        @keyframes goaCloud {
          0%, 100% { transform: translateX(-14px); }
          50% { transform: translateX(16px); }
        }
        @keyframes goaPalmLeft {
          0%, 100% { transform: rotate(-1.5deg); transform-origin: 145px 270px; }
          50% { transform: rotate(1.5deg); transform-origin: 145px 270px; }
        }
        @keyframes goaPalmRight {
          0%, 100% { transform: rotate(1.2deg); transform-origin: 650px 275px; }
          50% { transform: rotate(-1.2deg); transform-origin: 650px 275px; }
        }
        @keyframes goaSpark {
          0%, 100% { opacity: .25; transform: scale(.75); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes goaBadge {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        .goa-scene-float { animation: goaFloat 7s ease-in-out infinite; transform-origin: center; }
        .goa-sun { animation: goaSun 5s ease-in-out infinite; transform-origin: 400px 135px; }
        .goa-wave-1 { animation: goaWave1 8s ease-in-out infinite; }
        .goa-wave-2 { animation: goaWave2 11s ease-in-out infinite; }
        .goa-cloud { animation: goaCloud 18s ease-in-out infinite; }
        .goa-palm-left { animation: goaPalmLeft 5s ease-in-out infinite; }
        .goa-palm-right { animation: goaPalmRight 6s ease-in-out infinite; }
        .goa-spark { animation: goaSpark 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .goa-badge { animation: goaBadge 5s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .goa-scene-float, .goa-sun, .goa-wave-1, .goa-wave-2, .goa-cloud,
          .goa-palm-left, .goa-palm-right, .goa-spark, .goa-badge { animation: none !important; }
        }
      `}</style>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute right-4 top-10 h-72 w-72 rounded-full bg-[#FFED00]/20 blur-[90px] glow-pulse" />
      <div className="pointer-events-none absolute bottom-4 left-16 h-64 w-64 rounded-full bg-[#FF0A8A]/15 blur-[100px] glow-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Keep the original Hindi Goa mark, but move it to the side as a small floating accent. */}
      <div className="goa-badge absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 sm:block lg:left-2 xl:left-0">
        <div className="relative rounded-2xl border border-[#FFED00]/30 bg-[#005C37]/80 p-2 shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="absolute -inset-1 rounded-2xl bg-[#FFED00]/10 blur-md" />
          <img
            src="/assets/goa_hindi.svg"
            alt="गोवा"
            className="relative h-20 w-20 drop-shadow-[0_8px_20px_rgba(255,237,0,0.35)] sm:h-24 sm:w-24"
          />
          <div className="mt-1 text-center text-[7px] font-bold uppercase tracking-[.18em] text-[#FFED00]/70">Goa / 26</div>
        </div>
      </div>

      {/* Main illustrated Goa scene */}
      <div className="goa-scene-float relative w-full max-w-[720px]">
        <svg
          viewBox="0 0 800 520"
          role="img"
          aria-label="Animated tropical Goa beach scene"
          className="relative z-10 h-auto w-full overflow-visible drop-shadow-[0_28px_55px_rgba(0,0,0,0.4)]"
        >
          <defs>
            <linearGradient id="goaSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#005C37" />
              <stop offset="58%" stopColor="#08714A" />
              <stop offset="100%" stopColor="#FFED00" stopOpacity=".28" />
            </linearGradient>
            <linearGradient id="goaSea" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#006B43" />
              <stop offset="100%" stopColor="#003D28" />
            </linearGradient>
            <linearGradient id="goaSand" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F4DFAD" />
              <stop offset="55%" stopColor="#FFED00" stopOpacity=".75" />
              <stop offset="100%" stopColor="#E7C98A" />
            </linearGradient>
            <filter id="goaGlow">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <clipPath id="goaCardClip">
              <rect x="42" y="22" width="716" height="456" rx="34" />
            </clipPath>
          </defs>

          {/* Glass poster frame */}
          <rect x="42" y="22" width="716" height="456" rx="34" fill="#F6E7C4" fillOpacity=".08" stroke="#FFED00" strokeOpacity=".28" strokeWidth="2" />
          <g clipPath="url(#goaCardClip)">
            <rect x="42" y="22" width="716" height="456" fill="url(#goaSky)" />

            {/* Sun */}
            <g className="goa-sun">
              <circle cx="400" cy="135" r="68" fill="#FFED00" fillOpacity=".16" filter="url(#goaGlow)" />
              <circle cx="400" cy="135" r="45" fill="#FFED00" />
              <circle cx="400" cy="135" r="34" fill="#FFF3A8" fillOpacity=".55" />
            </g>

            {/* Clouds */}
            <g className="goa-cloud" fill="#FFF6DC" fillOpacity=".48">
              <ellipse cx="160" cy="100" rx="55" ry="20" />
              <ellipse cx="205" cy="92" rx="42" ry="25" />
              <ellipse cx="244" cy="103" rx="58" ry="18" />
            </g>
            <g className="goa-cloud" style={{ animationDelay: '6s' }} fill="#FFF6DC" fillOpacity=".32">
              <ellipse cx="590" cy="78" rx="45" ry="16" />
              <ellipse cx="625" cy="70" rx="34" ry="20" />
              <ellipse cx="660" cy="80" rx="48" ry="15" />
            </g>

            {/* Distant hills */}
            <path d="M42 285 Q170 220 290 282 T520 270 T758 252 V335 H42Z" fill="#003D28" fillOpacity=".52" />

            {/* Sea */}
            <rect x="42" y="300" width="716" height="178" fill="url(#goaSea)" />
            <g className="goa-wave-1" fill="none" stroke="#FFED00" strokeOpacity=".65" strokeWidth="3">
              <path d="M55 334 C115 310 165 355 230 330 S350 310 420 334 S545 355 615 328 S700 315 760 335" />
              <path d="M15 385 C90 360 150 400 220 382 S350 365 430 390 S550 410 630 382 S720 365 790 390" />
            </g>
            <g className="goa-wave-2" fill="none" stroke="#FFF6DC" strokeOpacity=".48" strokeWidth="2">
              <path d="M40 355 C110 338 160 370 235 350 S370 340 445 358 S575 375 650 350 S720 342 780 360" />
              <path d="M40 425 C120 405 190 440 270 418 S410 405 500 430 S640 446 760 420" />
            </g>

            {/* Sand */}
            <path d="M42 418 Q200 382 350 424 T758 416 V478 H42Z" fill="url(#goaSand)" />

            {/* Left palm */}
            <g className="goa-palm-left">
              <path d="M145 414 Q138 330 145 270" stroke="#123E2A" strokeWidth="13" fill="none" strokeLinecap="round" />
              <g fill="#0D4B31">
                <path d="M145 278 Q91 240 74 248 Q98 278 140 291Z" />
                <path d="M145 276 Q99 210 82 216 Q103 255 143 286Z" />
                <path d="M148 278 Q120 198 137 193 Q156 232 157 278Z" />
                <path d="M151 279 Q181 205 198 208 Q187 251 160 286Z" />
                <path d="M153 283 Q218 235 230 249 Q198 278 160 294Z" />
              </g>
            </g>

            {/* Right palm */}
            <g className="goa-palm-right">
              <path d="M650 418 Q656 330 650 275" stroke="#123E2A" strokeWidth="13" fill="none" strokeLinecap="round" />
              <g fill="#0D4B31">
                <path d="M650 282 Q705 242 724 251 Q700 278 657 294Z" />
                <path d="M650 281 Q698 214 716 220 Q694 257 653 291Z" />
                <path d="M648 280 Q676 198 660 194 Q640 235 639 280Z" />
                <path d="M646 283 Q617 205 600 211 Q612 250 638 291Z" />
                <path d="M644 288 Q580 238 568 251 Q600 280 637 297Z" />
              </g>
            </g>

            {/* Goa house / Portuguese villa */}
            <g transform="translate(230 205)">
              <rect x="55" y="122" width="270" height="110" rx="5" fill="#F6E7C4" stroke="#173F2C" strokeWidth="4" />
              <path d="M34 124 L190 54 L346 124Z" fill="#C86D54" stroke="#173F2C" strokeWidth="5" />
              <path d="M48 116 L190 48 L332 116" fill="none" stroke="#FFED00" strokeOpacity=".6" strokeWidth="5" />
              <rect x="75" y="145" width="48" height="87" fill="#0E5638" stroke="#173F2C" strokeWidth="3" />
              <rect x="166" y="145" width="48" height="87" fill="#0E5638" stroke="#173F2C" strokeWidth="3" />
              <rect x="257" y="145" width="48" height="87" fill="#0E5638" stroke="#173F2C" strokeWidth="3" />
              <path d="M50 137 H330" stroke="#173F2C" strokeWidth="5" />
              <path d="M70 126 V165 M110 126 V165 M150 126 V165 M190 126 V165 M230 126 V165 M270 126 V165 M310 126 V165" stroke="#173F2C" strokeWidth="3" />
              <path d="M72 235 H310" stroke="#C23A5E" strokeWidth="8" />
              <path d="M168 232 L168 250 H212 L212 232" fill="#C86D54" stroke="#173F2C" strokeWidth="4" />
              <circle cx="99" cy="175" r="5" fill="#FFED00" />
              <circle cx="190" cy="175" r="5" fill="#FFED00" />
              <circle cx="281" cy="175" r="5" fill="#FFED00" />
            </g>

            {/* Foreground plants */}
            <g fill="#0B4B31" stroke="#173F2C" strokeWidth="2">
              <path d="M215 448 Q190 395 200 380 Q225 408 220 448Z" />
              <path d="M235 450 Q240 390 258 380 Q258 420 245 450Z" />
              <path d="M570 448 Q545 395 555 380 Q580 408 575 448Z" />
              <path d="M590 450 Q595 390 615 382 Q610 420 600 450Z" />
            </g>

            {/* Decorative sparks */}
            <g className="goa-spark" fill="#FF0A8A">
              <circle cx="92" cy="178" r="4" />
              <circle cx="708" cy="205" r="4" />
              <circle cx="120" cy="370" r="3" />
              <circle cx="690" cy="360" r="3" />
            </g>
            <g className="goa-spark" style={{ animationDelay: '1.2s' }} fill="#FFED00">
              <circle cx="270" cy="88" r="3" />
              <circle cx="530" cy="120" r="3" />
              <circle cx="730" cy="290" r="3" />
            </g>

            {/* Caption strip */}
            <rect x="198" y="440" width="404" height="30" rx="15" fill="#005C37" fillOpacity=".88" stroke="#FFED00" strokeOpacity=".3" />
            <text x="400" y="460" textAnchor="middle" fill="#FFED00" fontSize="12" fontFamily="monospace" fontWeight="700" letterSpacing="3">
              CODE · COMMUNITY · COASTAL VIBES
            </text>
          </g>
        </svg>

        {/* Floating event badge */}
        <div className="goa-badge absolute -bottom-2 right-0 z-20 rounded-2xl border border-[#FF0A8A]/30 bg-[#005C37]/85 px-4 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:right-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF0A8A]" />
            <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#FFED00]">HH Goa · 2026</span>
          </div>
          <div className="mt-1 text-[8px] uppercase tracking-[.16em] text-white/50">Goa · India · Builders</div>
        </div>
      </div>
    </div>
  );
}

/* ── Crop panel ── */
function CropPanel({ previewUrl, zoom, setZoom, offset, setOffset, onBack, onConfirm }: { previewUrl: string; zoom: number; setZoom: (z: number) => void; offset: { x: number; y: number }; setOffset: (o: { x: number; y: number }) => void; onBack: () => void; onConfirm: () => void }) {
  return (
    <div className="space-y-5 fade-in">
      <div className="glass-pill flex items-center gap-3 rounded-xl px-4 py-2.5 text-[10px] uppercase tracking-[.2em] text-white/60"><Camera size={15} className="text-[#FFED00]" /><span>Step 02 / Position your photo</span></div>

      <div className="glass-strong relative mx-auto aspect-[290/360] w-full max-w-[300px] overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        {previewUrl && <img src={previewUrl} alt="Crop preview" className="absolute inset-0 h-full w-full select-none object-cover" style={{ transform: `scale(${zoom}) translate(${offset.x * 50}%, ${offset.y * 50}%)`, transition: 'transform .15s ease-out' }} draggable={false} />}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" /><div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
          <div className="absolute left-0 top-1/3 h-px w-full bg-white/20" /><div className="absolute left-0 top-2/3 h-px w-full bg-white/20" />
        </div>
        <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#FF0A8A]" />
        <div className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#FF0A8A]" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#FF0A8A]" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#FF0A8A]" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[.18em] text-white/45"><span className="flex items-center gap-1.5"><Maximize2 size={12} /> Zoom</span><span className="text-[#FF0A8A]">{zoom.toFixed(1)}x</span></div>
        <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="neon-slider w-full" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[.18em] text-white/45"><Move size={12} /> Position</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { dx: -0.1, dy: -0.1, rot: '-rotate-45' }, { dx: 0, dy: -0.1, rot: '-rotate-90' }, { dx: 0.1, dy: -0.1, rot: 'rotate-45' },
            { dx: -0.1, dy: 0, rot: 'rotate-180' }, { dx: 0, dy: 0, rot: '', reset: true }, { dx: 0.1, dy: 0, rot: '' },
            { dx: -0.1, dy: 0.1, rot: 'rotate-135' }, { dx: 0, dy: 0.1, rot: 'rotate-90' }, { dx: 0.1, dy: 0.1, rot: 'rotate-45' },
          ].map((btn, i) => btn.reset ? (
            <button key={i} onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="glass-pill grid h-10 place-items-center rounded-lg hover:border-[#FF0A8A]/60"><RotateCcw size={14} className="text-[#FF0A8A]" /></button>
          ) : (
            <button key={i} onClick={() => setOffset({ x: offset.x + btn.dx, y: offset.y + btn.dy })} className="glass-pill grid h-10 place-items-center rounded-lg hover:border-[#FFED00]/40"><Move size={14} className={btn.rot} /></button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[9px] uppercase tracking-[.18em] text-white/45">Presets:</span>
        {[1, 1.5, 2, 3].map((z) => (
          <button key={z} onClick={() => setZoom(z)} className={`rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${zoom === z ? 'bg-[#FFED00] text-[#005C37]' : 'glass-pill text-white/55'}`}>{z}x</button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="glass-pill rounded-xl px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/70 hover:text-white">Back</button>
        <button onClick={onConfirm} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow"><Check size={16} /> Looks good <ArrowUpRight size={15} /></button>
      </div>
      <p className="text-[10px] uppercase leading-5 tracking-[.14em] text-white/35">Center your face using the grid. The crop matches your ID card's proportions exactly.</p>
    </div>
  );
}

/* ── Step marker ── */
function StepMarker({ number }: { number: number }) {
  return <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FFED00] font-bold text-[#005C37] shadow-[0_3px_0_rgba(0,0,0,0.3),0_0_16px_rgba(255,237,0,0.3)]">0{number}</span>;
}

/* ── Upload panel ── */
function UploadPanel({ format, setFormat, inputRef, dragActive, setDragActive, onDrop, onFile, error }: { format: Format; setFormat: (format: Format) => void; inputRef: React.RefObject<HTMLInputElement | null>; dragActive: boolean; setDragActive: (active: boolean) => void; onDrop: (event: React.DragEvent<HTMLDivElement>) => void; onFile: (file: File) => void; error: string }) {
  return (
    <div className="space-y-5 fade-in">
      <div className="glass grid grid-cols-2 gap-2 rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <FormatButton active={format === 'pfp'} onClick={() => setFormat('pfp')} icon={<UserRound size={17} />} title="PFP frame" copy="Square / profile" />
        <FormatButton active={format === 'card'} onClick={() => setFormat('card')} icon={<Badge size={17} />} title="Builder ID" copy="Portrait / post" />
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative min-h-[320px] cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 transition-all duration-300 sm:min-h-[380px] ${dragActive ? 'border-[#FF0A8A] bg-[#FF0A8A]/10 shadow-[0_20px_60px_rgba(255,10,138,0.3)]' : 'glass border-white/15 hover:border-[#FFED00]/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:-translate-y-1'}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif" onChange={(e) => { const photo = e.target.files?.[0]; if (photo) onFile(photo); }} className="hidden" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
        <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
          <div className="upload-ring mb-6 grid h-20 w-20 place-items-center rounded-full border border-[#FFED00]/40 bg-[#FFED00]/10 text-[#FFED00] shadow-[0_10px_40px_rgba(255,237,0,0.2),inset_0_2px_8px_rgba(255,255,255,0.1)] backdrop-blur-md transition-transform group-hover:scale-110">
            <ImagePlus size={30} strokeWidth={2.5} />
          </div>
          <div className="display text-4xl uppercase leading-none sm:text-5xl neon-text">Drop your<br />best shot.</div>
          <p className="mt-4 text-[10px] uppercase tracking-[.18em] text-white/45">JPG · PNG · HEIC / tap to browse</p>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#FF0A8A]">Start creating <ChevronRight size={14} /></div>
        </div>
      </div>

      {error && <div className="glass-strong flex items-center gap-2 rounded-xl border border-[#FF0A8A]/40 p-3 text-xs text-[#FFED00] shadow-[0_4px_15px_rgba(255,10,138,0.2)]"><AlertCircle size={16} className="text-[#FF0A8A]" />{error}</div>}
      <p className="text-[10px] uppercase leading-5 tracking-[.14em] text-white/35">Your photo gets color-graded, vignetted, and grain-textured automatically — no editing skills needed.</p>
    </div>
  );
}

function FormatButton({ active, onClick, icon, title, copy }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${active ? 'bg-[#FFED00] text-[#005C37] shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]' : 'text-white/55 hover:bg-white/5'}`}>
      <span>{icon}</span>
      <span><span className="block text-xs font-bold uppercase tracking-[.08em]">{title}</span><span className="mt-1 block text-[9px] uppercase tracking-[.12em] opacity-65">{copy}</span></span>
    </button>
  );
}

/* ── Details panel ── */
function DetailsPanel({ previewUrl, name, setName, stack, setStack, predictedTitle, generating, onBack, onGenerate }: { previewUrl: string; name: string; setName: (value: string) => void; stack: string; setStack: (value: string) => void; predictedTitle: string; generating: boolean; onBack: () => void; onGenerate: () => void }) {
  return (
    <div className="space-y-6 fade-in">
      <div className="glass-strong flex items-center gap-5 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-[#FFED00]/40 bg-[#FFED00]/5 shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2)]">
          {previewUrl && <img src={previewUrl} alt="Your upload" className="h-full w-full object-cover" style={{ filter: 'contrast(1.1) saturate(1.15) brightness(1.03)' }} />}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[.2em] text-white/45">Step 03 / Identity</div>
          <div className="display mt-2 text-3xl uppercase leading-none neon-text">Make it yours.</div>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Your name" value={name} onChange={setName} placeholder="Alex Rivera" icon={<UserRound size={16} />} />
        <Field label="Stack / role" value={stack} onChange={setStack} placeholder="Frontend · AI · Design" icon={<Code2 size={16} />} />
      </div>

      <div className="glass-strong rounded-2xl border-l-4 border-[#FF0A8A] p-4 shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
        <div className="text-[9px] uppercase tracking-[.2em] text-white/45">Generated builder title</div>
        <div className="mt-2 text-sm font-bold text-[#FFED00]">{predictedTitle}</div>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="glass-pill rounded-xl px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/70 hover:text-white">Back</button>
        <button onClick={onGenerate} disabled={!name.trim() || generating} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />} Generate badge <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; icon: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/55">{icon}{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={50} className="glass-strong w-full rounded-xl border border-white/10 px-4 py-4 text-sm text-[#FFED00] outline-none placeholder:text-white/20 focus:border-[#FF0A8A]/50 focus:shadow-[0_4px_20px_rgba(255,10,138,0.15)]" />
    </label>
  );
}

/* ── Result panel ── */
function ResultPanel({ result, onDownload, onShare, onReset, shareToast }: { result: GenerateResult; onDownload: () => void; onShare: () => void; onReset: () => void; shareToast: boolean }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(12);

  return (
    <div className="space-y-7 fade-in-scale">
      <div className="glass flex items-center justify-between rounded-2xl border-b border-white/10 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#FF0A8A]"><Check size={15} /> Graphic ready</div>
          <div className="display mt-2 text-3xl uppercase leading-none neon-text sm:text-5xl">Looks good.<br />Now make noise.</div>
        </div>
        <button onClick={onReset} className="glass-pill rounded-xl p-3 text-white/60 transition-transform hover:scale-105 hover:text-white" aria-label="Start over"><RefreshCcw size={17} /></button>
      </div>

      {/* Dedicated large result stage: the generated card gets the visual priority. */}
      <div className="glass-card relative overflow-hidden rounded-3xl p-3 shadow-[0_35px_100px_rgba(0,0,0,0.5)] sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
        <div className="relative flex min-h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-black/10 p-3 sm:p-6 lg:min-h-[520px]">
          <div className="relative w-full max-w-[1180px]" style={{ perspective: '1200px' }}>
            <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="tilt-card relative overflow-hidden rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              <img src={result.dataUrl} alt="Generated HH Goa ID card" className="block h-auto w-full rounded-xl" style={{ transform: 'translateZ(20px)' }} />
              <div className="absolute left-4 top-4 rounded-lg bg-[#FF0A8A] px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(255,10,138,0.4)] sm:left-6 sm:top-6">Final PNG</div>
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions stay below the large preview for maximum card visibility. */}
      <div className="mx-auto grid w-full max-w-[760px] grid-cols-2 gap-3">
        <button onClick={onDownload} className="glass-pill flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#FFED00] shadow-[0_5px_0_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3)]"><ArrowDownToLine size={16} /> Download</button>
        <button onClick={onShare} className="flex items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow"><X size={17} /> Share to X</button>
      </div>

      <div className="mx-auto w-full max-w-[760px] glass-strong rounded-xl p-4">
        <div className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-[.18em] text-white/45"><Share2 size={13} /> Tweet copy ready</div>
        <p className="whitespace-pre-line text-xs leading-6 text-[#FFED00]/85">{result.caption}</p>
      </div>

      {shareToast && <div className="mx-auto flex w-full max-w-[760px] items-center gap-2 rounded-xl border border-[#FF0A8A]/40 p-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#FF0A8A] shadow-[0_8px_25px_rgba(255,10,138,0.4)] glass-strong"><Check size={15} /> X opened in a new tab</div>}
    </div>
  );
}

/* ── Manifest sidebar ── */
function Manifest() {
  return (
    <div className="sticky top-24 space-y-8">
      <div className="glass-card relative overflow-hidden rounded-2xl p-6">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
        <div className="relative">
          <div className="mb-4 text-[10px] uppercase tracking-[.24em] text-white/45">The brief</div>
          <div className="display text-5xl uppercase leading-[.82] neon-text">One photo.<br /><span className="shimmer-text">Two ways</span><br />to show up.</div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { n: '01', t: 'Upload any photo — portrait, landscape, off-center. We auto-crop and color-grade it.' },
          { n: '02', t: 'Wrap it in the official HH Goa PFP frame or build a shareable identity card.' },
          { n: '03', t: 'Download a real PNG or post straight to X with a pre-written caption.' },
        ].map((s) => (
          <div key={s.n} className="glass-pill flex gap-4 rounded-xl p-4 text-xs leading-6 text-white/60">
            <span className="text-[#FF0A8A] font-bold">{s.n}</span>
            <span>{s.t}</span>
          </div>
        ))}
      </div>

      <div className="glass-strong rounded-2xl p-4 text-[10px] uppercase leading-5 tracking-[.14em] text-white/45">Designed for the feed.<br />Built for the builders.</div>
    </div>
  );
}

export default App;