'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { RouteCanvas } from '@/components/landing/RouteCanvas';
import { TripCreatorWidget } from '@/components/landing/TripCreatorWidget';
import { RealLifeDriftDemo } from '@/components/landing/RealLifeDriftDemo';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-canvas-50 overflow-hidden flex flex-col justify-between">
      {/* Background Animated Travel Routes */}
      <RouteCanvas />

      {/* Top Navigation */}
      <header className="relative z-20 max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-warm">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
              YourTrip
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta-600 block mt-0.5">
              Personal Trip OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Guest Mode Ready
          </span>
          <Link href="#create-trip">
            <Button size="sm" variant="outline">
              Plan Trip Now
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-16 flex flex-col items-center text-center">
        {/* Core Value Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas-100 border border-canvas-300 text-xs font-semibold text-slate-700 shadow-2xs mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>The Digital Operating System Before, During & After Travel</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-3xl"
        >
          AI should assist you,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-600 via-amber-600 to-terracotta-500">
            not make your decisions.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl leading-relaxed"
        >
          Stop juggling fragmented apps. Meet your personal trip operating system that adapts
          when real life changes—with zero silent overrides.
        </motion.p>

        {/* Quick CTA Bridge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="#drift-demo">
            <Button size="md" variant="secondary" className="rounded-2xl gap-2 font-bold shadow-2xs">
              <Activity className="w-4 h-4 text-terracotta-500" />
              <span>See Drift Engine in Action</span>
            </Button>
          </Link>
          <Link href="#create-trip">
            <Button size="md" variant="primary" className="rounded-2xl gap-2 font-bold shadow-warm">
              <span>Create Trip Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Interactive Real-Life Drift Engine Demonstration */}
        <div id="drift-demo" className="w-full mt-10">
          <RealLifeDriftDemo />
        </div>

        {/* Strengthened Principle: AI ASSISTS, YOU DECIDE */}
        <div className="w-full mt-14 bg-white/90 backdrop-blur-md rounded-4xl border border-canvas-200 p-6 sm:p-8 shadow-warm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-canvas-200">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-terracotta-600 block">
                Product Core Philosophy
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                AI Assists. You Decide. Always.
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto border border-canvas-300">
              Not an Autonomous Black Box
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {/* 1. Recommends */}
            <div className="p-4 rounded-2xl bg-canvas-50 border border-canvas-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold text-xs mb-3">
                  01
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">AI Recommends</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Synthesizes geographic proximity, open hours, and historical travel buffers to draft realistic schedules.
                </p>
              </div>
            </div>

            {/* 2. Explains */}
            <div className="p-4 rounded-2xl bg-canvas-50 border border-canvas-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mb-3">
                  02
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">AI Explains</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every suggestion includes transparent reasoning—why an activity is timed for sunset or early morning crowd avoidance.
                </p>
              </div>
            </div>

            {/* 3. Compares */}
            <div className="p-4 rounded-2xl bg-canvas-50 border border-canvas-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs mb-3">
                  03
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">AI Compares</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Surfaces real trade-offs: faster transit vs scenic routes, high-tempo sightseeing vs relaxed dining pacing.
                </p>
              </div>
            </div>

            {/* 4. Predicts Consequences */}
            <div className="p-4 rounded-2xl bg-canvas-50 border border-canvas-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs mb-3">
                  04
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">AI Predicts Consequences</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When you linger 45 minutes late, the engine warns you before tickets expire, tables cancel, or sunset passes.
                </p>
              </div>
            </div>

            {/* 5. User Chooses */}
            <div className="p-4 rounded-2xl bg-canvas-50 border border-canvas-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs mb-3">
                  05
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">User Chooses</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The system never silently modifies your bookings or drops activities. You select your preferred resolution.
                </p>
              </div>
            </div>

            {/* 6. User Overrides Everything */}
            <div className="p-4 rounded-2xl bg-canvas-50 border border-canvas-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-3">
                  06
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">User Overrides Everything</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Reorder, delete, drag, adjust durations, or enter custom stops anytime. You remain the sole authority on your journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Frictionless Trip Creator Section */}
        <div id="create-trip" className="w-full mt-16 scroll-mt-24">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-extrabold tracking-wider text-terracotta-600 block">
              Start Your Journey
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Create Your Trip Workspace
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
              Just 4 essential inputs to get started. No 20-step questionnaires. Personalize deeper inside your workspace.
            </p>
          </div>
          <TripCreatorWidget />
        </div>

        {/* 3 Pillars: Before, During, After */}
        <div className="w-full mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* 1. Before */}
          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-3xl border border-canvas-200 shadow-warm hover:shadow-elevated transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center font-bold text-sm mb-4 border border-terracotta-200">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Before the Trip</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Progressive itinerary drafting, transit cost comparator, smart wardrobe packing assistant, and realistic budget allocation without answering 20 forms.
            </p>
          </div>

          {/* 2. During */}
          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-3xl border border-canvas-200 shadow-warm hover:shadow-elevated transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-4 border border-amber-200">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">During the Trip</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When reality happens (oversleeping, rain, traffic delays), the cascade engine shows clear consequences and gives you options. The system never silently overwrites.
            </p>
          </div>

          {/* 3. After */}
          <div className="bg-white/80 backdrop-blur-xs p-6 rounded-3xl border border-canvas-200 shadow-warm hover:shadow-elevated transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center font-bold text-sm mb-4 border border-forest-100">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">After the Trip</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review planned vs. actual execution, finalize group Splitwise settlements, access organized memories, and export clean, printable tabular PDFs.
            </p>
          </div>
        </div>

        {/* Data Provenance & Trust Banner */}
        <div className="w-full mt-12 bg-canvas-100 border border-canvas-200 rounded-3xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Honest & Transparent Data Provenance</span>
          </div>
          <p className="text-xs text-slate-600 max-w-xl mx-auto mb-4">
            We never fabricate live data or pretend estimates are exact. Every recommendation and metric is explicitly labeled:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <ProvenanceBadge provenance="LIVE" />
            <ProvenanceBadge provenance="ESTIMATED" />
            <ProvenanceBadge provenance="AI_RECOMMENDED" />
            <ProvenanceBadge provenance="USER_ENTERED" />
            <ProvenanceBadge provenance="UNAVAILABLE" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-canvas-200 bg-white/60 py-6 px-6 text-center text-xs text-slate-500">
        <p>
          YourTrip • The Personal Trip Operating System. Built with Next.js, Framer Motion & Zustand Local-First.
        </p>
      </footer>
    </div>
  );
}
