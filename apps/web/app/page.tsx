'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, BarChart3, BookOpen, Calendar, GraduationCap, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'

export default function LandingPage() {
    return (
        // Hardcoded "Navy" bg-slate-950 and "White/Teal" text to ensure it looks good even if variables fail
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-teal-500 selection:text-white overflow-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-md border-b-2 border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-none shadow-[4px_4px_0px_0px_#0d9488]">
                                <GraduationCap className="h-6 w-6 text-teal-400" />
                            </div>
                            <span className="text-2xl font-bold tracking-tighter uppercase font-mono text-white">
                                EduERP
                            </span>
                        </div>
                        <div className="flex items-center gap-6 font-medium">
                            <Link
                                href="/login"
                                className="bg-teal-600 text-white px-6 py-3 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_white] transition-all uppercase tracking-wide text-sm font-bold border-2 border-teal-600"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
                {/* Geometric Decor - Hardcoded Colors */}
                <div className="absolute top-20 right-0 w-64 h-64 border-[3px] border-teal-800 rounded-full opacity-20 animate-spin-slow pointer-events-none" />
                <div className="absolute top-40 left-10 w-32 h-32 bg-teal-900 opacity-20 rotate-45 pointer-events-none" />

                <div className="text-center space-y-10 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-950/30 border border-teal-800 text-teal-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 bg-teal-400" />
                            The Future of Management
                        </div>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white uppercase leading-none">
                            The Power of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                                Knowledge
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Streamline your institution with a design-first ERP. <br className="hidden md:block" />
                        Architecture for the modern educational ecosystem.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                    >
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 text-lg font-bold uppercase tracking-wide border-2 border-white hover:bg-transparent hover:text-white hover:shadow-[6px_6px_0px_0px_#2dd4bf] transition-all"
                        >
                            Try Demo <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-slate-700 text-lg font-bold uppercase tracking-wide hover:bg-slate-800 hover:border-slate-600 transition-all"
                        >
                            Explore Modules
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 border-t-2 border-slate-900 bg-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 text-white">
                            System Modules
                        </h2>
                        <div className="w-24 h-2 bg-teal-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            title="Student Management"
                            description="Complete lifecycle tracking from enrollment to alumni."
                        />
                        <FeatureCard
                            icon={<Calendar className="h-8 w-8" />}
                            title="Smart Attendance"
                            description="Automated tracking with AI-enhanced recognition."
                        />
                        <FeatureCard
                            icon={<LayoutDashboard className="h-8 w-8" />}
                            title="Dynamic Timetables"
                            description="Collision-free scheduling algorithms."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-8 w-8" />}
                            title="Secure Core"
                            description="Role-based access control with bank-grade encryption."
                        />
                        <FeatureCard
                            icon={<BookOpen className="h-8 w-8" />}
                            title="Academic Suite"
                            description="Comprehensive exam and grading management."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-8 w-8" />}
                            title="Analytics Engine"
                            description="Real-time insights into institutional performance."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-black uppercase tracking-tighter">
                            EduERP
                        </span>
                        <span className="text-teal-400 font-mono text-sm">v1.0</span>
                    </div>
                    <div className="text-slate-500 text-sm font-medium tracking-wide">
                        DESIGNED FOR THE FUTURE
                    </div>
                    <div className="flex gap-8 font-bold text-sm uppercase tracking-widest">
                        <a href="#" className="hover:text-teal-400 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-teal-400 transition-colors">Github</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -8, boxShadow: "8px 8px 0px 0px #0d9488" }}
            className="bg-slate-900 p-8 border-2 border-slate-800 transition-all group hover:border-teal-900"
        >
            <div className="w-16 h-16 bg-slate-950 text-white flex items-center justify-center mb-8 group-hover:bg-teal-600 transition-colors border border-slate-800">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight text-slate-100">{title}</h3>
            <p className="text-slate-400 font-medium leading-relaxed text-lg">{description}</p>
        </motion.div>
    )
}
