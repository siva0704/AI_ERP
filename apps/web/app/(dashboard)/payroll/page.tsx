"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function PayrollPage() {
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRuns = async () => {
            try {
                const role = Cookies.get('user-role');
                const res = await fetch('/api/payroll/runs', {
                    headers: {
                        'x-user-role': role || 'GUEST',
                        'x-branch-id': 'branch-101'
                    }
                });
                if (res.ok) setRuns(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRuns();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Payroll Engine</h1>
                    <p className="text-slate-500 mt-2">Manage monthly salary disbursements and expense tracking.</p>
                </div>
                <Link href="/payroll/run">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Run Payroll
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">Payroll History</h2>
                </div>

                {runs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No payroll runs found. Click "Run Payroll" to start your first batch.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Total Payout</th>
                                <th className="px-6 py-4">Date Processed</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {runs.map(run => (
                                <tr key={run.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {format(new Date(run.month), 'MMMM yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {run.status === 'COMMITTED' ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                <Clock className="w-3 h-3 mr-1" /> Draft
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        ${Number(run.totalPayout).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {format(new Date(run.createdAt), 'PP p')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Report
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
