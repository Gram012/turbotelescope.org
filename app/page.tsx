import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Users,
  BarChart3,
  Zap,
  Telescope,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src="/turboIconB.png" className="text-color-blue-600" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TURBO Telescope
            </span>
          </div>
          {/* <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Lorem
            </a>
            <a
              href="#about"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Ipsum
            </a>
            <a
              href="#contact"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Dolor
            </a>
          </nav> */}
          <Link href="/signin">
            <Button
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            The Home of
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Everything{" "}
            </span>
            TURBO
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            A place for everyone to learn all there is to know about the TURBO
            Telescope. A portal for team members to access all of our web
            applications. All in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signin">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              >
                Access Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What is TURBO Telescope?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The Total-Coverage Ultra-Fast Response to Binary-Mergers
              Observatory (TURBO) is a collaborative multi messenger astronomy
              initiative led by the University of Minnesota, in partnership with
              the University of New Mexico and the University of Crete. TURBO is
              designed to capture the earliest light from cataclysmic events
              within seconds of receiving alerts from gravitational wave
              detectors.
            </p>
          </div>
          {/* TODO: Make Pages for These */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                The Team
              </h3>
              <p className="text-slate-600">
                Get to know the people behind the science.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                The Data
              </h3>
              <p className="text-slate-600">
                Learn more about what makes TURBO special. See how images are
                captured, processed, and analyzied.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Telescope className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                The Science
              </h3>
              <p className="text-slate-600">
                Discover what drives our curiosity. Learn more about
                astronomical transients and how they shape our understanding of
                the visible universe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Future of Ultra-Fast Astronomy is Here
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <img src="/turboIconW.png" className="text-color-blue-600" />
                </div>
                <span className="text-xl font-bold text-white">
                  TURBO Telescope
                </span>
              </div>
              <p className="text-slate-400">
                Still curious? Check out these links.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">News</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Lorem
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Ipsum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Dolor
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Email
                  </a>
                </li>
                <li>
                  <a
                    href="https://cse.umn.edu/physics"
                    className="hover:text-white transition-colors"
                    target="_blank"
                  >
                    UofM SPA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    UNM
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Irure</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Lorem
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Ipsum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Dolor
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">...</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
