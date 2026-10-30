'use client';

import { motion, useScroll } from "framer-motion";
import { useState, useEffect } from "react";

export default function MuseumBackground({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // Toggle when user is near the bottom (95% scrolled)
      setAtBottom(latest > 0.95);
    });
  }, [scrollYProgress]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}>
      {/* Deep base — pure museum black */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* Top Spotlight — Strong center beam */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={atBottom ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          backgroundImage: `radial-gradient(1400px at 50% 0%, rgba(255,255,255,0.12), rgba(255,255,255,0.04) 35%, transparent 75%)`
        }}
      />

      {/* Volumetric Rays — Aesthetic "God Rays" */}
      <motion.div
        className="absolute inset-x-[-100%] inset-y-0"
        initial={{ opacity: 0 }}
        animate={atBottom ? {
          opacity: 1,
          rotateZ: [-1, 1, -1],
        } : { opacity: 0 }}
        transition={{
          opacity: { duration: 4, ease: "easeOut" },
          rotateZ: { duration: 15, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{
          backgroundImage: `conic-gradient(from 155deg at 50% 0%, 
            transparent 0deg, 
            rgba(255,255,255,0.0) 5deg,
            rgba(255,255,255,0.04) 12deg, 
            rgba(255,255,255,0.0) 18deg,
            rgba(255,255,255,0.06) 24deg, 
            rgba(255,255,255,0.0) 30deg,
            rgba(255,255,255,0.09) 35deg,
            rgba(255,255,255,0.0) 40deg,
            rgba(255,255,255,0.05) 45deg,
            rgba(255,255,255,0.0) 50deg,
            transparent 55deg)`,
          WebkitMaskImage: 'radial-gradient(1500px at 50% 0%, black 15%, transparent 80%)',
          maskImage: 'radial-gradient(1500px at 50% 0%, black 15%, transparent 80%)',
          transformOrigin: '50% 0%',
          filter: 'blur(15px)',
          pointerEvents: 'none',
        }}
      />

      {/* Side Light Performance - Sequential "Dance" */}
      {/* Left Light */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, x: -100 }}
        animate={atBottom ? { opacity: [0, 1, 0.5, 1, 0.7], x: 0 } : { opacity: 0, x: -100 }}
        transition={{
          duration: 4,
          delay: 1,
          times: [0, 0.3, 0.5, 0.8, 1],
          ease: "easeInOut"
        }}
        style={{
          backgroundImage: `radial-gradient(1100px at 0% 50%, rgba(255,255,255,0.08), transparent 70%)`
        }}
      />

      {/* Right Light */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, x: 100 }}
        animate={atBottom ? { opacity: [0, 1, 0.5, 1, 0.7], x: 0 } : { opacity: 0, x: 100 }}
        transition={{
          duration: 4,
          delay: 2.5,
          times: [0, 0.3, 0.5, 0.8, 1],
          ease: "easeInOut"
        }}
        style={{
          backgroundImage: `radial-gradient(1100px at 100% 50%, rgba(255,255,255,0.08), transparent 70%)`
        }}
      />

      {/* Subtle moving ambiance */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
          opacity: atBottom ? [0.4, 0.7, 0.4] : 0
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "linear",
        }}
        style={{
          backgroundImage: `radial-gradient(1600px at 50% 50%, rgba(255,255,255,0.03), transparent 90%)`,
          backgroundSize: "200% 200%"
        }}
      />

      {/* Fine grain for texture - Optimized CSS noise */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3dyZWVlZYWFhcXFxpaWl3d3d5eXl7e3t9fX1/f39fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fX11fZTMByAAAAGXRSTlMA3H7f399f399fX19fX19fX19fX19fX19fXzE8f38fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19vZmI6AAAAf0lEQVQ4y2NgYGRiZmFmYWVjZWNnY8AG2DjYOLm4ebh5ePl4+fj5BfABAYIBAkJCwkTFRMXExSVEJSWlJMUlpaSlZWVl5eXlU9NS09Iz0zIzM7OyS7NL9SsyS/UqMkr1cjJK9XIKSIqKiksKSkpKyiUlpSXlZSXVJTXVJTXVf7o/A5pQvUshAAAAAElFTkSuQmCC")`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.8) 100%)`
        }}
      />
    </div>
  );
}
