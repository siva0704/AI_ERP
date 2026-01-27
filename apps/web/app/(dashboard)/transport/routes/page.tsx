
'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Bus, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Simplified Route Interface
interface TransportRoute {
    id: string;
    name: string;
    monthlyCost: number;
    vehicleId: string | null;
    vehicle?: {
        plateNumber: string;
        capacity: number;
    };
    allocations?: any[]; // Mocking count
}

const columns: ColumnDef<TransportRoute>[] = [
    {
        accessorKey: 'name',
        header: 'Route Name',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-md">
                    <Bus className="w-4 h-4 text-yellow-700" />
                </div>
                <span className="font-medium text-gray-900">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'vehicle',
        header: 'Vehicle',
        cell: ({ row }) => row.original.vehicle ? (
            <div className="flex flex-col">
                <span className="text-sm font-medium">{row.original.vehicle.plateNumber}</span>
                <span className="text-xs text-muted-foreground">{row.original.vehicle.capacity} Seats</span>
            </div>
        ) : <span className="text-gray-400 italic">Unassigned</span>,
    },
    {
        accessorKey: 'monthlyCost',
        header: 'Monthly Cost',
        cell: ({ row }) => <span className="font-medium">${Number(row.original.monthlyCost).toFixed(2)}</span>,
    },
    {
        id: 'occupancy',
        header: 'Occupancy',
        cell: ({ row }) => {
            const seats = row.original.vehicle?.capacity || 0;
            const taken = row.original.allocations?.length || 0;
            const percentage = seats > 0 ? (taken / seats) * 100 : 0;

            return (
                <div className="flex items-center gap-2 w-32">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${percentage > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{taken}/{seats}</span>
                </div>
            );
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Link href={`/transport/routes/${row.original.id}`}>
                <Button variant="ghost" size="sm">Manage</Button>
            </Link>
        )
    }
];

export default function TransportRoutesPage() {
    const [routes, setRoutes] = useState<TransportRoute[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking fetch 
        async function fetchRoutes() {
            try {
                const res = await fetch('http://localhost:3001/api/transport/routes', {
                    headers: {
                        'x-branch-id': 'default-branch',
                        'x-tenant-id': 'default-tenant-id'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRoutes(data);
                } else {
                    setRoutes([]);
                }
            } catch (error) {
                console.error("Failed to fetch routes", error);
                setRoutes([]);
            } finally {
                setLoading(false);
            }
        }
        fetchRoutes();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transport Routes</h1>
                    <p className="text-muted-foreground">Manage bus routes, stops, and vehicle assignments.</p>
                </div>
                <Link href="/transport/routes/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Create Route
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <DataTable columns={columns} data={routes} searchKey="name" />
            )}
        </div>
    );
}
