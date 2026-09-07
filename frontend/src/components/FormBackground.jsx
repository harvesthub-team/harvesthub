import { motion } from 'motion/react';
import formbg1 from '../assets/formbg1.jpg';
import formbg2 from '../assets/formbg2.jpg';
import formbg3 from '../assets/formbg3.jpg';
import formbg4 from '../assets/formbg4.jpg';
import formbg5 from '../assets/formbg5.jpg';
import formbg6 from '../assets/formbg6.jpg';
import formbg7 from '../assets/formbg7.jpg';
import formbg8 from '../assets/formbg8.jpg';
import formbg9 from '../assets/formbg9.jpg';

const FARM_IMAGES = [
  { url: formbg1 },
  { url: formbg2 },
  { url: formbg3 },
  { url: formbg4 },
  { url: formbg5 },
  { url: formbg6 },
  { url: formbg7 },
  { url: formbg8 },
  { url: formbg9 },
];
const KB_VARIANTS = [
  { initial: { scale: 1, x: 0, y: 0 }, animate: { scale: 1.1, x: -16, y: -12 } },
  { initial: { scale: 1.08, x: 8, y: 0 }, animate: { scale: 1, x: -8, y: 8 } },
  { initial: { scale: 1, x: -8, y: 8 }, animate: { scale: 1.1, x: 12, y: -8 } },
  { initial: { scale: 1.1, x: 0, y: -8 }, animate: { scale: 1, x: 8, y: 8 } },
  { initial: { scale: 1, x: 8, y: 8 }, animate: { scale: 1.08, x: -8, y: -8 } },
  { initial: { scale: 1.06, x: -12, y: 0 }, animate: { scale: 1, x: 12, y: 4 } },
  { initial: { scale: 1, x: 4, y: -8 }, animate: { scale: 1.08, x: -4, y: 8 } },
  { initial: { scale: 1.08, x: 0, y: 8 }, animate: { scale: 1, x: 0, y: -8 } },
  { initial: { scale: 1, x: -8, y: -4 }, animate: { scale: 1.1, x: 8, y: 4 } },
];
const KB_DURATIONS = [20, 24, 22, 26, 19, 23, 25, 21, 24];
function FormBackground() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ backgroundColor: '#060e08' }}
    >
      {/* Collage grid — vivid, minimal overlay per cell */}
      <div
        className="absolute inset-0"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '2px',
        }}
      >
        {FARM_IMAGES.map((img, i) => (
          <div key={i} className="relative overflow-hidden" style={{ minHeight: 0 }}>
            <motion.img
              src={img.url}
              alt=""
              className="w-full h-full object-cover"
              style={{ transformOrigin: 'center center', willChange: 'transform' }}
              initial={KB_VARIANTS[i].initial}
              animate={KB_VARIANTS[i].animate}
              transition={{
                duration: KB_DURATIONS[i],
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark vignette: strong at top (for nav) and bottom, lighter in middle so photos show */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,20,14,0.82) 0%, rgba(10,20,14,0.45) 30%, rgba(10,20,14,0.45) 70%, rgba(10,20,14,0.75) 100%)',
        }}
      />

      {/* Side vignettes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(10,20,14,0.5) 0%, transparent 20%, transparent 80%, rgba(10,20,14,0.5) 100%)',
        }}
      />

      {/* Subtle green tint overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(31,59,44,0.18)' }} />

      {/* Gold accent glow — top right */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(201,138,43,0.18) 0%, transparent 70%)' }}
      />

      {/* Green depth — bottom left */}
      <div
        className="absolute bottom-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(31,59,44,0.45) 0%, transparent 70%)' }}
      />

      {/* Grain texture for cinematic feel */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
export { FormBackground };
