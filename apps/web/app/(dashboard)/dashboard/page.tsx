"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Users, GraduationCap, DollarSign, CalendarCheck } from 'lucide-react';
import { KPICard } from '../../../components/dashboard/kpi-card'; // Adjusted Import Path
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Mock Data for Charts (until historical API is ready)
const revenueData = [
    { name: 'Jan', revenue: 4000, expense: 2400 },
    { name: 'Feb', revenue: 3000, expense: 1398 },
    { name: 'Mar', revenue: 2000, expense: 9800 },
    { name: 'Apr', revenue: 2780, expense: 3908 },
    { name: 'May', revenue: 1890, expense: 4800 },
    { name: 'Jun', revenue: 2390, expense: 3800 },
    { name: 'Jul', revenue: 3490, expense: 4300 },
];

const attendanceData = [
    { name: 'Mon', present: 85 },
    { name: 'Tue', present: 88 },
    { name: 'Wed', present: 92 },
    { name: 'Thu', present: 90 },
    { name: 'Fri', present: 85 },
];

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    const fetchStats = async (userRole: string) => {
        // Only Admins access the branch overview stats
        if (userRole !== 'GROUP_ADMIN' && userRole !== 'BRANCH_ADMIN') {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/reporting/branch-overview', {
                headers: {
                    'x-user-role': userRole,
                    'x-branch-id': 'default-branch' // In a real app, this comes from user profile
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                console.error("Failed to fetch stats: Forbidden or Error");
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
        fetchStats(userRole);
    }, []);

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    // --- STUDENT DASHBOARD ---
    if (role === 'STUDENT') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                    <p className="text-slate-500 mt-2">Check your upcoming classes and exam results.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard title="Attendance" value="92%" icon={CalendarCheck} color="green" />
                    <KPICard title="Next Exam" value="Maths" icon={CalendarCheck} color="blue" />
                    <KPICard title="Fees Due" value="$0" icon={DollarSign} color="emerald" />
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-blue-50/50">
                        <h3 className="font-bold text-lg mb-2">My Timetable</h3>
                        <p className="text-sm text-slate-600">View today's schedule</p>
                    </div>
                    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-violet-50/50">
                        <h3 className="font-bold text-lg mb-2">Exam Results</h3>
                        <p className="text-sm text-slate-600">Check latest grades</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- STAFF DASHBOARD ---
    if (role === 'STAFF') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Staff Dashboard</h1>
                    <p className="text-slate-500 mt-2">Manage your classes and attendance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard title="Today's Classes" value="4" icon={Users} color="indigo" />
                    <KPICard title="Pending Attendance" value="1 Class" icon={CalendarCheck} color="orange" />
                    <KPICard title="Upcoming Exams" value="2" icon={GraduationCap} color="blue" />
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-indigo-50/50">
                        <h3 className="font-bold text-lg mb-2">Mark Attendance</h3>
                        <p className="text-sm text-slate-600">Record student presence</p>
                    </div>
                    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-fuchsia-50/50">
                        <h3 className="font-bold text-lg mb-2">Upload Marks</h3>
                        <p className="text-sm text-slate-600">Enter exam results</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- ADMIN DASHBOARD (Default) ---
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-2">Overview of branch performance.</p>
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
                    title="Total Staff"
                    value={stats?.totalStaff || 0}
                    icon={Users}
                    color="blue"
                />
                <KPICard
                    title="Revenue"
                    value={`$${stats?.revenue || 0}`}
                    icon={DollarSign}
                    color="emerald"
                    trend="+12%"
                />
                <KPICard
                    title="Avg. Attendance"
                    value={`${stats?.attendancePercentage || 0}%`}
                    icon={CalendarCheck}
                    color="violet"
                    trend="+2.5%"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue vs Expense</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Weekly Attendance Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="present" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPresent)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
