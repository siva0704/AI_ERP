'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    GraduationCap,
    Menu,
    LogOut
} from "lucide-react";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { getNavItemsForRole, NavItemConfig } from "@/config/navigation.config";
import { AssistantChat } from "@/components/assistant/assistant-chat";

function SidebarItems() {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(Cookies.get("user-role") || "BRANCH_ADMIN");
    }, []);

    if (!role) return null;

    const items = getNavItemsForRole(role);

    return (
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {items.map((item) => (
                <NavItem
                    key={item.href}
                    href={item.href}
                    icon={<item.icon size={20} />}
                    label={item.label}
                />
            ))}
        </nav>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [role, setRole] = useState("GUEST");
    const [userName, setUserName] = useState("User");
    const router = useRouter(); // Need to import useRouter in the component file if not verified

    useEffect(() => {
        setRole(Cookies.get("user-role") || "BRANCH_ADMIN");
        setUserName(Cookies.get("user-name") || "User");
    }, []);

    const handleLogout = () => {
        Cookies.remove("demo-token");
        Cookies.remove("user-role");
        Cookies.remove("user-name");
        // Using window.location to force full refresh and clear state
        window.location.href = "/login";
    };

    const getPortalTitle = () => {
        switch (role) {
            case 'GROUP_ADMIN': return 'Super Admin Portal';
            case 'BRANCH_ADMIN': return 'Branch Admin Portal';
            case 'STAFF': return 'Staff Portal';
            case 'STUDENT': return 'Student Portal';
            default: return 'EduERP Portal';
        }
    };

    return (
        <div className="flex h-screen bg-[var(--color-background)]">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-[var(--color-primary)] text-white border-r-2 border-[var(--color-primary)] transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
                <div className="p-6 flex items-center gap-3 border-b border-[var(--color-surface)]/10 shrink-0">
                    <div className="w-10 h-10 bg-[var(--color-accent)] flex items-center justify-center rounded-none shadow-[2px_2px_0px_0px_white]">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-display font-bold tracking-tight uppercase">EduERP</span>
                </div>

                <SidebarItems />

                <div className="p-4 border-t border-[var(--color-surface)]/10 mt-auto shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-red-300 hover:text-white hover:bg-red-900/50 transition-colors border border-transparent hover:border-red-500/30"
                    >
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                    <div className="mt-4 flex items-center gap-3 px-4 py-3 text-xs font-mono text-[var(--color-primary)] bg-[var(--color-accent)] rounded-none border border-[var(--color-surface)]/20">
                        <span className="opacity-70 text-white">VERSION</span>
                        <span className="font-bold text-white">1.0.0</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col w-full">
                <header className="h-20 bg-[var(--color-background)] border-b-2 border-[var(--color-primary)] flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-[var(--color-primary)] hover:bg-[var(--color-accent)]/10 border border-[var(--color-primary)]"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-[var(--color-primary)] leading-none">
                                {getPortalTitle()}
                            </h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Springfield High • Branch 01</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-[var(--color-primary)] uppercase">{userName}</div>
                            <div className="text-xs text-neutral-500 font-mono">{role.replace('_', ' ')}</div>
                        </div>
                        <div className="border-2 border-[var(--color-primary)] rounded-full p-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-primary)] transition-shadow cursor-pointer" onClick={handleLogout} title="Click to Logout">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
                                {userName.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>
                <div className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full">
                    <div className="bg-white border-2 border-[var(--color-primary)] p-6 shadow-[8px_8px_0px_0px_var(--color-primary)] min-h-full">
                        {children}
                    </div>
                </div>
            </main>
            <AssistantChat />
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all border border-transparent ${isActive
                ? "bg-[var(--color-accent)] text-white shadow-[4px_4px_0px_0px_white] translate-x-1"
                : "text-[var(--color-surface)]/70 hover:text-white hover:border-[var(--color-surface)]/30"
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
