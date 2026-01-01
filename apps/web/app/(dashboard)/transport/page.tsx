'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Plus, Bus, MapPin, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function TransportPage() {
    const queryClient = useQueryClient();
    const [showAddRoute, setShowAddRoute] = useState(false);

    // 1. Fetch Routes
    const { data: routes } = useQuery({
        queryKey: ['transport.routes'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/transport/routes');
            return res.json();
        }
    });

    // 2. Add Route
    const addRouteMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('http://localhost:3001/api/transport/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, monthlyCost: Number(data.monthlyCost) }),
            });
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transport.routes'] });
            setShowAddRoute(false);
            toast.success('Route Created');
        }
    });

    // 3. Allocate Student
    const allocateMutation = useMutation({
        mutationFn: async (data: { routeId: string, studentId: string }) => {
            const res = await fetch('http://localhost:3001/api/transport/allocate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Student Allocated & Fee Charged');
        }
    });

    const { register, handleSubmit } = useForm();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Transport & Logistics</h1>
                <button
                    onClick={() => setShowAddRoute(!showAddRoute)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Plus size={20} /> New Route
                </button>
            </div>

            {/* Add Route Form */}
            {showAddRoute && (
                <Card className="bg-neutral-50 border-blue-200">
                    <CardHeader><CardTitle>Create Transport Route</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit((d) => addRouteMutation.mutate(d))} className="flex gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-bold">Route Name</label>
                                <input {...register('name')} placeholder="e.g. Route A - North" className="p-2 border rounded w-64" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold">Monthly Cost ($)</label>
                                <input {...register('monthlyCost')} type="number" className="p-2 border rounded w-32" required />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded font-bold">Save</button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Route List */}
            <div className="space-y-4">
                {routes?.map((route: any) => (
                    <Card key={route.id} className="hover:border-blue-300 transition-colors">
                        <div className="p-6 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-full text-blue-700">
                                    <Bus size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{route.name}</h3>
                                    <p className="text-sm text-neutral-500">Cost: ${route.monthlyCost}/month</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-xs font-bold text-neutral-400 uppercase">Driver</div>
                                    <div>{route.vehicle?.driverName || 'Unassigned'}</div>
                                </div>
                                <button
                                    onClick={() => {
                                        const studentId = prompt(`Assign Student to ${route.name} (Enter ID):`);
                                        if (studentId) allocateMutation.mutate({ routeId: route.id, studentId });
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded text-sm font-bold"
                                >
                                    <UserPlus size={16} /> Assign Student
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
