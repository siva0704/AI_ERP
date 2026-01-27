'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAdmissions } from '@/hooks/use-admissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Check, Loader2, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { KARNATAKA_SUBJECT_MAP } from '@/config/academic-standards';


// --- Zod Schemas ---

const identitySchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    dob: z.string().min(1, 'Date of Birth is required'),
    gender: z.string().min(1, 'Gender is required'),
    religion: z.string().min(1, 'Religion is required'),
    casteCategory: z.string().min(1, 'Caste Category is required'),
    aadhaarNo: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, 'Aadhaar must be formatted as XXXX-XXXX-XXXX'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
});

const addressSchema = z.object({
    addressPincode: z.string().length(6, 'Pincode must be 6 digits'),
    city: z.string().min(2, 'City is required'),
    district: z.string().min(2, 'District is required'),
    state: z.string().min(2, 'State is required'),
    addressLine1: z.string().min(5, 'Address is required'),
});

const academicSchema = z.object({
    gradeLevel: z.string().min(1, 'Class is required'),
    previousSchool: z.string().optional(),
    subjects: z.array(z.string()).min(1, 'At least one subject must be selected'),
});

const documentsSchema = z.object({
    tcUrl: z.string().min(1, 'Transfer Certificate is required'),
    aadhaarUrl: z.string().min(1, 'Aadhaar Scan is required'),
});

const admissionSchema = identitySchema.merge(addressSchema).merge(academicSchema).merge(documentsSchema);

type AdmissionFormValues = z.infer<typeof admissionSchema>;

const STEPS = [
    { id: 1, title: 'Identity', description: 'Personal & Aadhaar' },
    { id: 2, title: 'Address', description: 'Location Details' },
    { id: 3, title: 'Academic', description: 'Class & Subjects' },
    { id: 4, title: 'Documents', description: 'Upload Proofs' },
];

