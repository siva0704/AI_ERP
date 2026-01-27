'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Upload, Search } from 'lucide-react';
import { toast } from 'sonner';

// --- Validation Schemas (Zod) ---
// Will break down by steps later or reuse a big schema

const admissionSchema = z.object({
    // Frame 1
    boardType: z.enum(['CBSE', 'ICSE', 'STATE', 'IB', 'IGCSE']),
    institutionType: z.enum(['PRIMARY', 'HIGH_SCHOOL', 'PUC']),
    firstName: z.string().min(2, 'Name required'),
    lastName: z.string().min(1, 'Last name required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dob: z.string().refine((date) => new Date(date) < new Date(), 'Invalid DOB'),

    // Frame 2
    aadhaarNo: z.string().optional(), // regex later
    satsId: z.string().optional(),
    nationality: z.string().default('Indian'),
    motherTongue: z.string().optional(),
    casteCategory: z.string().optional(),
    religion: z.string().optional(),
    bloodGroup: z.string().optional(),

    // Frame 3
    gradeLevel: z.string().min(1, 'Class required'),
    section: z.string().optional(),
    secondLanguage: z.string().optional(),
    subjects: z.array(z.string()).optional(),

    // Frame 4
    guardianName: z.string().min(2, 'Guardian Name required'),
    guardianRelation: z.string().optional(),
    mobileNumber: z.string().min(10, 'Valid mobile required'),
    email: z.string().email().optional().or(z.literal('')),
    pincode: z.string().min(6, 'Valid Pincode required'),
    address: z.string().min(10, 'Address required'),
    city: z.string().optional(),
    district: z.string().optional(),

    // Frame 5
    documents: z.array(z.string()).optional(), // Array of document IDs
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

export default function GenesisAdmissionWizard() {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const form = useForm<AdmissionFormValues>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            boardType: 'STATE',
            institutionType: 'HIGH_SCHOOL',
            nationality: 'Indian',
            gradeLevel: '10',
            section: 'A',
        },
        mode: 'onChange'
    });

    const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = form;
    const formData = watch();

    // --- Step Content ---

    const nextStep = async () => {
        // Validate current step fields before moving? 
        // For now, allow navigation to simulate "Focus Mode" flow
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const onSubmit: SubmitHandler<AdmissionFormValues> = async (data) => {
        console.log('Submitting:', data);
        // Optimistic Save Logic Here
        toast.success("Admission Initialized", { description: "Syncing with Genesis Core..." });

        try {
            const res = await fetch('/api/admissions', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                toast.success("Admission Confirmed!", { description: `Student ${data.firstName} added.` });
                // Redirect logic
            } else {
                toast.error("Admission Failed");
            }
        } catch (e) {
            toast.error("Network Error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            {/* Header / Progress */}
            <div className="border-b bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        GA
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Genesis Admission</h1>
                        <div className="text-xs text-gray-500 flex space-x-2">
                            <span>Draft</span>
                            <span>•</span>
                            <span>Step {step} of {totalSteps}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Stepper Visual */}
                <div className="hidden md:flex space-x-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`h-2 w-16 rounded-full transition-all ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="flex space-x-2">
                    <Button variant="ghost" onClick={() => { }}>Cancel</Button>
                    <Button variant="outline" onClick={() => { }}>Save Draft</Button>
                </div>
            </div>

            {/* Main Content - Focus Mode */}
            <div className="flex-1 flex justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-3xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold tracking-tight">Identity & Board Selection</h2>
                                            <p className="text-muted-foreground">Define the academic track and basic student identity.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Board Type</Label>
                                                <Select onValueChange={(val) => setValue('boardType', val as any)} defaultValue={formData.boardType}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Board" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CBSE">CBSE</SelectItem>
                                                        <SelectItem value="ICSE">ICSE</SelectItem>
                                                        <SelectItem value="STATE">State Board (Karnataka)</SelectItem>
                                                        <SelectItem value="IB">IB</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Institution Type</Label>
                                                <RadioGroup
                                                    onValueChange={(val) => setValue('institutionType', val as any)}
                                                    defaultValue={formData.institutionType}
                                                    className="flex space-x-4"
                                                >
                                                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                                                        <RadioGroupItem value="PRIMARY" id="r1" />
                                                        <Label htmlFor="r1" className="cursor-pointer">Primary</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50">
                                                        <RadioGroupItem value="HIGH_SCHOOL" id="r2" />
                                                        <Label htmlFor="r2" className="cursor-pointer">High School</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>First Name</Label>
                                                <Input {...register('firstName')} placeholder="Student First Name" className="text-lg" />
                                                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Last Name</Label>
                                                <Input {...register('lastName')} placeholder="Surname" className="text-lg" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Gender</Label>
                                                <div className="flex space-x-2">
                                                    {['MALE', 'FEMALE', 'OTHER'].map(g => (
                                                        <div
                                                            key={g}
                                                            onClick={() => setValue('gender', g as any)}
                                                            className={`flex-1 border rounded-md p-3 text-center cursor-pointer transition-all ${formData.gender === g ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
                                                        >
                                                            {g}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date of Birth</Label>
                                                <Input type="date" {...register('dob')} />
                                                {/* Age verification logic warning can go here */}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold tracking-tight">Compliance & Demographics</h2>
                                            <p className="text-muted-foreground">Required for State & Board Compliance.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Aadhaar Number</Label>
                                                <Input {...register('aadhaarNo')} placeholder="XXXX-XXXX-XXXX" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>SATS ID</Label>
                                                <Input {...register('satsId')} placeholder="State Tracking ID" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label>Religion</Label>
                                                <Select onValueChange={(val) => setValue('religion', val)} defaultValue={formData.religion}>
                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="HINDU">Hindu</SelectItem>
                                                        <SelectItem value="MUSLIM">Muslim</SelectItem>
                                                        <SelectItem value="CHRISTIAN">Christian</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Caste Category</Label>
                                                <Select onValueChange={(val) => setValue('casteCategory', val)} defaultValue={formData.casteCategory}>
                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="GM">GM</SelectItem>
                                                        <SelectItem value="SC">SC</SelectItem>
                                                        <SelectItem value="ST">ST</SelectItem>
                                                        <SelectItem value="OBC">OBC</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Mother Tongue</Label>
                                                <Select onValueChange={(val) => setValue('motherTongue', val)} defaultValue={formData.motherTongue}>
                                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="KANNADA">Kannada</SelectItem>
                                                        <SelectItem value="ENGLISH">English</SelectItem>
                                                        <SelectItem value="HINDI">Hindi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold tracking-tight">Academic Placement</h2>
                                            <p className="text-muted-foreground">Smart Default Engine active.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Class / Standard</Label>
                                                <Select onValueChange={(val) => setValue('gradeLevel', val)} defaultValue={formData.gradeLevel}>
                                                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                                    <SelectContent>
                                                        {[...Array(10)].map((_, i) => (
                                                            <SelectItem key={i} value={`${i + 1}`}>{i + 1}th Standard</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Section</Label>
                                                <Select onValueChange={(val) => setValue('section', val)} defaultValue={formData.section}>
                                                    <SelectTrigger><SelectValue placeholder="A" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A">Section A</SelectItem>
                                                        <SelectItem value="B">Section B</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2 bg-blue-50 p-4 rounded-md border border-blue-100">
                                            <Label className="text-blue-800 font-semibold">Auto-Selected Subjects (Smart Logic)</Label>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {['Mathematics', 'Science', 'Social Science', 'English (L1)'].map(sub => (
                                                    <div key={sub} className="flex items-center space-x-2">
                                                        <Check className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm text-blue-900">{sub}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Second Language Preference</Label>
                                            <RadioGroup
                                                onValueChange={(val) => setValue('secondLanguage', val)}
                                                defaultValue={formData.secondLanguage}
                                                className="flex space-x-4"
                                            >
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="KANNADA" id="sl1" /><Label htmlFor="sl1">Kannada</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="HINDI" id="sl2" /><Label htmlFor="sl2">Hindi</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="SANSKRIT" id="sl3" /><Label htmlFor="sl3">Sanskrit</Label></div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold tracking-tight">Contact & Geography</h2>
                                            <p className="text-muted-foreground">Communication details.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Guardian Name</Label>
                                                <Input {...register('guardianName')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Mobile Number</Label>
                                                <Input {...register('mobileNumber')} placeholder="9876543210" maxLength={10} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label>Pincode</Label>
                                                <div className="relative">
                                                    <Input {...register('pincode')} placeholder="560066" maxLength={6} onChange={(e) => {
                                                        setValue('pincode', e.target.value);
                                                        if (e.target.value.length === 6) {
                                                            toast.info("Auto-fetching City...");
                                                            setValue('city', 'Bangalore'); // Mock
                                                            setValue('district', 'Bangalore Urban');
                                                            setValue('address', 'Whitefield');
                                                        }
                                                    }} />
                                                    <div className="absolute right-3 top-2.5 text-xs text-gray-400">Auto</div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>City</Label>
                                                <Input {...register('city')} readOnly className="bg-gray-50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>District</Label>
                                                <Input {...register('district')} readOnly className="bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Full Address</Label>
                                            <Input {...register('address')} placeholder="#123, Street Name..." />
                                        </div>
                                    </div>
                                )}

                                {step === 5 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold tracking-tight">Document Vault</h2>
                                            <p className="text-muted-foreground">Drag & Drop necessary documents.</p>
                                        </div>

                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-all cursor-pointer">
                                            <Upload className="h-10 w-10 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium">Drag files here or click to upload</h3>
                                            <p className="text-sm text-gray-500 mt-2">Supports PDF, JPG, PNG (Max 5MB)</p>
                                            <Button variant="secondary" className="mt-6">Browse Files</Button>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Required Documents</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {['Transfer Certificate', 'Aadhaar Card', 'Previous Marks Card', 'Passport Photo'].map(doc => (
                                                    <div key={doc} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                                        <span className="text-sm font-medium">{doc}</span>
                                                        <div className="h-2 w-2 rounded-full bg-red-400" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Navigation */}
                        <div className="flex justify-between pt-6 border-t mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="w-32"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back
                            </Button>

                            {step === totalSteps ? (
                                <Button
                                    type="submit"
                                    className="w-48 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={!isValid}
                                >
                                    Complete Admission <Check className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-32 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
