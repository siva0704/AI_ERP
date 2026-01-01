'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Schema: Input is handled as standard, coerced to number
const feeSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    amount: z.coerce.number().min(0, 'Amount must be positive'),
    currency: z.string().default('INR'),
});

type FeeFormValues = z.infer<typeof feeSchema>;

export default function NewFeeStructurePage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Explicitly using any to avoid Zod 4 / RHF type mismatch during build
    const form = useForm<any>({
        resolver: zodResolver(feeSchema),
        defaultValues: {
            name: '',
            amount: 0,
            currency: 'INR',
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: FeeFormValues) => {
            const res = await fetch('http://localhost:3001/api/fees/structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to create fee structure');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feeStructs'] });
            router.push('/fees/structure');
        },
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create Fee Head</CardTitle>
                    <CardDescription>Define a new type of fee (e.g., Annual Tuition, Transport, Exam Fee).</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fee Name</label>
                            <input
                                {...form.register('name')}
                                className="w-full p-2 border rounded-md"
                                placeholder="e.g. Annual Tuition 2025"
                            />
                            {form.formState.errors.name && (
                                <p className="text-red-500 text-sm">{form.formState.errors.name?.message as string}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <input
                                    {...form.register('amount')}
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded-md"
                                    placeholder="5000"
                                />
                                {form.formState.errors.amount && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.amount?.message as string}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Currency</label>
                                <select
                                    {...form.register('currency')}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 border rounded-md hover:bg-neutral-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Saving...' : 'Create Fee Structure'}
                            </button>
                        </div>
                        {mutation.isError && (
                            <p className="text-red-500 text-sm mt-2">Error: {mutation.error.message}</p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
