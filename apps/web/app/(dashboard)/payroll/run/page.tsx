"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function RunPayrollPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM-01')); // Default first of current month
    const [preview, setPreview] = useState<any>(null);

    const handlePreview = async () => {
        setLoading(true);
        try {
            const role = Cookies.get('user-role');
            const res = await fetch('/api/payroll/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': role || 'GUEST',
                    'x-branch-id': 'branch-101'
                },
                body: JSON.stringify({ month })
            });
            if (res.ok) {
                setPreview(await res.json());
                setStep(2);
            } else {
                alert('Failed to generate preview. Please check if payroll already exists for this month.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!preview) return;
        setLoading(true);
        try {
            const role = Cookies.get('user-role');
            const res = await fetch('/api/payroll/commit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': role || 'GUEST',
                    'x-branch-id': 'branch-101'
                },
                body: JSON.stringify({
                    month,
                    items: preview.items
                })
            });
            if (res.ok) {
                router.push('/payroll');
            } else {
                alert('Commit failed');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Run Payroll</h1>
                <p className="text-slate-500 mt-2">Step {step} of 2</p>
            </div>

            {/* STEP 1: SELECT MONTH */}
            {step === 1 && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-md">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Pay Period</label>
                    <input
                        type="date"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full p-2 border rounded-md mb-6"
                    />
                    <Button onClick={handlePreview} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Preview
                    </Button>
                </div>
            )}

            {/* STEP 2: PREVIEW & CONFIRM */}
            {step === 2 && preview && (
                <div className="space-y-6">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Review Carefully</AlertTitle>
                        <AlertDescription>
                            Loss of Pay (LOP) has been automatically calculated based on attendance records.
                        </AlertDescription>
                    </Alert>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Staff Name</th>
                                    <th className="px-6 py-4">Base Salary</th>
                                    <th className="px-6 py-4">Absent Days</th>
                                    <th className="px-6 py-4 text-red-600">Deduction (LOP)</th>
                                    <th className="px-6 py-4 font-bold">Net Salary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {preview.items.map((item: any) => (
                                    <tr key={item.staffId}>
                                        <td className="px-6 py-4 font-medium">{item.name}</td>
                                        <td className="px-6 py-4">${item.baseSalary}</td>
                                        <td className="px-6 py-4">
                                            {item.absentDays > 0 ? (
                                                <span className="text-red-600 font-bold">{item.absentDays} Days</span>
                                            ) : (
                                                <span className="text-green-600">0 Days</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-red-600">-${item.lopDeduction}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">${item.netSalary}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-6 py-4" colSpan={4}>Total Payout</td>
                                    <td className="px-6 py-4 text-emerald-700">${Number(preview.totalPayout).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleCommit}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Check className="mr-2 h-4 w-4" />
                            Commit & Pay
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
