'use client';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import Link from 'next/link';

async function fetchFeeStructures() {
    const res = await fetch('http://localhost:3001/api/fees/structure');
    if (!res.ok) {
        throw new Error('Failed to fetch fee structures');
    }
    return res.json();
}

export default function FeeStructurePage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['feeStructs'],
        queryFn: fetchFeeStructures,
    });

    if (isLoading) return <div>Loading fees...</div>;
    if (error) return <div>Error loading fees</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Fee Structures</h1>
                <Link
                    href="/fees/structure/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Create Fee Head
                </Link>
            </div>

            <DataTable columns={columns} data={data || []} />
        </div>
    );
}
