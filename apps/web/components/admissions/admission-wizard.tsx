
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAdmissions } from '@/hooks/use-admissions';
import { usePincode } from '@/hooks/use-pincode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import { SuccessView } from '@/components/common/success-view';

// Zod Schemas
const identitySchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    aadhaarNo: z.string().length(12, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
    satsId: z.string().optional(),
    enrollmentNo: z.string().optional(),
});

const familySchema = z.object({
    guardianName: z.string().min(2, 'Guardian name is required'),
    guardianContact: z.string().min(10, 'Contact number must be at least 10 digits'),
    emergencyContactName: z.string().min(2, 'Emergency contact name required'),
    emergencyContactPhone: z.string().min(10, 'Emergency contact phone required'),
    religion: z.string().min(1, 'Religion is required'),
    casteCategory: z.string().min(1, 'Caste Category is required'),
});

const academicSchema = z.object({
    gender: z.string().min(1, 'Gender is required'),
    dob: z.string().min(1, 'Date of Birth is required'),
    bloodGroup: z.string().optional(),
    addressLine1: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    addressPincode: z.string().min(6, 'Pincode must be 6 digits'), // Smart Pincode
    previousSchool: z.string().optional(),
    gradeLevel: z.string().min(1, 'Grade Level is required'),
});

const documentsSchema = z.object({
    documents: z.array(z.string()).optional(), // Array of URLs
    // Add specific document types if needed, but array of strings is fine for now
});

