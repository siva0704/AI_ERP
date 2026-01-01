'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Plus, AlertCircle } from 'lucide-react';

export default function TimetablePage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    // Fetch My Timetable
    const { data: sessions, isLoading } = useQuery({
        queryKey: ['timetable'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/timetable/sessions'); // Uses cookie auth
            if (!res.ok) return [];
            return res.json();
        }
    });

    // Create Session Mutation
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            // Convert local datetime to ISO or keep local? Backend expects ISO string.
            const res = await fetch('http://localhost:3001/api/timetable/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    // Hardcoding teacherId/subjectId/classroomId for demo if inputs are raw
                    // Ideally selected from dropdowns
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Conflict detected');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable'] });
            setShowForm(false);
            setServerError(null);
            alert('Class Scheduled!');
        },
        onError: (err) => {
            setServerError(err.message);
        }
    });

    const { register, handleSubmit } = useForm();

    const onSubmit = (data: any) => {
        setServerError(null); // Clear previous errors
        // Construct Payload
        const payload = {
            dayOfWeek: 'MONDAY', // specific logic needed for real date parsing
            startTime: `${data.date}T${data.startTime}:00.000Z`, // ISO format hack for MVP
            endTime: `${data.date}T${data.endTime}:00.000Z`,
            subjectId: data.subjectId, // UUID
            teacherId: data.teacherId, // UUID
            classroomId: data.classroomId // UUID
        };
        mutation.mutate(payload);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Timetable</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Schedule Class
                </button>
            </div>

            {showForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Add Class Session</CardTitle>
                        <CardDescription>System will check for Teacher & Room conflicts automatically.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {serverError && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span className="font-bold">Conflict:</span> {serverError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-blue-800">Date</label>
                                    <input type="date" {...register('date')} required className="w-full p-2 border rounded" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-blue-800">Start Time</label>
                                    <input type="time" {...register('startTime')} required className="w-full p-2 border rounded" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-blue-800">End Time</label>
                                    <input type="time" {...register('endTime')} required className="w-full p-2 border rounded" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-neutral-600">Subject ID</label>
                                    <input {...register('subjectId')} placeholder="UUID" required className="w-full p-2 border rounded" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-neutral-600">Teacher ID</label>
                                    <input {...register('teacherId')} placeholder="UUID" required className="w-full p-2 border rounded" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-neutral-600">Room ID</label>
                                    <input {...register('classroomId')} placeholder="UUID" required className="w-full p-2 border rounded" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button type="submit" className="px-6 py-2 bg-blue-700 text-white font-bold rounded shadow-sm hover:bg-blue-800">
                                    Save to Schedule
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    {/* List View */}
                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-neutral-100 uppercase text-xs font-bold text-neutral-500 border-b">
                                <tr>
                                    <th className="px-6 py-3">Day</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">Room</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sessions?.map((s: any) => (
                                    <tr key={s.id} className="bg-white hover:bg-neutral-50">
                                        <td className="px-6 py-4 font-medium">{s.dayOfWeek}</td>
                                        <td className="px-6 py-4 text-neutral-500">
                                            {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">{s.subject?.name || s.subjectId}</td>
                                        <td className="px-6 py-4">{s.classroom?.name || s.classroomId}</td>
                                    </tr>
                                ))}
                                {(!sessions || sessions.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-neutral-400 italic">
                                            No classes scheduled for you.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
