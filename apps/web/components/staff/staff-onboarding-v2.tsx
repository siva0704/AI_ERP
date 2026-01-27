'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, UploadCloud, ChevronLeft, ChevronRight, User, Truck, Shield, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

// --- Zod Schemas ---

const baseSchema = z.object({
    firstName: z.string().min(2, 'First Name is required'),
    lastName: z.string().min(2, 'Last Name is required'),
    email: z.string().email('Invalid email'),
    role: z.enum(['TEACHER', 'DRIVER', 'ADMIN', 'SUPPORT']),

    // Compliance (Universal)
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN Format (ABCDE1234F)'),
    bankAccountNo: z.string().min(8, 'Account info required'),
    bankIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC Code'),
    epfNumber: z.string().optional(),

    emergencyContactName: z.string().min(2, 'Emergency contact required'),
    emergencyContactPhone: z.string().min(10, 'Valid phone required'),
});

// Teacher Specifics
const teacherSchema = z.object({
    role: z.literal('TEACHER'),
    qualification: z.string().min(2, 'Qualification is required'),
    experienceYears: z.number().min(0),
});

// Driver Specifics
const driverSchema = z.object({
    role: z.literal('DRIVER'),
    licenseNumber: z.string().min(5, 'License Number is required'),
    badgeNumber: z.string().min(3, 'Badge Number is required'),
    licenseExpiry: z.string().refine((val) => new Date(val) > new Date(), {
        message: 'License has expired!',
    }),
});

// Admin/Support (No extra fields for now)
const otherRoleSchema = z.object({
    role: z.enum(['ADMIN', 'SUPPORT']),
});

// Discriminated Union
const staffSchema = z.discriminatedUnion('role', [
    baseSchema.merge(teacherSchema),
    baseSchema.merge(driverSchema),
    baseSchema.merge(otherRoleSchema),
]);

type StaffFormValues = z.infer<typeof staffSchema>;

const ROLES = [
    { id: 'TEACHER', label: 'Teacher', icon: User, color: 'bg-blue-100 text-blue-600' },
    { id: 'DRIVER', label: 'Driver', icon: Truck, color: 'bg-orange-100 text-orange-600' },
    { id: 'ADMIN', label: 'Admin', icon: Shield, color: 'bg-purple-100 text-purple-600' },
    { id: 'SUPPORT', label: 'Support', icon: HelpCircle, color: 'bg-gray-100 text-gray-600' },
];

