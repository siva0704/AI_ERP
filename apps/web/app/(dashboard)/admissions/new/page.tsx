'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Using our new card component

const admissionSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    enrollmentNo: z.string().min(3, 'Enrollment No is required'),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

export default function NewAdmissionPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const form = useForm<AdmissionFormValues>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            enrollmentNo: '',
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: AdmissionFormValues) => {
            const res = await fetch('http://localhost:3001/api/admissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Failed to create admission');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            router.push('/admissions');
        },
    });

    const onSubmit = (data: AdmissionFormValues) => {
        mutation.mutate(data);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>New Student Admission</CardTitle>
                    <CardDescription>Enter student details to enroll them in the current branch.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">First Name</label>
                                <input
                                    {...form.register('firstName')}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="John"
                                />
                                {form.formState.errors.firstName && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Last Name</label>
                                <input
                                    {...form.register('lastName')}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Doe"
                                />
                                {form.formState.errors.lastName && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <input
                                {...form.register('email')}
                                type="email"
                                className="w-full p-2 border rounded-md"
                                placeholder="john.doe@example.com"
                            />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Enrollment Number</label>
                            <input
                                {...form.register('enrollmentNo')}
                                className="w-full p-2 border rounded-md"
                                placeholder="ADM-2024-001"
                            />
                            {form.formState.errors.enrollmentNo && (
                                <p className="text-red-500 text-sm">{form.formState.errors.enrollmentNo.message}</p>
                            )}
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
                                {mutation.isPending ? 'Submitting...' : 'Admit Student'}
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
