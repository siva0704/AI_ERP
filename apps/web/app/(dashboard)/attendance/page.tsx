'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarCheck, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

async function fetchAttendanceReport() {
    // Assuming backend endpoint GET /api/attendance/report exists or we mock it
    // In previous context, we saw `getAttendanceReport` in service.
    // Let's assume GET /api/attendance/report returns { status: 'PRESENT', count: 10 }[]
    const res = await fetch('http://localhost:3001/api/attendance/report');
    if (!res.ok) return [];
    return res.json();
}

export default function AttendancePage() {
    const { data: stats } = useQuery({
        queryKey: ['attendanceReport'],
        queryFn: fetchAttendanceReport
    });

    const presentCount = Array.isArray(stats) ? stats.find((s: any) => s.status === 'PRESENT')?.count || 0 : 0;
    const absentCount = Array.isArray(stats) ? stats.find((s: any) => s.status === 'ABSENT')?.count || 0 : 0;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Attendance Manager</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/attendance/mark" className="block group">
                    <Card className="h-full transition-colors group-hover:border-blue-500">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <ClipboardList className="h-6 w-6 text-blue-600" />
                                <CardTitle>Mark Attendance</CardTitle>
                            </div>
                            <CardDescription>Record daily attendance for students.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarCheck className="h-6 w-6 text-green-600" />
                            <CardTitle>Today's Overview</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                                <div className="text-xs text-green-600 uppercase font-bold">Present</div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                                <div className="text-xs text-red-600 uppercase font-bold">Absent</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
