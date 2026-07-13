import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, ArrowRight, Boxes, Crosshair, Eye,
  MousePointerClick, ListChecks, Send, Tractor, Phone, Mail,
  MapPin, Clock,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useCountUp, useInView } from '../../hooks/useCountUp';

const TICKER_ITEMS = [
  'CUTTER HEAD', '220.1.0.1 RIGHT COVER', 'ENGINE', 'GB/T96 WASHER',
  'TRANSMISSION', 'A120 GEAR ASSEMBLY', 'CONVEYOR', 'HST-220 HYDRAULIC PUMP',
  'HYDRAULIC SYSTEM', 'K7811-94190 FILTER ELEMENT', 'SPARE PARTS', 'ELECTRICAL',
  'BRAKES', 'COOLING SYSTEM', 'CHASSIS', 'AUGER', 'CABIN',
];

export default function HomePage() {
  const [statsRef, statsInView] = useInView();

  return (
    <div className="min-h-screen flex flex-col bg-bg-light">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-bg-light pt-12 pb-0 md:pt-16 md:pb-0">
          <div className="absolute inset-0 blueprint-grid opacity-40" />
          
          <div className="relative mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-navy/20 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-navy"
            >
              <Crosshair className="h-3.5 w-3.5 text-brand-red" />
              Industrial Parts Catalog
            </motion.span>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-5 font-oswald font-bold leading-[1.1] text-[28px] md:text-[42px] lg:text-[52px]"
            >
              <span className="text-text-black">Every Part.</span>
              <br />
              <span className="text-brand-navy">Perfectly Identified.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mx-auto mt-4 max-w-[540px] text-[14px] leading-[1.6] text-text-gray md:text-[15px]"
            >
              Select your harvester model and visually identify any spare part
              from detailed exploded diagrams.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-7 flex flex-wrap justify-center gap-3 md:gap-4"
            >
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#1B2870] to-[#172263] px-5 py-2.5 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:shadow-none md:px-6 md:py-3 md:text-base"
              >
                Browse Catalog
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <button
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-brand-navy/24 bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy transition-all duration-150 hover:border-brand-navy/40 hover:bg-brand-navy/[0.03] md:px-6 md:py-3 md:text-base"
              >
                <Eye className="h-4 w-4 md:h-5 md:w-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              ref={statsRef}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-8"
            >
              <StatCounter target={6} label="Models" inView={statsInView} />
              <span className="text-brand-navy/20">·</span>
              <StatCounter target={30} label="Sections" inView={statsInView} />
              <span className="text-brand-navy/20">·</span>
              <StatCounter target={180} suffix="+" label="Parts" inView={statsInView} />
            </motion.div>

            {/* Tractor Illustration */}
            <div className="relative mx-auto max-w-7xl hidden md:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex justify-end px-4"
              >
                <svg viewBox="0 0 600 200" className="h-auto w-[280px] md:w-[340px] lg:w-[380px] opacity-90" fill="none">
                  <g stroke="#172263" strokeWidth="1.5" opacity="0.4">
                    <path d="M80 140 L80 100 L120 80 L200 80 L240 60 L340 60 L340 100 L380 100 L380 140" />
                    <path d="M120 80 L120 140" />
                    <path d="M200 80 L200 140" />
                    <path d="M240 60 L240 140" />
                    <circle cx="140" cy="150" r="35" />
                    <circle cx="140" cy="150" r="20" />
                    <circle cx="320" cy="150" r="45" />
                    <circle cx="320" cy="150" r="28" />
                    <line x1="260" y1="80" x2="260" y2="140" />
                    <line x1="280" y1="80" x2="280" y2="140" />
                    <line x1="300" y1="80" x2="300" y2="140" />
                    <line x1="220" y1="60" x2="220" y2="30" />
                    <line x1="218" y1="30" x2="225" y2="30" />
                  </g>
                  <circle cx="140" cy="150" r="10" fill="#172263" />
                  <text x="137" y="154" fill="white" fontSize="9" fontWeight="bold">1</text>
                  <circle cx="280" cy="100" r="10" fill="#172263" />
                  <text x="277" y="104" fill="white" fontSize="9" fontWeight="bold">2</text>
                  <circle cx="320" cy="150" r="10" fill="#172263" />
                  <text x="317" y="154" fill="white" fontSize="9" fontWeight="bold">3</text>
                </svg>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Ticker Section */}
        <section className="w-full bg-brand-navy-dark py-4 md:py-5 overflow-hidden border-t border-brand-navy-light/20">
          <div className="flex animate-marquee whitespace-nowrap min-w-full">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="mx-4 md:mx-5 flex items-center gap-2 md:gap-3 text-xs md:text-sm font-medium uppercase tracking-wider text-white/70">
                {item}
                <span className="text-brand-red">·</span>
              </span>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full bg-bg-light py-14 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-navy/50">
              How It Works
            </p>
            <h2 className="mt-2 text-center font-oswald text-2xl font-bold text-text-black md:mt-3 md:text-3xl">
              Find your part in three simple steps
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
              <StepCard
                step="01"
                icon={Boxes}
                title="Select Your Model"
                description="Choose your harvester model from our catalog of supported machines."
              />
              <StepCard
                step="02"
                icon={MousePointerClick}
                title="Browse Diagrams"
                description="Navigate through exploded-view diagrams with clickable hotspots on each part."
              />
              <StepCard
                step="03"
                icon={ListChecks}
                title="Get Part Details"
                description="View part numbers, descriptions, and cross-references, then add to your inquiry list."
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-white py-14 md:py-20 border-y border-border-subtle">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-navy/50">
              Built for Technicians
            </p>
            <h2 className="mt-2 font-oswald text-2xl font-bold text-text-black md:mt-3 md:text-3xl">
              Everything you need to identify a part on the field
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              <FeatureCard
                icon={Search}
                title="Visual Part ID"
                description="Browse visual diagrams of harvester sections with clickable hotspots that show part details instantly."
              />
              <FeatureCard
                icon={Boxes}
                title="Multi-Model Support"
                description="Access parts catalogs for multiple harvester models, each with detailed exploded-view diagrams."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Complete Data"
                description="Part numbers, serial numbers, descriptions, quantities, and Kubota cross-references for every component."
              />
            </div>
          </div>
        </section>

        {/* Supported Models Section */}
        <section className="w-full bg-bg-light py-14 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-navy/50">
              Supported Models
            </p>
            <h2 className="mt-2 font-oswald text-2xl font-bold text-text-black md:mt-3 md:text-3xl">
              Harvester models in our catalog
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {['FM-220', 'FM-120', 'FM-180', 'FM-260', 'FM-320', 'FM-450'].map((model) => (
                <div
                  key={model}
                  className="flex flex-col items-center justify-center rounded-lg border border-border-subtle bg-white p-5 md:p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
                >
                  <Tractor className="h-8 w-8 text-brand-navy/40" strokeWidth={1} />
                  <p className="mt-2 font-mono-code text-sm font-medium text-brand-navy">{model}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry CTA Section */}
        <section id="support" className="w-full bg-white py-14 md:py-20 border-t border-border-subtle">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
              <div className="flex flex-col justify-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-navy/50">
                  Inquiry System
                </p>
                <h2 className="mt-2 font-oswald text-2xl font-bold text-text-black md:mt-3 md:text-3xl">
                  Build your inquiry list and send it to us
                </h2>
                <p className="mt-4 max-w-md text-[14px] leading-relaxed text-text-gray md:text-[15px]">
                  Found the parts you need? Add them to your inquiry list and send
                  it directly to our team. We'll get back to you with pricing and
                  availability.
                </p>
                <Link
                  to="/catalog"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-b from-[#1B2870] to-[#172263] px-5 py-2.5 text-sm font-semibold text-white shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:shadow-none md:px-6 md:py-3 md:text-base"
                >
                  Start Browsing
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-bg-inset p-5 md:p-6 shadow-card">
                  <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-navy text-white flex-shrink-0">
                      <Send className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-oswald text-lg font-semibold text-brand-navy">Inquiry List</p>
                      <p className="text-xs text-text-gray">Add parts and send</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
                      <span className="font-mono-code text-brand-navy font-medium">220.1.0.1</span>
                      <span className="text-text-gray">Right Cover</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
                      <span className="font-mono-code text-brand-navy font-medium">GB/T96</span>
                      <span className="text-text-gray">Washer</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm">
                      <span className="font-mono-code text-brand-navy font-medium">K7811-94190</span>
                      <span className="text-text-gray">Filter</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark">
                    Send Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full bg-brand-navy-dark py-14 md:py-20 text-white">
          <div className="mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <h2 className="font-oswald text-2xl font-bold md:text-3xl">
              Ready to find your parts?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 md:text-base">
              Browse our full catalog of harvester models and their detailed parts
              diagrams.
            </p>
            <Link
              to="/catalog"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy shadow-button transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover md:px-6 md:py-3 md:text-base"
            >
              View Catalog
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatCounter({ target, label, suffix = '', inView }) {
  const count = useCountUp(target, 2000, inView);
  return (
    <div className="text-center">
      <span className="font-oswald text-2xl font-bold tabular-nums text-brand-navy md:text-3xl lg:text-4xl">
        {count}{suffix}
      </span>
      <span className="ml-1.5 text-xs uppercase tracking-wider text-text-gray md:text-sm">{label}</span>
    </div>
  );
}

function StepCard({ step, icon: Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-lg border border-border-subtle bg-white p-5 md:p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <span className="absolute right-4 top-4 font-mono-code text-2xl font-bold text-brand-navy/10">{step}</span>
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-brand-navy/20 bg-white">
        <Icon className="h-5 w-5 text-brand-navy" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 font-oswald text-lg md:text-xl font-semibold text-text-black">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-gray">
        {description}
      </p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border-subtle bg-white p-5 md:p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-brand-navy/20 bg-white">
        <Icon className="h-5 w-5 text-brand-navy" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 font-oswald text-lg md:text-xl font-semibold text-text-black">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-gray">
        {description}
      </p>
    </motion.div>
  );
}

function TractorIllustration() {
  return (
    <svg viewBox="0 0 600 200" className="h-auto w-[500px] opacity-90" fill="none">
      <g stroke="#172263" strokeWidth="1.5" opacity="0.4">
        {/* Tractor outline */}
        <path d="M80 140 L80 100 L120 80 L200 80 L240 60 L340 60 L340 100 L380 100 L380 140" />
        <path d="M120 80 L120 140" />
        <path d="M200 80 L200 140" />
        <path d="M240 60 L240 140" />
        {/* Wheels */}
        <circle cx="140" cy="150" r="35" />
        <circle cx="140" cy="150" r="20" />
        <circle cx="320" cy="150" r="45" />
        <circle cx="320" cy="150" r="28" />
        {/* Engine details */}
        <line x1="260" y1="80" x2="260" y2="140" />
        <line x1="280" y1="80" x2="280" y2="140" />
        <line x1="300" y1="80" x2="300" y2="140" />
        {/* Exhaust */}
        <line x1="220" y1="60" x2="220" y2="30" />
        <line x1="218" y1="30" x2="225" y2="30" />
      </g>
      {/* Hotspot circles */}
      <circle cx="140" cy="150" r="10" fill="#172263" />
      <text x="137" y="154" fill="white" fontSize="9" fontWeight="bold">1</text>
      <circle cx="280" cy="100" r="10" fill="#172263" />
      <text x="277" y="104" fill="white" fontSize="9" fontWeight="bold">2</text>
      <circle cx="320" cy="150" r="10" fill="#172263" />
      <text x="317" y="154" fill="white" fontSize="9" fontWeight="bold">3</text>
    </svg>
  );
}