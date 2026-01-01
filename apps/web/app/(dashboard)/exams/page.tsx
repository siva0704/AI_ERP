'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Plus, CheckCircle } from 'lucide-react';

export default function ExamsPage() {
    const queryClient = useQueryClient();
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    // 1. Fetch Exams
    const { data: exams } = useQuery({
        queryKey: ['exams'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/exams');
            if (!res.ok) return [];
            return res.json();
        }
    });

    // 2. Fetch Students (for Marks Entry)
    const { data: students } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/admissions');
            return res.json();
        },
        enabled: !!selectedExamId
    });

    // 3. Create Exam Mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('http://localhost:3001/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams'] });
            setShowCreate(false);
        }
    });

    // 4. Submit Marks Mutation
    const markMutation = useMutation({
        mutationFn: async (data: { studentId: string, marks: number }) => {
            if (!selectedExamId) return;
            const res = await fetch('http://localhost:3001/api/exams/marks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: selectedExamId,
                    studentId: data.studentId,
                    marks: Number(data.marks)
                }),
            });
            return res.json();
        }
    });

    const { register, handleSubmit } = useForm();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Exams & Gradebook</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus size={20} />
                    New Exam
                </button>
            </div>

            {/* Create Exam Form */}
            {showCreate && (
                <Card className="bg-neutral-50 border-blue-200">
                    <CardHeader><CardTitle>Create New Exam</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input {...register('name')} placeholder="Exam Name (e.g. Finals)" className="p-2 border rounded" required />
                                <input {...register('date')} type="date" className="p-2 border rounded" required />
                                <select {...register('type')} className="p-2 border rounded">
                                    <option value="INTERNAL">Internal</option>
                                    <option value="EXTERNAL">External</option>
                                </select>
                                <input {...register('subjectId')} placeholder="Subject ID (UUID)" className="p-2 border rounded" required />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded font-bold">
                                Save Exam
                            </button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Exam List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Select Exam</CardTitle>
                        <CardDescription>Click to enter marks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {exams?.map((e: any) => (
                                <div
                                    key={e.id}
                                    onClick={() => setSelectedExamId(e.id)}
                                    className={`p-3 rounded border cursor-pointer hover:bg-neutral-50 transition-colors ${selectedExamId === e.id ? 'border-blue-500 bg-blue-50' : ''}`}
                                >
                                    <div className="font-bold">{e.name}</div>
                                    <div className="text-xs text-neutral-500">{new Date(e.date).toLocaleDateString()} - {e.type}</div>
                                </div>
                            ))}
                            {(!exams || exams.length === 0) && <p className="text-sm text-neutral-500 italic">No exams found.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Marks Entry Table */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Marks Entry</CardTitle>
                        <CardDescription>
                            {selectedExamId ? 'Enter marks for students below.' : 'Select an exam from the left to start.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedExamId && students ? (
                            <div className="border rounded-md overflow-hidden bg-white">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-100 font-bold border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Enrollment</th>
                                            <th className="px-4 py-3 text-left">Name</th>
                                            <th className="px-4 py-3 text-left">Marks (Max 100)</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {students.map((s: any) => (
                                            <tr key={s.id}>
                                                <td className="px-4 py-3 font-mono text-xs">{s.enrollmentNo}</td>
                                                <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        className="w-24 p-1 border rounded"
                                                        placeholder="0"
                                                        onBlur={(e) => markMutation.mutate({ studentId: s.id, marks: Number(e.target.value) })}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    {/* Ideally show saved status */}
                                                    <span className="text-green-600 text-xs">Auto-saved</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center text-neutral-400">
                                Select an exam to view student list
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
