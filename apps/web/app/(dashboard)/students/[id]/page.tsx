
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// import { Timeline } from '@/components/ui/timeline'; // Todo: Create or use a simple list
import { FileText, Users, Activity, Clock, Download, Share2, DollarSign, Mail, Phone, MapPin } from 'lucide-react';

interface StudentProfile {
    id: string;
    firstName: string;
    lastName: string;
    enrollmentNo: string;
    gradeLevel: string;
    status: string;
    email: string;
    contact?: string;
    address?: {
        city: string;
        state: string;
    };
    guardian?: {
        name: string;
        contact: string;
        relation?: string;
    };
    documents?: { title: string; type: string; url: string; date: string }[];
    feeBalance: number;
    attendancePercentage: number;
}

export default function StudentProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const [student, setStudent] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock Fetch Concept
        // In real apps, fetch /api/students/:id
        setTimeout(() => {
            setStudent({
                id,
                firstName: 'John',
                lastName: 'Doe',
                enrollmentNo: 'ENR-2024-001',
                gradeLevel: 'Class 10',
                status: 'ACTIVE',
                email: 'john.doe@example.com',
                contact: '+91 98765 43210',
                address: {
                    city: 'Hubballi',
                    state: 'Karnataka'
                },
                guardian: {
                    name: 'Robert Doe',
                    contact: '+91 99887 76655',
                    relation: 'Father'
                },
                documents: [
                    { title: 'Aadhaar Card', type: 'ID', url: '#', date: '2024-01-20' },
                    { title: 'Transfer Certificate', type: 'Academic', url: '#', date: '2024-01-20' },
                ],
                feeBalance: 2500,
                attendancePercentage: 92
            });
            setLoading(false);
        }, 800);
    }, [id]);

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!student) return <div className="p-8 text-center">Student not found</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header / 360 Summary */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`} />
                            <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{student.firstName} {student.lastName}</h1>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {student.gradeLevel}
                                </Badge>
                                <span>•</span>
                                <span className="font-mono text-xs">{student.enrollmentNo}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <Card className="flex-1 md:w-32 bg-green-50 border-green-100 shadow-none">
                            <CardContent className="p-3 text-center">
                                <div className="text-xs text-green-600 font-medium uppercase tracking-wider">Attendance</div>
                                <div className="text-xl font-bold text-green-800">{student.attendancePercentage}%</div>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 md:w-32 bg-red-50 border-red-100 shadow-none">
                            <CardContent className="p-3 text-center">
                                <div className="text-xs text-red-600 font-medium uppercase tracking-wider">Dues</div>
                                <div className="text-xl font-bold text-red-800">${student.feeBalance}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" /> Message
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                            <DollarSign className="w-4 h-4 mr-2" /> Collect Fee
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="academic">Academic</TabsTrigger>
                    <TabsTrigger value="fees">Fee Ledger</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                </TabsList>

                {/* Tab A: Overview */}
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal & Compliance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">Identity</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-500">Full Name</div>
                                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Gender</div>
                                            <div className="font-medium">Male</div> {/* Mocked until fetched */}
                                        </div>
                                        <div>
                                            <div className="text-gray-500">DOB</div>
                                            <div className="font-medium">12 Oct 2008</div> {/* Mocked */}
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Blood Group</div>
                                            <div className="font-medium">O+</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">Compliance</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-500">Aadhaar No.</div>
                                            <div className="font-medium font-mono">****-****-1234</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">SATS ID</div>
                                            <div className="font-medium font-mono">STS-998877</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Religion</div>
                                            <div className="font-medium">Hindu</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Caste Category</div>
                                            <div className="font-medium">GM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="font-semibold text-gray-900 border-b pb-2 mb-4">Guardian Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                    <div>
                                        <div className="text-gray-500">Guardian Name</div>
                                        <div className="font-medium">{student.guardian?.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Relationship</div>
                                        <div className="font-medium">{student.guardian?.relation}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Phone</div>
                                        <div className="font-medium text-blue-600">{student.guardian?.contact}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab B: Academic */}
                <TabsContent value="academic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Current Subjects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {['Mathematics', 'Science', 'Social Science', 'English', 'Kannada', 'Hindi'].map(sub => (
                                        <Badge key={sub} variant="secondary" className="px-3 py-1 text-base">{sub}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Exams</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                        <span className="font-medium">Midterm 1</span>
                                        <Badge className="bg-green-600">85%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                        <span className="font-medium">Unit Test 1</span>
                                        <Badge className="bg-blue-600">92%</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab C: Fee Ledger */}
                <TabsContent value="fees" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Fee Transactions</CardTitle>
                                <CardDescription>Complete financial history.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download Statement</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Description</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="p-3 text-gray-600">20 Jan 2024</td>
                                            <td className="p-3 font-medium">Admission Fee</td>
                                            <td className="p-3"><Badge variant="outline">INVOICE</Badge></td>
                                            <td className="p-3 text-right">₹15,000</td>
                                            <td className="p-3"><Badge className="bg-green-600">PAID</Badge></td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 text-gray-600">01 Feb 2024</td>
                                            <td className="p-3 font-medium">Term 1 Tuition</td>
                                            <td className="p-3"><Badge variant="outline">INVOICE</Badge></td>
                                            <td className="p-3 text-right">₹25,000</td>
                                            <td className="p-3"><Badge variant="destructive">PENDING</Badge></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab D: Documents (Vault) */}
                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Document Vault</CardTitle>
                            <CardDescription>Securely stored digital records.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {student.documents?.map((doc, idx) => (
                                    <div key={idx} className="flex items-start justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded border">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{doc.title}</div>
                                                <div className="text-xs text-gray-500">{doc.type} • {doc.date}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                            <Download className="w-4 h-4 text-gray-500" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300">
                                    <PlusIcon />
                                    <span className="text-sm font-medium mt-2">Upload Document</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab E: Audit Trail */}
                <TabsContent value="audit">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                            <CardDescription>System events and modifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <ActivityItem
                                    action="PROFILE_UPDATE"
                                    actor="Admin User"
                                    desc="Updated emergency contact details."
                                    time="2 hours ago"
                                />
                                <ActivityItem
                                    action="DOC_UPLOAD"
                                    actor="System"
                                    desc="Uploaded 'Aadhaar Card.pdf'"
                                    time="1 day ago"
                                />
                                <ActivityItem
                                    action="ADMISSION_CREATE"
                                    actor="Admin User"
                                    desc="Created student profile."
                                    time="2 days ago"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Helpers
function CheckCircleIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
}
function PlusIcon() {
    return (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-12H4" />
        </svg>
    )
}

function ActivityItem({ action, actor, desc, time }: { action: string, actor: string, desc: string, time: string }) {
    return (
        <div className="flex gap-4 items-start pb-4 border-b last:border-0 last:pb-0">
            <div className="p-2 bg-gray-100 rounded-full mt-1">
                <Activity className="w-4 h-4 text-gray-600" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900">{action}</span>
                    <span className="text-xs text-gray-500">• {time}</span>
                </div>
                <div className="text-sm text-gray-600">{desc}</div>
                <div className="text-xs text-gray-400 mt-0.5">by {actor}</div>
            </div>
        </div>
    )
}
