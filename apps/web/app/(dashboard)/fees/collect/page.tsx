'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';

// Types
type Student = {
    id: string;
    firstName: string;
    lastName: string;
    enrollmentNo: string;
};

type Due = {
    id: string; // feeLedger ID
    description: string;
    amount: number;
    transactionType: 'DUE' | 'PAYMENT';
    status: 'PENDING' | 'COMPLETED' | 'PARTIAL';
    balance?: number; // Calculated backend or frontend
};

type PaymentForm = {
    amount: number;
    description: string;
    paymentMethod: string;
};

export default function FeeCollectionPage() {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 1. Fetch Students for Search
    const { data: students } = useQuery<Student[]>({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/admissions');
            return res.json();
        }
    });

    // 2. Fetch Dues for Selected Student
    const { data: dues, refetch: refetchDues } = useQuery<Due[]>({
        queryKey: ['dues', selectedStudentId],
        queryFn: async () => {
            if (!selectedStudentId) return [];
            // Note: The API endpoint for dues might need adjustment to return ledger list
            // For now assuming GET /fees/dues/:id returns { totalDues: X, ledger: [...] } or just ledger
            // The controller code says `getStudentDues` which returns `prisma.feeLedger.findMany`.
            const res = await fetch(`http://localhost:3001/api/fees/dues/${selectedStudentId}`);
            return res.json();
        },
        enabled: !!selectedStudentId,
    });

    const mutation = useMutation({
        mutationFn: async (data: PaymentForm) => {
            const res = await fetch('http://localhost:3001/api/fees/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudentId,
                    amount: Number(data.amount),
                    description: data.description,
                    paymentMethod: data.paymentMethod
                }),
            });
            if (!res.ok) throw new Error('Payment failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dues', selectedStudentId] });
            resetForm();
            alert('Payment Recorded!');
        }
    });

    const { register, handleSubmit, reset: resetForm } = useForm<PaymentForm>();

    const calculateTotalDues = () => {
        if (!dues) return 0;
        // Simple calc: Sum(DUE) - Sum(PAYMENT) matches backend logic usually
        // But backend return raw ledger. 
        // Let's rely on backend logic? The backend `getStudentDues` returns just `findMany`.
        // So we sum it here.
        let balance = 0;
        dues.forEach(d => {
            if (d.transactionType === 'DUE') balance += Number(d.amount);
            if (d.transactionType === 'PAYMENT') balance -= Number(d.amount);
        });
        return balance;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Fee Collection</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Student Search */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Select Student</CardTitle>
                        <CardDescription>Search by name or ID</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <select
                            className="w-full p-2 border rounded-md"
                            onChange={(e) => setSelectedStudentId(e.target.value || null)}
                            value={selectedStudentId || ''}
                        >
                            <option value="">-- Select Student --</option>
                            {students?.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.enrollmentNo} - {s.firstName} {s.lastName}
                                </option>
                            ))}
                        </select>
                    </CardContent>
                </Card>

                {/* Right Col: Dues & Payment */}
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
                                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2 text-sm">
                                        {dues?.map(txn => (
                                            <div key={txn.id} className="flex justify-between border-b pb-1">
                                                <span>{txn.description}</span>
                                                <span className={txn.transactionType === 'PAYMENT' ? 'text-green-600' : 'text-neutral-900'}>
                                                    {txn.transactionType === 'PAYMENT' ? '-' : ''}{txn.amount}
                                                </span>
                                            </div>
                                        ))}
                                        {(!dues || dues.length === 0) && <p className="text-center text-neutral-500">No history found.</p>}
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
                                                    {...register('amount', { required: true })}
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
                                            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-bold"
                                            disabled={mutation.isPending}
                                        >
                                            {mutation.isPending ? 'Processing...' : 'Collect Payment'}
                                        </button>
                                    </form>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
