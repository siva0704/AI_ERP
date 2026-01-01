import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-teal-500/30">
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600" />
            AI ERP
          </div>
          <nav className="hidden gap-8 text-sm font-medium text-zinc-400 md:flex">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32">
        <section className="container mx-auto px-6 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
              Intelligent Management <br />
              <span className="bg-gradient-to-r from-teal-400 to-blue-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-400 sm:text-xl">
              Streamline your educational institution with our advanced ERP system. 
              Automate attendance, exams, and analytics with the power of artificial intelligence.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="group flex h-12 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-black transition-all hover:bg-zinc-200"
              >
                Launch Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/demo"
                className="flex h-12 items-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto mt-32 grid gap-8 px-6 sm:grid-cols-3">
          <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-teal-500/50 hover:bg-teal-500/5">
            <div className="mb-4 inline-flex rounded-xl bg-teal-500/10 p-3 text-teal-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Real-time Analytics</h3>
            <p className="text-zinc-400">
              Instant insights into student performance using our proprietary AI models.
            </p>
          </div>
          <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-blue-500/50 hover:bg-blue-500/5">
            <div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Secure Infrastructure</h3>
            <p className="text-zinc-400">
              Enterprise-grade security with role-based access control and data encryption.
            </p>
          </div>
          <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-purple-500/50 hover:bg-purple-500/5">
            <div className="mb-4 inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Smart Reporting</h3>
            <p className="text-zinc-400">
              Automated report generation for attendance, grades, and administrative tasks.
            </p>
          </div>
        </section>
      </main>
      
      <footer className="mt-32 border-t border-white/10 py-12 text-center text-zinc-600">
        <p>© 2024 AI ERP System. All rights reserved.</p>
      </footer>
    </div>
  );
}
