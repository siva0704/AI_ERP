
'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Simplified Staff Interface
interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    designation: string;
    department: string;
    attendance?: number;
}

const columns: ColumnDef<Staff>[] = [
    {
        accessorKey: 'firstName',
        header: 'Name',
        cell: ({ row }) => <div className="font-medium text-gray-900">{row.original.firstName} {row.original.lastName}</div>,
    },
    {
        accessorKey: 'designation',
        header: 'Role',
        cell: ({ row }) => (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {row.original.designation}
            </Badge>
        ),
    },
    {
        accessorKey: 'department',
        header: 'Department',
    },
    {
        accessorKey: 'attendance',
        header: 'Attendance',
        cell: ({ row }) => {
            const attendance = row.original.attendance || 0;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${attendance > 85 ? 'bg-green-500' : attendance > 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${attendance}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{attendance}%</span>
                </div>
            );
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Link href={`/staff/${row.original.id}`}>
                <Button variant="ghost" size="sm">View</Button>
            </Link>
        )
    }
];

export default function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking fetch for now until API seeding is ready or using generic internal fetch
        async function fetchStaff() {
            try {
                // Determine API URL based on environment or context
                const res = await fetch('http://localhost:3001/api/staff', {
                    headers: {
                        'x-branch-id': 'default-branch',
                        'x-tenant-id': 'default-tenant-id'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStaff(data);
                } else {
                    // Fallback to empty if API fails (expected since no staff seeded yet)
                    setStaff([]);
                }
            } catch (error) {
                console.error("Failed to fetch staff", error);
                setStaff([]);
            } finally {
                setLoading(false);
            }
        }
        fetchStaff();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Staff Directory</h1>
                    <p className="text-muted-foreground">Manage teachers, drivers, and admin staff.</p>
                </div>
                <Link href="/staff/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Staff
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <DataTable columns={columns} data={staff} searchKey="firstName" />
            )}
        </div>
    );
}
