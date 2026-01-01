'use client';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import Link from 'next/link';

async function fetchStudents() {
    const res = await fetch('http://localhost:3001/api/admissions'); // TODO: Use env var or better client
    if (!res.ok) {
        throw new Error('Failed to fetch students');
    }
    return res.json();
}

export default function AdmissionsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['students'],
        queryFn: fetchStudents,
    });

    if (isLoading) return <div>Loading students...</div>;
    if (error) return <div>Error loading students</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
                <Link
                    href="/admissions/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    New Admission
                </Link>
            </div>

            <DataTable columns={columns} data={data || []} />
        </div>
    );
}