export function AdmissionWizardV2() {
    const router = useRouter();
    const { createAdmission } = useAdmissions();
    const [step, setStep] = useState(1);
    const [isMounted, setIsMounted] = useState(false);

    const form = useForm<AdmissionFormValues>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            firstName: '', lastName: '', dob: '', gender: '', religion: '', casteCategory: '', aadhaarNo: '', email: '',
            addressPincode: '', city: '', district: '', state: '', addressLine1: '',
            gradeLevel: '', previousSchool: '', subjects: [],
            tcUrl: '', aadhaarUrl: ''
        },
        mode: 'onChange'
    });

    const watchedPincode = useWatch({ control: form.control, name: 'addressPincode' });
    const watchedGradeLevel = useWatch({ control: form.control, name: 'gradeLevel' });

    useEffect(() => { setIsMounted(true); }, []);

    // --- Smart Logic: Aadhaar Formatting ---
    const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (val.length > 12) val = val.slice(0, 12);

        // Add dashes
        if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4);
        if (val.length > 9) val = val.slice(0, 9) + '-' + val.slice(9);

        form.setValue('aadhaarNo', val, { shouldValidate: true });
    };

    // --- Smart Logic: Address ---
    useEffect(() => {
        if (watchedPincode?.length === 6) {
            // Mock Logic
            form.setValue('state', 'Karnataka');
            form.setValue('district', 'Bangalore Urban'); // Default for demo
            form.setValue('city', 'Bangalore');         // Default for demo
            toast.success("State detected: Karnataka");
        }
    }, [watchedPincode, form]);

    // --- Smart Logic: Academic Defaults ---
    useEffect(() => {
        if (watchedGradeLevel && KARNATAKA_SUBJECT_MAP[watchedGradeLevel]) {
            const defaults = KARNATAKA_SUBJECT_MAP[watchedGradeLevel];
            form.setValue('subjects', defaults);
            toast.info(`Auto-selected ${defaults.length} subjects for ${watchedGradeLevel}`);
        }
    }, [watchedGradeLevel, form]);

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ['firstName', 'lastName', 'dob', 'gender', 'religion', 'casteCategory', 'aadhaarNo'];
        if (step === 2) fieldsToValidate = ['addressPincode', 'city', 'district', 'state', 'addressLine1'];
        if (step === 3) fieldsToValidate = ['gradeLevel', 'subjects'];
        if (step === 4) fieldsToValidate = ['tcUrl', 'aadhaarUrl'];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(s => Math.min(s + 1, STEPS.length + 1)); // +1 for Summary
    };

    const onSubmit = (data: AdmissionFormValues) => {
        createAdmission.mutate(data, {
            onSuccess: () => {
                toast.success("Admission Successful!");
                router.push('/admissions');
            },
            onError: (err) => toast.error(err.message)
        });
    };

    // --- Dropzone Logic ---
    const handleFileUpload = async (file: File, field: 'tcUrl' | 'aadhaarUrl') => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            form.setValue(field, data.filePath, { shouldValidate: true });
            toast.success("File uploaded!");
        } catch (e) {
            toast.error("Upload failed");
            console.error(e);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="max-w-4xl mx-auto py-8 font-sans">
            {/* Stepper UI */}
            <div className="flex justify-between items-center mb-8 px-4">
                {STEPS.map((s) => (
                    <div key={s.id} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 
                            ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {step > s.id ? <Check size={16} /> : s.id}
                        </div>
                        <span className="text-xs mt-2 font-medium">{s.title}</span>
                        {s.id !== STEPS.length && (
                            <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 
                                ${step > s.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            <Card className="border-t-4 border-t-blue-600 shadow-xl">
                <CardHeader>
                    <CardTitle>{step <= STEPS.length ? STEPS[step - 1].title : 'Review & Submit'}</CardTitle>
                    <CardDescription>{step <= STEPS.length ? STEPS[step - 1].description : 'Please verify all details'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Step 1: Identity */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input {...form.register('firstName')} placeholder="Student Name" />
                                    {form.formState.errors.firstName && <span className="text-red-500 text-xs">{form.formState.errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input {...form.register('lastName')} placeholder="Surname" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input {...form.register('dob')} type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <select {...form.register('gender')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Aadhaar No (Auto-Formatted)</Label>
                                    <Input
                                        value={form.watch('aadhaarNo')}
                                        onChange={handleAadhaarChange}
                                        placeholder="XXXX-XXXX-XXXX"
                                        maxLength={14}
                                        autoComplete="off" // Prevent CC autofill
                                        name="aadhaar_input_field" // Obfuscate name
                                    />
                                    {form.formState.errors.aadhaarNo && <span className="text-red-500 text-xs">{form.formState.errors.aadhaarNo.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Religion</Label>
                                    <Input {...form.register('religion')} placeholder="Hindu, Muslim, etc." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Caste Category</Label>
                                    <select {...form.register('casteCategory')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="">Select...</option>
                                        <option value="GM">General Merit (GM)</option>
                                        <option value="SC">SC</option>
                                        <option value="ST">ST</option>
                                        <option value="OBC">OBC</option>
                                        <option value="CAT1">Cat-1</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Address */}
                        {step === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Pincode (Auto-State)</Label>
                                    <Input {...form.register('addressPincode')} maxLength={6} placeholder="560001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input {...form.register('state')} readOnly className="bg-gray-100" />
                                </div>
                                <div className="space-y-2">
                                    <Label>District</Label>
                                    <Input {...form.register('district')} />
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input {...form.register('city')} />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <Label>Address Line 1</Label>
                                    <Input {...form.register('addressLine1')} />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Academic */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Class Selection (Auto-Selects Subjects)</Label>
                                    <select {...form.register('gradeLevel')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="">Select Class...</option>
                                        {Object.keys(KARNATAKA_SUBJECT_MAP).map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>

                                {watchedGradeLevel && (
                                    <div className="p-4 bg-gray-50 rounded-lg border">
                                        <Label className="mb-2 block">Subjects</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {form.watch('subjects')?.map((sub: string) => (
                                                <div key={sub} className="flex items-center space-x-2">
                                                    <Check className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm">{sub}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Documents */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['tcUrl', 'aadhaarUrl'].map((field) => (
                                        <div key={field} className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative">
                                            {form.watch(field as any) ? (
                                                <div className="text-green-600 flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-medium text-sm">Uploaded Successfully</span>
                                                    <span className="text-xs text-gray-400 mt-1">{field === 'tcUrl' ? 'Transfer Cert' : 'Aadhaar Scan'}</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                                                    <span className="text-sm font-medium text-gray-700 mb-1">
                                                        {field === 'tcUrl' ? 'Upload Transfer Certificate' : 'Upload Aadhaar Scan'}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mb-4">Drag & drop or click (PDF/JPG, Max 5MB)</span>
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], field as any);
                                                        }}
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary Step */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center">
                                    <h3 className="text-xl font-bold text-green-900 mb-2">Ready to Admit</h3>
                                    <p className="text-green-700">Please review the details below before confirming.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm p-4 border rounded-lg">
                                    <span className="text-gray-500">Name:</span> <span className="font-medium text-right">{form.getValues('firstName')} {form.getValues('lastName')}</span>
                                    <span className="text-gray-500">Aadhaar:</span> <span className="font-medium text-right">{form.getValues('aadhaarNo')}</span>
                                    <span className="text-gray-500">Class:</span> <span className="font-medium text-right">{form.getValues('gradeLevel')}</span>
                                    <span className="text-gray-500">Address:</span> <span className="font-medium text-right">{form.getValues('city')}, {form.getValues('state')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6 bg-gray-50/50">
                    {step > 1 && (
                        <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    )}
                    <div className="ml-auto">
                        {step < 5 ? (
                            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={form.handleSubmit(onSubmit)} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                                <Check className="w-4 h-4 mr-2" /> Confirm Admission
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
