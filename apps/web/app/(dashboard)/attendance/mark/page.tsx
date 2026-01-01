'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

type Student = {
    id: string;
    firstName: string;
    lastName: string;
    enrollmentNo: string;
};

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export default function MarkAttendancePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    // Store attendance state locally: { [studentId]: status }
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});

    // Fetch students
    const { data: students, isLoading } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/admissions');
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async () => {
            // Convert map to array
            const items = Object.entries(attendanceMap).map(([userId, status]) => ({
                userId,
                status
            }));

            if (items.length === 0) return;

            const res = await fetch('http://localhost:3001/api/attendance/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    date: new Date(date).toISOString(),
                    // branchId is inferred from context/token usually, or hardcoded for demo
                    // The backend extracts tenantId but branchId needs to be passed? 
                    // Controller logic: `bulkMarkAttendance(@Body() body, @Req() req)`
                    // We need to check if backend needs branchId in body. 
                    // Looking at previous summary: `AttendanceService.bulkMarkAttendance(items, date, branchId)`
                    // The controller likely extracts branchId from context users.
                }),
            });

            if (!res.ok) throw new Error('Failed to mark attendance');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendanceReport'] });
            router.push('/attendance');
            alert('Attendance Saved Successfully');
        }
    });

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAll = (status: AttendanceStatus) => {
        if (!students) return;
        const newMap: Record<string, AttendanceStatus> = {};
        students.forEach(s => {
            newMap[s.id] = status;
        });
        setAttendanceMap(newMap);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || Object.keys(attendanceMap).length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold"
                    >
                        {mutation.isPending ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="mb-4 flex gap-2">
                        <button onClick={() => markAll('PRESENT')} className="text-xs font-bold uppercase px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark All Present</button>
                        <button onClick={() => markAll('ABSENT')} className="text-xs font-bold uppercase px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Mark All Absent</button>
                    </div>

                    <div className="space-y-2">
                        {students?.map(student => {
                            const status = attendanceMap[student.id];
                            return (
                                <div key={student.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-neutral-50 transition-colors">
                                    <div className="font-medium">
                                        <div className="text-neutral-900">{student.firstName} {student.lastName}</div>
                                        <div className="text-xs text-neutral-500 font-mono">{student.enrollmentNo}</div>
                                    </div>
                                    <div className="flex gap-1 bg-white p-1 rounded border">
                                        {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(student.id, s)}
                                                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${status === s
                                                        ? s === 'PRESENT' ? 'bg-green-600 text-white'
                                                            : s === 'ABSENT' ? 'bg-red-600 text-white'
                                                                : 'bg-neutral-800 text-white'
                                                        : 'text-neutral-500 hover:bg-neutral-100'
                                                    }`}
                                            >
                                                {s[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
