import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

const easeOut = [0.22, 1, 0.36, 1] as const;
const easeInOut = [0.42, 0, 0.58, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.45, ease: easeOut } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } } };
const stepVariants = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: easeOut } },
  exit: { opacity: 0, y: -10, scale: 0.985, transition: { duration: 0.22, ease: easeInOut } },
};

function App() {
  const prefersReducedMotion = useReducedMotion();
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
      <motion.header initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: easeOut }} className="sticky top-0 z-50 border-b border-white/10 px-5 py-3 backdrop-blur-xl sm:px-10" style={{ background: 'rgba(0,93,55,0.6)' }}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#FFED00]/40 bg-[#FFED00]/10 text-[#FFED00] shadow-[0_0_20px_rgba(255,237,0,0.2)] backdrop-blur-md transition-transform hover:scale-110">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <div className="display text-xl font-bold tracking-tight neon-text">HH GOA</div>
              <div className="mt-1 text-[9px] uppercase tracking-[.24em] text-white/50">Frame builder / 2026</div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-[10px] uppercase tracking-[.22em] sm:flex">
            <span className="glass-pill rounded-full px-3 py-1.5 text-white/60">No login · No wait</span>
            <a href={`https://${EVENT.url}`} className="flex items-center gap-1 font-bold text-[#FFED00] transition-colors hover:text-white">{EVENT.url}<ArrowUpRight size={13} /></a>
          </div>
          <div className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[.16em] sm:hidden"><span className="h-2 w-2 animate-pulse rounded-full bg-[#FF0A8A]" /> Live</div>
        </div>
      </motion.header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-14 pt-8 sm:px-10 sm:pt-12">
        {/* Hero */}
        <motion.section variants={stagger} initial={prefersReducedMotion ? false : "hidden"} animate="visible" className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
          <div className="max-w-[760px]">
            <motion.h1 variants={fadeUp} className="display text-[18vw] font-medium uppercase leading-[.78] tracking-[-.045em] sm:text-[120px] lg:text-[148px]" style={{ textShadow: '0 6px 0 rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.3)' }}>Frame<br /><span className="shimmer-text">your</span><br />moment.</motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-[520px] text-sm leading-7 text-white/65 sm:text-base">Turn one photo into a piece of HH Goa 2026. Pick your format, make it yours, and leave with something worth posting.</motion.p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><Camera size={14} className="text-[#FFED00]" /> Auto color-grade</div>
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><WandSparkles size={14} className="text-[#FF0A8A]" /> AI-styled frames</div>
              <div className="glass-pill flex items-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[.16em] text-white/70"><Share2 size={14} className="text-[#FFED00]" /> One-click share</div>
            </div>
          </div>
          <motion.div variants={fadeUp} className="hidden justify-end lg:flex"><HeroVisual /></motion.div>
        </motion.section>

        {/* Marquee */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: easeOut }} className="my-10 overflow-hidden border-y border-white/10 py-3 text-[10px] uppercase tracking-[.28em] text-white/45 sm:my-14">
          <div className="marquee-track flex min-w-max gap-10"><span>{HASHTAG}</span><span>·</span><span>Made for builders</span><span>·</span><span>Ready for X</span><span>·</span><span>HH Goa 2026</span><span>·</span><span>{HASHTAG}</span><span>·</span><span>Made for builders</span><span>·</span><span>Ready for X</span><span>·</span><span>HH Goa 2026</span><span>·</span></div>
        </motion.div>

        {/* Builder section */}
        <motion.section variants={stagger} initial={prefersReducedMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.08 }} className="grid gap-8 lg:grid-cols-[.74fr_1.26fr] lg:gap-14">
          <div className="space-y-7">
            <motion.div variants={fadeUp} className="flex items-center gap-3 text-[10px] uppercase tracking-[.2em] text-white/50"><StepMarker number={stepIndex} /><span>Build your graphic</span></motion.div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} variants={stepVariants} initial="initial" animate="animate" exit="exit">
            {step === 'upload' && <UploadPanel format={format} setFormat={setFormat} inputRef={inputRef} dragActive={dragActive} setDragActive={setDragActive} onDrop={onDrop} onFile={handleFile} error={error} />}
            {step === 'crop' && <CropPanel previewUrl={previewUrl} zoom={cropZoom} setZoom={setCropZoom} offset={cropOffset} setOffset={setCropOffset} onBack={reset} onConfirm={confirmCrop} />}
            {step === 'details' && <DetailsPanel previewUrl={previewUrl} name={name} setName={setName} stack={stack} setStack={setStack} predictedTitle={predictedTitle} generating={generating} onBack={() => setStep('crop')} onGenerate={() => file && handleGenerate(file, 'card', { name, stack })} />}
            {step === 'result' && result && <ResultPanel result={result} onDownload={download} onShare={share} onReset={reset} shareToast={shareToast} />}
              </motion.div>
            </AnimatePresence>
            {generating && step === 'upload' && (
              <div className="glass-strong flex items-center gap-3 rounded-2xl p-4 text-xs uppercase tracking-[.15em] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <Loader2 size={18} className="animate-spin text-[#FFED00]" /> Composing your frame...
              </div>
            )}
          </div>
          <aside className="hidden lg:block"><Manifest /></aside>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }} className="relative z-10 border-t border-white/10 px-5 py-5 backdrop-blur-md sm:px-10" style={{ background: 'rgba(0,93,55,0.4)' }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 text-[10px] uppercase tracking-[.2em] text-white/40">
          <span className="flex items-center gap-2"><Sparkles size={12} className="text-[#FFED00]/50" /> HH Goa 2026</span>
          <span>{EVENT.dateLine}</span>
          <span className="text-[#FF0A8A]/70">{HASHTAG}</span>
        </div>
      </motion.footer>
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

/* ── Hero visual: animated Goa scene ── */
function HeroVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative flex min-h-[430px] w-full items-center justify-center overflow-hidden rounded-[2rem]"
      style={{ perspective: '1000px' }}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, y: 20 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: [0, -6, 0] }}
      transition={{ opacity: { duration: 0.75, ease: easeOut }, scale: { duration: 0.75, ease: easeOut }, y: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
    >
      {/* Tropical atmosphere */}
      <motion.div
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-[#FFED00]/20 blur-3xl"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -top-4 left-8 h-28 w-52 rounded-full bg-white/10 blur-3xl"
        animate={prefersReducedMotion ? undefined : { x: [-20, 30, -20] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Scene */}
      <div className="relative h-[390px] w-[560px] max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#004b2d]/50 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-sm">
        {/* Sunset */}
        <motion.div
          className="absolute right-[17%] top-[12%] h-24 w-24 rounded-full bg-[#FFED00] shadow-[0_0_70px_rgba(255,237,0,0.45)]"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.045, 1], opacity: [0.82, 1, 0.82] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Moving clouds */}
        <motion.div
          className="absolute left-[9%] top-[16%] h-8 w-28 rounded-full bg-white/10 blur-sm"
          animate={prefersReducedMotion ? undefined : { x: [-15, 35, -15] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[35%] top-[24%] h-5 w-20 rounded-full bg-white/10 blur-sm"
          animate={prefersReducedMotion ? undefined : { x: [25, -25, 25] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ocean */}
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-[#003e28]/80" />
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-[-10%] h-10 w-[120%] rounded-[50%] border-t-2 border-white/25"
            style={{ bottom: `${29 + i * 10}%` }}
            animate={prefersReducedMotion ? undefined : { x: ['0%', '-5%', '0%'] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          />
        ))}

        {/* Distant coastline */}
        <div className="absolute bottom-[39%] left-0 h-12 w-full bg-[#173d25] [clip-path:polygon(0_70%,12%_45%,25%_65%,38%_25%,52%_58%,66%_38%,80%_65%,91%_30%,100%_52%,100%_100%,0_100%)]" />

        {/* Palm tree 1 */}
        <motion.div
          className="absolute bottom-[28%] left-[8%] origin-bottom"
          animate={prefersReducedMotion ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="ml-7 h-32 w-2 rotate-[-7deg] rounded-full bg-[#102f20]" />
          <div className="absolute -left-2 top-0 h-5 w-20 rounded-full bg-[#102f20] [clip-path:polygon(50%_50%,0_0,8%_35%,0_100%,50%_62%,100%_100%,92%_35%,100%_0)]" />
        </motion.div>

        {/* Palm tree 2 */}
        <motion.div
          className="absolute bottom-[31%] right-[4%] origin-bottom"
          animate={prefersReducedMotion ? undefined : { rotate: [1.1, -1.1, 1.1] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <div className="ml-7 h-40 w-2 rotate-[8deg] rounded-full bg-[#102f20]" />
          <div className="absolute -left-3 top-0 h-5 w-24 rounded-full bg-[#102f20] [clip-path:polygon(50%_50%,0_0,8%_35%,0_100%,50%_62%,100%_100%,92%_35%,100%_0)]" />
        </motion.div>

        {/* Foreground tropical leaves */}
        <motion.div
          className="absolute -bottom-8 -left-4 h-36 w-48 rounded-full bg-[#005C37]/90 blur-[1px] [clip-path:polygon(0_100%,8%_55%,22%_72%,25%_18%,38%_64%,53%_8%,55%_67%,74%_24%,68%_78%,100%_42%,82%_100%)]"
          animate={prefersReducedMotion ? undefined : { rotate: [-1, 1, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Goa badge */}
        <motion.div
          className="absolute left-6 top-6 z-10 rounded-2xl border border-[#FFED00]/30 bg-[#005C37]/65 px-4 py-3 shadow-[0_12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-[9px] font-bold uppercase tracking-[.28em] text-[#FF0A8A]">HH GOA</div>
          <div className="mt-1 text-sm font-bold uppercase tracking-[.12em] text-[#FFED00]">28—31 OCT 2026</div>
          <div className="mt-1 text-[8px] uppercase tracking-[.2em] text-white/45">GOA · INDIA</div>
        </motion.div>

        {/* Decorative event pin */}
        <motion.div
          className="absolute right-7 top-7 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#FF0A8A]/40 bg-[#FF0A8A]/15 text-[#FFED00] backdrop-blur-md"
          animate={prefersReducedMotion ? undefined : { rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <Sparkles size={17} />
        </motion.div>

        {/* Foreground label */}
        <div className="absolute bottom-5 left-6 z-10">
          <div className="text-[9px] uppercase tracking-[.3em] text-white/40">Tropical builder mode</div>
          <div className="mt-1 display text-3xl uppercase leading-none text-[#FFED00]">GOA</div>
        </div>

        {/* Tiny particles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#FF0A8A]"
            style={{ left: `${18 + i * 15}%`, top: `${25 + (i % 3) * 18}%` }}
            animate={prefersReducedMotion ? undefined : { y: [0, -10, 0], opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 2.8 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Crop panel ── */
function CropPanel({ previewUrl, zoom, setZoom, offset, setOffset, onBack, onConfirm }: { previewUrl: string; zoom: number; setZoom: (z: number) => void; offset: { x: number; y: number }; setOffset: (o: { x: number; y: number }) => void; onBack: () => void; onConfirm: () => void }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-5">
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
            <motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }} key={i} onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="glass-pill grid h-10 place-items-center rounded-lg hover:border-[#FF0A8A]/60"><RotateCcw size={14} className="text-[#FF0A8A]" /></motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }} key={i} onClick={() => setOffset({ x: offset.x + btn.dx, y: offset.y + btn.dy })} className="glass-pill grid h-10 place-items-center rounded-lg hover:border-[#FFED00]/40"><Move size={14} className={btn.rot} /></motion.button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[9px] uppercase tracking-[.18em] text-white/45">Presets:</span>
        {[1, 1.5, 2, 3].map((z) => (
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }} key={z} onClick={() => setZoom(z)} className={`rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${zoom === z ? 'bg-[#FFED00] text-[#005C37]' : 'glass-pill text-white/55'}`}>{z}x</motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onBack} className="glass-pill rounded-xl px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/70 hover:text-white">Back</motion.button>
        <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={onConfirm} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow"><Check size={16} /> Looks good <ArrowUpRight size={15} /></motion.button>
      </div>
      <p className="text-[10px] uppercase leading-5 tracking-[.14em] text-white/35">Center your face using the grid. The crop matches your ID card's proportions exactly.</p>
    </motion.div>
  );
}

/* ── Step marker ── */
function StepMarker({ number }: { number: number }) {
  return <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#FFED00] font-bold text-[#005C37] shadow-[0_3px_0_rgba(0,0,0,0.3),0_0_16px_rgba(255,237,0,0.3)]">0{number}</span>;
}

/* ── Upload panel ── */
function UploadPanel({ format, setFormat, inputRef, dragActive, setDragActive, onDrop, onFile, error }: { format: Format; setFormat: (format: Format) => void; inputRef: React.RefObject<HTMLInputElement | null>; dragActive: boolean; setDragActive: (active: boolean) => void; onDrop: (event: React.DragEvent<HTMLDivElement>) => void; onFile: (file: File) => void; error: string }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-5">
      <div className="glass grid grid-cols-2 gap-2 rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <FormatButton active={format === 'pfp'} onClick={() => setFormat('pfp')} icon={<UserRound size={17} />} title="PFP frame" copy="Square / profile" />
        <FormatButton active={format === 'card'} onClick={() => setFormat('card')} icon={<Badge size={17} />} title="Builder ID" copy="Portrait / post" />
      </div>

      <motion.div
        whileHover={{ y: -2, scale: 1.008 }}
        whileTap={{ scale: 0.995 }}
        animate={dragActive ? { scale: 1.012 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
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
          <motion.div whileHover={{ scale: 1.06, rotate: 2 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="upload-ring mb-6 grid h-20 w-20 place-items-center rounded-full border border-[#FFED00]/40 bg-[#FFED00]/10 text-[#FFED00] shadow-[0_10px_40px_rgba(255,237,0,0.2),inset_0_2px_8px_rgba(255,255,255,0.1)] backdrop-blur-md transition-transform group-hover:scale-110">
            <ImagePlus size={30} strokeWidth={2.5} />
          </motion.div>
          <div className="display text-4xl uppercase leading-none sm:text-5xl neon-text">Drop your<br />best shot.</div>
          <p className="mt-4 text-[10px] uppercase tracking-[.18em] text-white/45">JPG · PNG · HEIC / tap to browse</p>
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#FF0A8A]">Start creating <ChevronRight size={14} /></div>
        </div>
      </motion.div>

      {error && <div className="glass-strong flex items-center gap-2 rounded-xl border border-[#FF0A8A]/40 p-3 text-xs text-[#FFED00] shadow-[0_4px_15px_rgba(255,10,138,0.2)]"><AlertCircle size={16} className="text-[#FF0A8A]" />{error}</div>}
      <p className="text-[10px] uppercase leading-5 tracking-[.14em] text-white/35">Your photo gets color-graded, vignetted, and grain-textured automatically — no editing skills needed.</p>
    </motion.div>
  );
}

function FormatButton({ active, onClick, icon, title, copy }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} onClick={onClick} className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all ${active ? 'bg-[#FFED00] text-[#005C37] shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]' : 'text-white/55 hover:bg-white/5'}`}>
      <span>{icon}</span>
      <span><span className="block text-xs font-bold uppercase tracking-[.08em]">{title}</span><span className="mt-1 block text-[9px] uppercase tracking-[.12em] opacity-65">{copy}</span></span>
    </motion.button>
  );
}

/* ── Details panel ── */
function DetailsPanel({ previewUrl, name, setName, stack, setStack, predictedTitle, generating, onBack, onGenerate }: { previewUrl: string; name: string; setName: (value: string) => void; stack: string; setStack: (value: string) => void; predictedTitle: string; generating: boolean; onBack: () => void; onGenerate: () => void }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} className="glass-strong flex items-center gap-5 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-[#FFED00]/40 bg-[#FFED00]/5 shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_2px_6px_rgba(0,0,0,0.2)]">
          {previewUrl && <img src={previewUrl} alt="Your upload" className="h-full w-full object-cover" style={{ filter: 'contrast(1.1) saturate(1.15) brightness(1.03)' }} />}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[.2em] text-white/45">Step 03 / Identity</div>
          <div className="display mt-2 text-3xl uppercase leading-none neon-text">Make it yours.</div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        <Field label="Your name" value={name} onChange={setName} placeholder="Alex Rivera" icon={<UserRound size={16} />} />
        <Field label="Stack / role" value={stack} onChange={setStack} placeholder="Frontend · AI · Design" icon={<Code2 size={16} />} />
      </motion.div>

      <div className="glass-strong rounded-2xl border-l-4 border-[#FF0A8A] p-4 shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
        <div className="text-[9px] uppercase tracking-[.2em] text-white/45">Generated builder title</div>
        <div className="mt-2 text-sm font-bold text-[#FFED00]">{predictedTitle}</div>
      </div>

      <div className="flex gap-2">
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onBack} className="glass-pill rounded-xl px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-white/70 hover:text-white">Back</motion.button>
        <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={onGenerate} disabled={!name.trim() || generating} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0">
          {generating ? <Loader2 size={16} className="animate-spin" /> : <WandSparkles size={16} />} Generate badge <ArrowUpRight size={15} />
        </motion.button>
      </div>
    </motion.div>
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
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
      <motion.div variants={fadeUp} className="glass flex items-center justify-between rounded-2xl border-b border-white/10 p-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-[#FF0A8A]"><Check size={15} /> Graphic ready</div>
          <div className="display mt-2 text-3xl uppercase leading-none neon-text sm:text-4xl">Looks good.<br />Now make noise.</div>
        </div>
        <motion.button whileHover={{ rotate: -8, scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={onReset} className="glass-pill rounded-xl p-3 text-white/60 hover:text-white" aria-label="Start over"><RefreshCcw size={17} /></motion.button>
      </motion.div>

      <motion.div variants={fadeUp} className="relative" style={{ perspective: '1000px' }}>
        <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="glass-card tilt-card relative overflow-hidden rounded-2xl p-2 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <img src={result.dataUrl} alt="Generated HH Goa graphic" className="mx-auto max-h-[580px] w-auto max-w-full rounded-lg" style={{ transform: 'translateZ(20px)' }} />
          <div className="absolute left-4 top-4 rounded-lg bg-[#FF0A8A] px-2 py-1 text-[9px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(255,10,138,0.4)]" style={{ transform: 'translateZ(40px)' }}>Final PNG</div>
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent" style={{ transform: 'translateZ(30px)' }} />
        </div>
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-2 gap-2">
        <motion.button variants={fadeUp} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={onDownload} className="glass-pill flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#FFED00] shadow-[0_5px_0_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3)]"><ArrowDownToLine size={16} /> Download</motion.button>
        <motion.button variants={fadeUp} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={onShare} className="flex items-center justify-center gap-2 rounded-xl bg-[#FFED00] px-4 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#005C37] shadow-[0_5px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] neon-glow-yellow"><X size={17} /> Share to X</motion.button>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-strong rounded-xl p-4">
        <div className="mb-2 flex items-center gap-2 text-[9px] uppercase tracking-[.18em] text-white/45"><Share2 size={13} /> Tweet copy ready</div>
        <p className="whitespace-pre-line text-xs leading-6 text-[#FFED00]/85">{result.caption}</p>
      </motion.div>

      {shareToast && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-strong fade-in flex items-center gap-2 rounded-xl border border-[#FF0A8A]/40 p-3 text-[10px] font-bold uppercase tracking-[.15em] text-[#FF0A8A] shadow-[0_8px_25px_rgba(255,10,138,0.4)]"><Check size={15} /> X opened in a new tab</motion.div>}
    </motion.div>
  );
}

/* ── Manifest sidebar ── */
function Manifest() {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger} className="sticky top-24 space-y-8">
      <motion.div variants={fadeUp} className="glass-card relative overflow-hidden rounded-2xl p-6">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-15" />
        <div className="relative">
          <div className="mb-4 text-[10px] uppercase tracking-[.24em] text-white/45">The brief</div>
          <div className="display text-5xl uppercase leading-[.82] neon-text">One photo.<br /><span className="shimmer-text">Two ways</span><br />to show up.</div>
        </div>
      </motion.div>

      <motion.div variants={stagger} className="space-y-4">
        {[
          { n: '01', t: 'Upload any photo — portrait, landscape, off-center. We auto-crop and color-grade it.' },
          { n: '02', t: 'Wrap it in the official HH Goa PFP frame or build a shareable identity card.' },
          { n: '03', t: 'Download a real PNG or post straight to X with a pre-written caption.' },
        ].map((s) => (
          <motion.div key={s.n} variants={fadeUp} whileHover={{ x: 4 }} className="glass-pill flex gap-4 rounded-xl p-4 text-xs leading-6 text-white/60">
            <span className="text-[#FF0A8A] font-bold">{s.n}</span>
            <span>{s.t}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="glass-strong rounded-2xl p-4 text-[10px] uppercase leading-5 tracking-[.14em] text-white/45">Designed for the feed.<br />Built for the builders.</motion.div>
    </motion.div>
  );
}

export default App;