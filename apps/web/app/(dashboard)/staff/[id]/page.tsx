
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, Activity, Mail, Phone, MapPin, Briefcase, Car } from 'lucide-react';

interface StaffProfile {
    id: string;
    firstName: string;
    lastName: string;
    designation: string;
    department: string;
    email: string;
    contact: string;
    status: string;
    joinDate: string;
    address?: {
        city: string;
        state: string;
    };
    driverInfo?: {
        licenseNo: string;
        badgeNo: string;
        expiry: string;
    };
    attendancePercentage: number;
}

export default function StaffProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const [staff, setStaff] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock Fetch
        setTimeout(() => {
            setStaff({
                id,
                firstName: 'Sarah',
                lastName: 'Connor',
                designation: 'Senior Teacher',
                department: 'Science',
                email: 'sarah.connor@school.edu',
                contact: '+91 98765 43210',
                status: 'ACTIVE',
                joinDate: '2022-06-15',
                address: {
                    city: 'Bengaluru',
                    state: 'Karnataka'
                },
                // Mock Driver Info to test conditional rendering
                // driverInfo: { licenseNo: 'DL-1234-5678', badgeNo: 'BG-999', expiry: '2028-01-01' }, 
                attendancePercentage: 98
            });
            setLoading(false);
        }, 800);
    }, [id]);

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    if (!staff) return <div className="p-8 text-center">Staff not found</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.firstName}`} />
                            <AvatarFallback>{staff.firstName[0]}{staff.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{staff.firstName} {staff.lastName}</h1>
                            <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {staff.designation}
                                </Badge>
                                <span>•</span>
                                <span className="font-medium text-gray-600">{staff.department}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <Card className="flex-1 md:w-32 bg-green-50 border-green-100 shadow-none">
                            <CardContent className="p-3 text-center">
                                <div className="text-xs text-green-600 font-medium uppercase tracking-wider">Attendance</div>
                                <div className="text-xl font-bold text-green-800">{staff.attendancePercentage}%</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" /> Email
                        </Button>
                        <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-2" /> Call
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="docs">Documents</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span>{staff.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <span>{staff.contact}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span>{staff.address?.city}, {staff.address?.state}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-5 h-5 text-gray-400" />
                                    <span>Joined: {staff.joinDate}</span>
                                </div>
                                {staff.driverInfo && (
                                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 space-y-2">
                                        <div className="flex items-center gap-2 font-medium text-yellow-800">
                                            <Car className="w-4 h-4" /> Driver Details
                                        </div>
                                        <div className="text-sm grid grid-cols-2 gap-2">
                                            <span className="text-gray-500">License No:</span>
                                            <span>{staff.driverInfo.licenseNo}</span>
                                            <span className="text-gray-500">Badge No:</span>
                                            <span>{staff.driverInfo.badgeNo}</span>
                                            <span className="text-gray-500">Expiry:</span>
                                            <span>{staff.driverInfo.expiry}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Docs Tab */}
                <TabsContent value="docs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Documents</CardTitle>
                            <CardDescription>Contracts, ID Proofs, and Certificates.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                    <FileText className="w-8 h-8 text-blue-500" />
                                    <div>
                                        <div className="font-medium">Employment Contract</div>
                                        <div className="text-xs text-gray-500">PDF • 2.4 MB</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-500">No recent activity.</div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
