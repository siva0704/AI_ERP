'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, CreditCard, UserCog, Printer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interface matching Phase 20 + Backend
interface Student {
    id: string;
    firstName: string;
    lastName: string;
    enrollmentNo: string;
    gradeLevel: string | null;
    status: string;
    balance?: number; // Calculated field
    section?: string; // Optional
}

const columns: ColumnDef<Student>[] = [
    {
        accessorKey: 'firstName',
        header: 'Student Name',
        cell: ({ row }) => (
            <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    {row.original.firstName[0]}{row.original.lastName[0]}
                </div>
                <Link href={`/students/${row.original.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {row.original.firstName} {row.original.lastName}
                </Link>
            </div>
        ),
    },
    {
        accessorKey: 'enrollmentNo',
        header: 'Enrollment ID',
        cell: ({ row }) => <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{row.original.enrollmentNo}</span>,
    },
    {
        accessorKey: 'gradeLevel',
        header: 'Class/Section',
        cell: ({ row }) => (
            <div className="text-sm">
                <span className="font-semibold">{row.original.gradeLevel || 'N/A'}</span>
                <span className="text-gray-400 mx-1">-</span>
                <span className="text-gray-600">{row.original.section || 'A'}</span>
            </div>
        ),
    },
    {
        accessorKey: 'balance',
        header: 'Balance Dues',
        cell: ({ row }) => {
            const balance = row.original.balance || 0;
            return (
                <div className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{balance.toLocaleString('en-IN')}
                </div>
            );
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.status === 'ACTIVE' ? 'outline' : 'secondary'} className={row.original.status === 'ACTIVE' ? 'text-green-700 border-green-200 bg-green-50' : ''}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" /> Collect Fee
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <UserCog className="mr-2 h-4 w-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" /> Print ID Card
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    }
];

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStudents() {
            try {
                // Fetch from API
                const res = await fetch('http://localhost:3001/api/admissions', {
                    // Using admissions endpoint as per controller or students endpoint? 
                    // Controller has @Get() on 'admissions', serving 'getStudents' logic.
                    // Verified in Step 38: AdmissionController @Get() calls simplified list.
                    headers: {
                        'x-branch-id': 'branch-101', // TODO: Context
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Map or transform if needed. API returns StudentProfile structure.
                    setStudents(data.map((s: any) => ({
                        ...s,
                        balance: 5000, // Mock balance until Fee module is fully connected
                        section: 'A' // Mock section until relations fixed
                    })));
                } else {
                    // Fallback Mock for Demo if API fails (e.g. strict CORS or auth)
                    setStudents([
                        { id: '1', firstName: 'Aarav', lastName: 'Kumar', enrollmentNo: 'ENR-2024-001', gradeLevel: '10', status: 'ACTIVE', balance: 12000, section: 'A' },
                        { id: '2', firstName: 'Vivaan', lastName: 'Reddy', enrollmentNo: 'ENR-2024-002', gradeLevel: '8', status: 'ACTIVE', balance: 0, section: 'B' },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStudents();
    }, []);

    return (
        <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student Directory</h1>
                    <p className="text-muted-foreground mt-1">Manage enrollments, fees, and academic records.</p>
                </div>
                <div className="flex space-x-3">
                    {/* Command Palette Trigger Stub */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input className="pl-9 h-10 w-64 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Search students (Cmd+K)..." />
                    </div>

                    <Link href="/admissions/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                            <Plus className="mr-2 h-4 w-4" /> New Admission
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={students} searchKey="firstName" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Helper imports
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
