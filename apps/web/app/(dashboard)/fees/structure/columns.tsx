"use client"

import { ColumnDef } from "@tanstack/react-table"

export type FeeStructure = {
    id: string
    name: string
    amount: string
    currency: string
    branchId: string
}

export const columns: ColumnDef<FeeStructure>[] = [
    {
        accessorKey: "name",
        header: "Fee Name",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const currency = row.original.currency;
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency }).format(amount);
        }
    },
    {
        accessorKey: "currency",
        header: "Currency",
    },
]