export function StaffOnboardingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            role: 'TEACHER',
            firstName: '', lastName: '', email: '',
            panNumber: '', bankAccountNo: '', bankIfsc: '', epfNumber: '',
            qualification: '', experienceYears: 0,
            licenseNumber: '', badgeNumber: '', licenseExpiry: '',
            emergencyContactName: '', emergencyContactPhone: ''
        },
        mode: 'onChange'
    });

    const watchedRole = useWatch({ control: form.control, name: 'role' });

    // --- Auto-Uppercaser Logic ---
    const handleCapitalize = (field: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setValue(field, e.target.value.toUpperCase(), { shouldValidate: true });
    };

    const onSubmit = async (data: StaffFormValues) => {
        try {
            // Clean up ghost fields before sending?
            // Zod discriminated union helps, but form state might hold extra data.
            // Actually, we can just send `data`, backend should filter or we filter here.
            // Filters based on Role logic:
            const cleanData = { ...data };
            if (cleanData.role !== 'DRIVER') {
                delete (cleanData as any).licenseNumber;
                delete (cleanData as any).badgeNumber;
                delete (cleanData as any).licenseExpiry;
            }
            if (cleanData.role !== 'TEACHER') {
                delete (cleanData as any).qualification;
                delete (cleanData as any).experienceYears;
            }

            const res = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-branch-id': 'branch-101' // Hardcoded for Phase 20, usually from context/cookie
                },
                body: JSON.stringify(cleanData)
            });

            if (!res.ok) throw new Error('Failed to create staff');

            toast.success("Staff Onboarded Successfully!");
            router.push('/staff');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const nextStep = async () => {
        const isValid = await form.trigger(); // Trigger all for now, simplified
        if (isValid) setStep(2);
    };

    return (
        <div className="max-w-3xl mx-auto py-8 font-sans">
            <Card className="border-t-4 border-t-purple-600 shadow-xl">
                <CardHeader>
                    <CardTitle>New Staff Onboarding</CardTitle>
                    <CardDescription>Role-based access and compliance setup.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Role Selector Toggle */}
                        <div className="grid grid-cols-4 gap-4">
                            {ROLES.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => form.setValue('role', r.id as any)}
                                    className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center transition-all
                                        ${watchedRole === r.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}
                                    `}
                                >
                                    <div className={`p-2 rounded-full mb-2 ${r.color}`}>
                                        <r.icon size={24} />
                                    </div>
                                    <span className="text-sm font-semibold">{r.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input {...form.register('firstName')} placeholder="Jane" />
                                    {form.formState.errors.firstName && <span className="text-red-500 text-xs">{form.formState.errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input {...form.register('lastName')} placeholder="Doe" />
                                    {form.formState.errors.lastName && <span className="text-red-500 text-xs">{form.formState.errors.lastName.message}</span>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Email</Label>
                                    <Input {...form.register('email')} placeholder="jane.doe@school.edu" />
                                    {form.formState.errors.email && <span className="text-red-500 text-xs">{form.formState.errors.email.message}</span>}
                                </div>
                            </div>

                            {/* Conditional Blocks */}
                            {watchedRole === 'TEACHER' && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="font-semibold text-blue-900 flex items-center">
                                        <User className="w-4 h-4 mr-2" /> Academic Credentials
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Qualification</Label>
                                            <select {...form.register('qualification')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option value="">Select...</option>
                                                <option value="B.Ed">B.Ed</option>
                                                <option value="M.Sc">M.Sc</option>
                                                <option value="PhD">PhD</option>
                                                <option value="MA">MA</option>
                                            </select>
                                            {(form.formState.errors as any).qualification && <span className="text-red-500 text-xs">{(form.formState.errors as any).qualification.message}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Experience (Years)</Label>
                                            <Input {...form.register('experienceYears', { valueAsNumber: true })} type="number" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {watchedRole === 'DRIVER' && (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <h3 className="font-semibold text-orange-900 flex items-center">
                                        <Truck className="w-4 h-4 mr-2" /> Transport Compliance
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 md:col-span-1 space-y-2">
                                            <Label>Driving License No</Label>
                                            <Input {...form.register('licenseNumber')} placeholder="DL-1420110012345" />
                                            {(form.formState.errors as any).licenseNumber && <span className="text-red-500 text-xs">{(form.formState.errors as any).licenseNumber.message}</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Badge Number</Label>
                                            <Input {...form.register('badgeNumber')} placeholder="BG-1234" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>License Expiry</Label>
                                            <Input {...form.register('licenseExpiry')} type="date" min={new Date().toISOString().split('T')[0]} />
                                            {(form.formState.errors as any).licenseExpiry && <span className="text-red-500 text-xs">{(form.formState.errors as any).licenseExpiry.message}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Compliance Block (Always Visible) */}
                            <div className="bg-neutral-50 p-4 rounded-lg border space-y-4">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <Shield className="w-4 h-4 mr-2" /> Statutory & Payroll
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>PAN Number (Auto-Upper)</Label>
                                        <Input
                                            {...form.register('panNumber')}
                                            onChange={handleCapitalize('panNumber')}
                                            placeholder="ABCDE1234F"
                                            maxLength={10}
                                        />
                                        {form.formState.errors.panNumber && <span className="text-red-500 text-xs">{form.formState.errors.panNumber.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>EPF Number (Optional)</Label>
                                        <Input {...form.register('epfNumber')} placeholder="PF1234567" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bank Account No</Label>
                                        <Input {...form.register('bankAccountNo')} />
                                        {form.formState.errors.bankAccountNo && <span className="text-red-500 text-xs">{form.formState.errors.bankAccountNo.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>IFSC Code</Label>
                                        <Input
                                            {...form.register('bankIfsc')}
                                            onChange={handleCapitalize('bankIfsc')}
                                            placeholder="SBIN0001234"
                                            maxLength={11}
                                        />
                                        {form.formState.errors.bankIfsc && <span className="text-red-500 text-xs">{form.formState.errors.bankIfsc.message}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 p-4 rounded-lg border space-y-4">
                                <h3 className="font-semibold text-gray-900">Emergency Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Contact Name</Label>
                                        <Input {...form.register('emergencyContactName')} />
                                        {form.formState.errors.emergencyContactName && <span className="text-red-500 text-xs">{form.formState.errors.emergencyContactName.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Contact Phone</Label>
                                        <Input {...form.register('emergencyContactPhone')} />
                                        {form.formState.errors.emergencyContactPhone && <span className="text-red-500 text-xs">{form.formState.errors.emergencyContactPhone.message}</span>}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                                <Check className="w-4 h-4 mr-2" /> Onboard Staff Member
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
