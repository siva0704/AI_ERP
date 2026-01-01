"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

// Define the shape of our data (matching API response)
export type Student = {
    id: string
    firstName: string
    lastName: string
    enrollmentNo: string
    status: string
    user: {
        email: string
    }
}

export const columns: ColumnDef<Student>[] = [
    {
        accessorKey: "enrollmentNo",
        header: "Enrollment No",
    },
    {
        accessorKey: "firstName",
        header: "First Name",
    },
    {
        accessorKey: "lastName",
        header: "Last Name",
    },
    {
        accessorKey: "user.email",
        header: "Email",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{status}</span>
        }
    },
]
