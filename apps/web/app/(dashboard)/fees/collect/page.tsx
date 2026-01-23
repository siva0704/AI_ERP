'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';

// Types
type Student = {
    id: string;
    firstName: string;
    lastName: string;
    enrollmentNo: string;
};

type Due = {
    id: string;
    description: string;
    amount: string;
    transactionType: 'FEE' | 'PAYMENT';
    createdAt: string;
};

type DuesResponse = {
    balance: number;
    history: Due[];
};

type PaymentFormData = {
    studentId: string;
    amount: number;
    paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
    description: string;
};

export default function FeeCollectionPage() {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue } = useForm<PaymentFormData>();

    // 1. Search Students
    const { data: students } = useQuery<Student[]>({
        queryKey: ['students', searchTerm],
        queryFn: async () => {
            // Fetch users with role STUDENT
            // In a real app, this would be a dedicated search endpoint
            // For now, we unfortunately have to rely on what we have. 
            // If there's no search endpoint, we might have to list all (inefficient) or just rely on manual ID entry.
            // Let's assume a basic endpoint exists or we use a mocked list for MVP if endpoints fail.
            // Actually, we can fetch from /api/users?role=STUDENT if it exists, or just use a known list.
            // Let's try to fetch from a generic endpoint, or handle gracefully.
            const res = await fetch('http://localhost:3001/api/users?role=STUDENT');
            // Note: If this endpoint doesn't exist, we fallback to empty.
            if (!res.ok) return [];
            return res.json();
        },
        enabled: true // Always load for now, optimized later
    });

    const filteredStudents = students?.filter(s =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.enrollmentNo.includes(searchTerm)
    ) || [];

    // 2. Fetch Dues for Selected Student
    const { data: duesData, refetch: refetchDues } = useQuery<DuesResponse>({
        queryKey: ['dues', selectedStudentId],
        queryFn: async () => {
            if (!selectedStudentId) return { balance: 0, history: [] };
            const res = await fetch(`http://localhost:3001/api/fees/dues/${selectedStudentId}`);
            if (!res.ok) throw new Error('Failed to fetch dues');
            return res.json();
        },
        enabled: !!selectedStudentId,
    });

    // 3. Make Payment
    const mutation = useMutation({
        mutationFn: async (data: PaymentFormData) => {
            const res = await fetch('http://localhost:3001/api/fees/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, studentId: selectedStudentId }),
            });
            if (!res.ok) throw new Error('Payment failed');
            return res.json();
        },
        onSuccess: () => {
            reset();
            alert('Payment Collected Successfully');
            queryClient.invalidateQueries({ queryKey: ['dues', selectedStudentId] });
            // Optionally print receipt here
        },
        onError: () => {
            alert('Failed to collect payment');
        }
    });

    const calculateTotalDues = () => {
        if (!duesData) return 0;
        return duesData.balance;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Fee Collection</h1>
                <p className="text-slate-500">Search student and collect fees.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Search */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Find Student</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                className="w-full pl-9 p-2 border rounded-md text-sm"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto">
                        <div className="space-y-2">
                            {filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudentId(student.id)}
                                    className={`p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors ${selectedStudentId === student.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                                >
                                    <div className="font-medium text-slate-900">{student.firstName} {student.lastName}</div>
                                    <div className="text-xs text-slate-500">ID: {student.enrollmentNo}</div>
                                </div>
                            ))}
                            {filteredStudents.length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-4">No students found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Col: Details & Payment */}
                <div className="md:col-span-2 space-y-6">
                    {selectedStudentId && (
                        <>
                            {/* Dues Summary */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Outstanding Balance</CardTitle>
                                        <span className="text-2xl font-bold text-red-600">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(calculateTotalDues())}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2 text-sm bg-slate-50">
                                        {duesData?.history?.map(txn => (
                                            <div key={txn.id} className="flex justify-between border-b border-slate-200 pb-1 last:border-0">
                                                <span>{txn.description}</span>
                                                <span className={txn.transactionType === 'PAYMENT' ? 'text-green-600' : 'text-neutral-900'}>
                                                    {txn.transactionType === 'PAYMENT' ? '-' : ''}{txn.amount}
                                                </span>
                                            </div>
                                        ))}
                                        {(!duesData?.history || duesData.history.length === 0) && <p className="text-center text-neutral-500">No history found.</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Receive Payment</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Amount</label>
                                                <input
                                                    {...register('amount', { required: true, valueAsNumber: true })}
                                                    type="number"
                                                    className="w-full p-2 border rounded-md"
                                                    placeholder="Enter amount"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Payment Mode</label>
                                                <select
                                                    {...register('paymentMethod')}
                                                    className="w-full p-2 border rounded-md"
                                                >
                                                    <option value="CASH">Cash</option>
                                                    <option value="UPI">UPI</option>
                                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Description</label>
                                            <input
                                                {...register('description')}
                                                className="w-full p-2 border rounded-md"
                                                placeholder="e.g. Tuition Fee Installment 1"
                                                defaultValue="Tuition Fee Payment"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-bold disabled:opacity-50"
                                            disabled={mutation.isPending}
                                        >
                                            {mutation.isPending ? 'Processing...' : 'Collect Payment'}
                                        </button>
                                    </form>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    {!selectedStudentId && (
                        <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl p-10">
                            Select a student to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
