
"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Users, GraduationCap, DollarSign, CalendarCheck, Clock, Download, Loader2 } from 'lucide-react';
import { KPICard } from '../../../components/dashboard/kpi-card';
import { Button } from '../../../components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format } from 'date-fns';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [trend, setTrend] = useState<any[]>([]);
    const [matrix, setMatrix] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    const fetchLiveReports = async (userRole: string) => {
        if (userRole !== 'GROUP_ADMIN' && userRole !== 'BRANCH_ADMIN') {
            setLoading(false);
            return;
        }

        try {
            const headers = {
                'x-user-role': userRole,
                'x-branch-id': 'branch-101' // In real app, from context
            };

            const [resKPI, resTrend, resMatrix] = await Promise.all([
                fetch('/api/reporting/branch-overview', { headers }),
                fetch('/api/reporting/revenue-trend', { headers }),
                fetch('/api/reporting/attendance-matrix', { headers })
            ]);

            if (resKPI.ok && resTrend.ok && resMatrix.ok) {
                setStats(await resKPI.json());
                setTrend(await resTrend.json());
                setMatrix(await resMatrix.json());
            } else {
                console.error("Partial failure in fetching reports");
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userRole = Cookies.get("user-role") || "GUEST";
        setRole(userRole);
        fetchLiveReports(userRole);
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
            </div>
        );
    }

    const handleExport = () => {
        // Trigger browser download
        // In real app, cookies are passed automatically with window.open if SameSite allows
        window.open('/api/reporting/export?type=REVENUE', '_blank');
    };

    // --- STUDENT/STAFF VIEWS (UNCHANGED FOR NOW) ---
    if (role === 'STUDENT' || role === 'STAFF') {
        return <div className="p-8 text-center text-slate-500">Redirecting to personalized view...</div>;
    }

    // --- ADMIN DASHBOARD (LIVE) ---
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Executive Dashboard</h1>
                    <p className="text-slate-500 mt-2">Live insights from your branch.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Revenue
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Students"
                    value={stats?.totalStudents || 0}
                    icon={GraduationCap}
                    color="indigo"
                />
                <KPICard
                    title="Active Staff"
                    value={stats?.totalStaff || 0}
                    icon={Users}
                    color="blue"
                />
                <KPICard
                    title="Revenue (MTD)"
                    value={`$${stats?.revenue?.toLocaleString() || 0}`}
                    icon={DollarSign}
                    color="emerald"
                    trend="+0%" // Calc trend later
                />
                <KPICard
                    title="Attendance (Today)"
                    value={`${stats?.attendancePercentage || 0}%`}
                    icon={CalendarCheck}
                    color="violet"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend (30 Days) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend (30 Days)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')} />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Matrix (Weekly) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Attendance Trend (7 Days)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={matrix}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickFormatter={(str) => format(new Date(str), 'EEE')}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')} />
                                <Bar dataKey="present" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Present %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

