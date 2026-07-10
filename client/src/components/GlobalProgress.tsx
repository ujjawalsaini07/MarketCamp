"use client";

import { useEffect, useState } from "react";

export default function GlobalProgress() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const handleStart = () => {
      setLoading(true);
      setProgress(0);
      
      // Fast at first, then slow down (pseudo-realistic)
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const inc = prev < 50 ? Math.random() * 20 : Math.random() * 5;
          return Math.min(prev + inc, 90);
        });
      }, 300);
    };

    const handleEnd = () => {
      setProgress(100);
      clearInterval(interval);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 400); // fade out duration
    };

    window.addEventListener("apiRequestStart", handleStart);
    window.addEventListener("apiRequestEnd", handleEnd);

    return () => {
      clearInterval(interval);
      window.removeEventListener("apiRequestStart", handleStart);
      window.removeEventListener("apiRequestEnd", handleEnd);
    };
  }, []);

  if (!loading) return null;

  return (
    <>
      {/* Blurred Backdrop Mask */}
      <div className="fixed inset-0 z-[9998] backdrop-blur-[2px] bg-white/20 transition-all duration-300 pointer-events-none" />
      
      {/* Progress Bar Container */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none overflow-hidden bg-brand-light/20">
        <div
          className="h-full bg-brand-base transition-all duration-300 ease-out shadow-[0_0_10px_rgba(20,108,67,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}