// Combined Schema
const admissionSchema = identitySchema.merge(familySchema).merge(academicSchema).merge(documentsSchema).extend({
    admissionFee: z.number().min(0).optional(),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

const STEPS = [
    { id: 1, title: 'Identity', description: 'Student & Govt IDs' },
    { id: 2, title: 'Family', description: 'Guardian & Heritage' },
    { id: 3, title: 'Academic', description: 'Address & History' },
    { id: 4, title: 'Documents', description: 'Digital Proofs' },
];

export function AdmissionWizard() {
    const router = useRouter();
    const { createAdmission } = useAdmissions();
    const [step, setStep] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const [successData, setSuccessData] = useState<any>(null); // Store success details

    const form = useForm<AdmissionFormValues>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            aadhaarNo: '',
            satsId: '',
            enrollmentNo: '',
            guardianName: '',
            guardianContact: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            religion: '',
            casteCategory: '',
            gender: '',
            dob: '',
            bloodGroup: '',
            addressLine1: '',
            city: '',
            state: '',
            addressPincode: '',
            previousSchool: '',
            gradeLevel: '',
            documents: [],
            admissionFee: 500,
        },
        mode: 'onChange'
    });

    const watchedPincode = form.watch('addressPincode');
    const { data: pincodeData, isLoading: isPincodeLoading } = usePincode(watchedPincode);

    useEffect(() => {
        if (pincodeData && pincodeData.city) {
            form.setValue('city', pincodeData.city, { shouldValidate: true });
            form.setValue('state', pincodeData.state, { shouldValidate: true });
            toast.success(`Location detected: ${pincodeData.city}, ${pincodeData.state}`);
        }
    }, [pincodeData, form]);

    // Hydrate from LocalStorage
    useEffect(() => {
        setIsMounted(true);
        const savedData = localStorage.getItem('admission-wizard-draft-v2');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                form.reset(parsed);
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, [form]);

    // Save to LocalStorage on change
    useEffect(() => {
        if (!isMounted) return;
        const subscription = form.watch((value) => {
            localStorage.setItem('admission-wizard-draft-v2', JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [form, isMounted]);

    const handleNext = async () => {
        let isValid = false;
        if (step === 1) {
            // Identity: Name, Email, Aadhaar, SATS
            isValid = await form.trigger(['firstName', 'lastName', 'email', 'aadhaarNo', 'satsId', 'enrollmentNo']);
        } else if (step === 2) {
            // Family & Heritage: Guardian, Religion, Caste, Emergency
            isValid = await form.trigger(['guardianName', 'guardianContact', 'emergencyContactName', 'emergencyContactPhone', 'religion', 'casteCategory']);
        } else if (step === 3) {
            // Academic & Address: DOB, Gender, Address
            isValid = await form.trigger(['gender', 'dob', 'bloodGroup', 'addressLine1', 'city', 'state', 'addressPincode', 'gradeLevel', 'previousSchool']);
        } else if (step === 4) {
            // Documents
            isValid = true;
        }

        if (isValid) {
            if (step < STEPS.length) {
                setStep(s => s + 1);
            } else {
                // If on last step, submit
                form.handleSubmit(onSubmit)();
            }
        }
    };

    const handleBack = () => {
        setStep(s => s - 1);
    };

    const onSubmit = (data: AdmissionFormValues) => {
        createAdmission.mutate(data, {
            onSuccess: (responseData) => {
                toast.success("Student admitted successfully!");
                localStorage.removeItem('admission-wizard-draft-v2');
                setSuccessData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    id: responseData?.id || 'NEW-ID'
                });
            },
            onError: (error) => {
                toast.error(`Error: ${error.message}`);
            }
        });
    };

    if (!isMounted) return null;

    if (successData) {
        return (
            <SuccessView
                title="Admission Complete!"
                subtitle="The student has been successfully enrolled in the system."
                summaryItems={[
                    { label: 'Student Name', value: `${successData.firstName} ${successData.lastName}` },
                    { label: 'Class', value: form.getValues('gradeLevel') },
                    { label: 'Admission Fee', value: '$500.00 (Pending)' }
                ]}
                actionButtons={[
                    {
                        label: 'Admit Another Student',
                        onClick: () => {
                            setSuccessData(null);
                            setStep(1);
                            form.reset();
                        },
                        variant: 'outline'
                    },
                    {
                        label: 'View Student Profile',
                        onClick: () => router.push(`/students/${successData.id}`), // Navigate to new profile
                        variant: 'default'
                    }
                ]}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                {STEPS.map((s) => (
                    <div key={s.id} className={`flex flex-col items-center flex-1 relative`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 bg-white
                            ${step >= s.id ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-300'}
                            ${step > s.id ? 'bg-blue-600 text-white' : ''}
                        `}>
                            {step > s.id ? <Check size={20} /> : s.id}
                        </div>
                        <div className="text-sm mt-2 font-medium">{s.title}</div>
                        <div className="text-xs text-gray-500 hidden md:block">{s.description}</div>

                        {/* Connecting Line */}
                        {s.id !== STEPS.length && (
                            <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-0
                                ${step > s.id ? 'bg-blue-600' : 'bg-gray-200'}
                            `} />
                        )}
                    </div>
                ))}
            </div>

            <Card className="border-t-4 border-t-blue-600 shadow-lg">
                <CardHeader>
                    <CardTitle>{STEPS[step - 1].title}</CardTitle>
                    <CardDescription>{STEPS[step - 1].description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="admission-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input {...form.register('firstName')} placeholder="John" />
                                    {form.formState.errors.firstName && <p className="text-red-500 text-xs">{form.formState.errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input {...form.register('lastName')} placeholder="Doe" />
                                    {form.formState.errors.lastName && <p className="text-red-500 text-xs">{form.formState.errors.lastName.message}</p>}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Email Address</Label>
                                    <Input {...form.register('email')} type="email" placeholder="john.doe@school.edu" />
                                    {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label>Enrollment Number (Optional)</Label>
                                    <Input {...form.register('enrollmentNo')} placeholder="Auto-gen if blank" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Aadhaar No</Label>
                                    <Input {...form.register('aadhaarNo')} placeholder="12 digit UID" maxLength={12} />
                                </div>
                                <div className="space-y-2">
                                    <Label>SATS ID</Label>
                                    <Input {...form.register('satsId')} placeholder="State Student ID" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Guardian Name</Label>
                                        <Input {...form.register('guardianName')} placeholder="Parent Name" />
                                        {form.formState.errors.guardianName && <p className="text-red-500 text-xs">{form.formState.errors.guardianName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Guardian Contact</Label>
                                        <Input {...form.register('guardianContact')} placeholder="+91 99999 99999" />
                                        {form.formState.errors.guardianContact && <p className="text-red-500 text-xs">{form.formState.errors.guardianContact.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Emergency Contact Name</Label>
                                        <Input {...form.register('emergencyContactName')} placeholder="Relative/Neighbor" />
                                        {form.formState.errors.emergencyContactName && <p className="text-red-500 text-xs">{form.formState.errors.emergencyContactName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Emergency Phone</Label>
                                        <Input {...form.register('emergencyContactPhone')} placeholder="+91 88888 88888" />
                                        {form.formState.errors.emergencyContactPhone && <p className="text-red-500 text-xs">{form.formState.errors.emergencyContactPhone.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Religion</Label>
                                        <Input {...form.register('religion')} placeholder="Hindu/Muslim/Christian/etc" />
                                        {form.formState.errors.religion && <p className="text-red-500 text-xs">{form.formState.errors.religion.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Caste Category</Label>
                                        <select {...form.register('casteCategory')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="">Select...</option>
                                            <option value="GM">General Merit (GM)</option>
                                            <option value="SC">Scheduled Caste (SC)</option>
                                            <option value="ST">Scheduled Tribe (ST)</option>
                                            <option value="OBC">Other Backward Class</option>
                                        </select>
                                        {form.formState.errors.casteCategory && <p className="text-red-500 text-xs">{form.formState.errors.casteCategory.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <Input {...form.register('dob')} type="date" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <select {...form.register('gender')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                            <option value="">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Blood Group</Label>
                                        <Input {...form.register('bloodGroup')} placeholder="O+" />
                                    </div>

                                    <div className="col-span-full space-y-2">
                                        <Label>Address Line 1</Label>
                                        <Input {...form.register('addressLine1')} placeholder="123 Main St" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>City</Label>
                                        <Input {...form.register('city')} placeholder="New York" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>State</Label>
                                        <Input {...form.register('state')} placeholder="NY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Pincode</Label>
                                        <div className="relative">
                                            <Input {...form.register('addressPincode')} placeholder="560001" maxLength={6} />
                                            {isPincodeLoading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                                        </div>
                                    </div>

                                    <div className="col-span-full space-y-2 border-t pt-4">
                                        <Label>Previous School (Optional)</Label>
                                        <Input {...form.register('previousSchool')} placeholder="Previous Academy Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Grade Level</Label>
                                        <select {...form.register('gradeLevel')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="">Select Class...</option>
                                            <option value="Class 1">Class 1</option>
                                            <option value="Class 10">Class 10</option>
                                            <option value="PUC I">PUC I</option>
                                            <option value="PUC II">PUC II</option>
                                        </select>
                                        {form.formState.errors.gradeLevel && <p className="text-red-500 text-xs">{form.formState.errors.gradeLevel.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}



                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700">Required Documents</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FileUpload
                                            label="Upload Birth Certificate"
                                            onUploadComplete={(url) => console.log('Birth Cert:', url)}
                                        />
                                        <FileUpload
                                            label="Upload Transfer Certificate"
                                            onUploadComplete={(url) => console.log('TC:', url)}
                                        />
                                        <FileUpload
                                            label="Upload Photo ID"
                                            onUploadComplete={(url) => console.log('ID:', url)}
                                        />
                                        <FileUpload
                                            label="Upload Previous Report Card"
                                            onUploadComplete={(url) => console.log('Report:', url)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded border border-yellow-200">
                                        Note: Documents are uploaded immediately. Please ensure you have the correct files.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6">
                                <div className="rounded-lg bg-neutral-50 p-4 space-y-3 border">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">Summary</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-medium text-right">{form.getValues('firstName')} {form.getValues('lastName')}</span>

                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium text-right">{form.getValues('email')}</span>

                                        <span className="text-gray-500">Address:</span>
                                        <span className="font-medium text-right">{form.getValues('city')}, {form.getValues('state')}</span>

                                        <span className="text-gray-500">Guardian:</span>
                                        <span className="font-medium text-right">{form.getValues('guardianName')}</span>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                                    <h3 className="font-semibold text-blue-900 flex justify-between items-center">
                                        Admission Fee
                                        <span className="text-xl">$500.00</span>
                                    </h3>
                                    <p className="text-xs text-blue-700 mt-1">This fee will be posted to the student's ledger immediately upon admission.</p>
                                </div>
                            </div>
                        )}

                    </form>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {step < 5 ? (
                        <Button onClick={handleNext}>
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={createAdmission.isPending}>
                            {createAdmission.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                            Confirm Admission
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
