import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-brand-navy-dark to-[#080D2E] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/nav logo.jpeg"
                alt="Tractor Seva"
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              Industrial parts catalog for harvester models. Identify and order
              spare parts from detailed exploded diagrams.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-oswald text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              Catalog
            </h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link to="/catalog" className="text-sm text-white/60 transition-colors hover:text-white">
                  Browse Models
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-sm text-white/60 transition-colors hover:text-white">
                  All Sections
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-white/60 transition-colors hover:text-white">
                  How It Works
                </a>
              </li>
              
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-oswald text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              Support
            </h3>
            <ul className="mt-5 space-y-3">
              
              <li>
                <Link to="/contact" className="text-sm text-white/60 transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-sm text-white/60 transition-colors hover:text-white">
                  Parts Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-oswald text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              Contact
            </h3>
            <ul className="mt-5 space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-red/70" strokeWidth={1.5} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-red/70" strokeWidth={1.5} />
                <span>parts@tractorseva.com</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-red/70" strokeWidth={1.5} />
                <span>Industrial Area, Phase II<br />Chandigarh, India</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-red/70" strokeWidth={1.5} />
                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 md:flex-row">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Tractor Seva. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            
            <Link
              to="/catalog"
              className="flex items-center gap-1 text-xs font-medium text-white/60 transition-colors hover:text-white"
            >
              Browse Catalog
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}