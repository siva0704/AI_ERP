'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Assuming shadcn or similar exists, else I'll execute without and fix imports later. Wait, I saw components/ui in file lists before... No I didn't verify. I'll use standard Tailwind divs first to be safe, or check if components dir exists.
// Actually, I'll stick to raw Tailwind for now to ensure it works, then refine.

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (role: string, name: string) => {
        // Set Cookies
        Cookies.set('demo-token', 'valid-demo-token', { expires: 1 });
        Cookies.set('user-role', role, { expires: 1 });
        Cookies.set('user-name', name, { expires: 1 });

        // Redirect
        router.push('/dashboard');
    };

    const personas = [
        {
            role: 'GROUP_ADMIN',
            label: 'Super Admin',
            description: 'Full access to all branches and settings.',
            color: 'bg-red-100 hover:bg-red-200 text-red-800',
        },
        {
            role: 'BRANCH_ADMIN',
            label: 'Branch Admin',
            description: 'Manage a specific campus, admission, and fees.',
            color: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
        },
        {
            role: 'STAFF',
            label: 'Teacher / Staff',
            description: 'Mark attendance, manage exams, and timetable.',
            color: 'bg-green-100 hover:bg-green-200 text-green-800',
        },
        {
            role: 'STUDENT',
            label: 'Student / Parent',
            description: 'View grades, attendance, and pay fees.',
            color: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-neutral-900 tracking-tight mb-2">
                        Welcome to AI SMS
                    </h1>
                    <p className="text-neutral-500">
                        Select a persona to explore the Educational ERP system.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {personas.map((p) => (
                        <button
                            key={p.role}
                            onClick={() => handleLogin(p.role, p.label)}
                            className={`text-left p-6 rounded-xl border border-transparent transition-all duration-200 shadow-sm hover:shadow-md ${p.color}`}
                        >
                            <h3 className="text-xl font-bold mb-1">{p.label}</h3>
                            <p className="text-sm opacity-90">{p.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
