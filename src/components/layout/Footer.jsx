import { Link } from 'react-router-dom';
import { Tractor, Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-navy-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                <Tractor className="h-6 w-6 text-brand-red" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-oswald text-sm font-bold uppercase tracking-wide text-white">
                  Tractor
                </span>
                <span className="font-oswald text-sm font-bold uppercase tracking-wide text-brand-red">
                  Seva
                </span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Industrial parts catalog for harvester models. Identify and order
              spare parts from detailed exploded diagrams.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-oswald text-sm font-semibold uppercase tracking-wider text-white/80">
              Catalog
            </h3>
            <ul className="mt-4 space-y-2">
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
              <li>
                <a href="#features" className="text-sm text-white/60 transition-colors hover:text-white">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-oswald text-sm font-semibold uppercase tracking-wider text-white/80">
              Support
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#support" className="text-sm text-white/60 transition-colors hover:text-white">
                  Inquiry System
                </a>
              </li>
              <li>
                <a href="#support" className="text-sm text-white/60 transition-colors hover:text-white">
                  Contact Us
                </a>
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
            <h3 className="font-oswald text-sm font-semibold uppercase tracking-wider text-white/80">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/40" strokeWidth={1.5} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/40" strokeWidth={1.5} />
                <span>parts@tractorseva.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/40" strokeWidth={1.5} />
                <span>Industrial Area, Phase II<br />Chandigarh, India</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/60">
                <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-white/40" strokeWidth={1.5} />
                <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Tractor Seva. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#support" className="text-xs text-white/40 transition-colors hover:text-white/70">Privacy Policy</a>
            <a href="#support" className="text-xs text-white/40 transition-colors hover:text-white/70">Terms of Service</a>
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
