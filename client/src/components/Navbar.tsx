"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-brand-dark tracking-tight">
            Campaign<span className="text-brand-base">IQ</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-600 hover:text-brand-dark font-medium transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-gray-600 hover:text-brand-dark font-medium transition-colors">
            How It Works
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-brand-dark font-medium transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-brand-dark font-semibold hover:text-brand-base transition-colors">
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-primary text-sm !px-5 !py-2.5"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-brand-dark text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-2xl p-6 space-y-4 animate-fade-in-up">
          <Link href="#features" className="block text-gray-600 hover:text-brand-dark font-medium">Features</Link>
          <Link href="#how-it-works" className="block text-gray-600 hover:text-brand-dark font-medium">How It Works</Link>
          <Link href="/pricing" className="block text-gray-600 hover:text-brand-dark font-medium">Pricing</Link>
          <hr className="border-gray-200" />
          <Link href="/login" className="block text-brand-dark font-semibold">Sign In</Link>
          <Link href="/register" className="btn-primary block text-center text-sm">Get Started Free</Link>
        </div>
      )}
    </nav>
  );
}
