import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CreditCard, Settings } from 'lucide-react';

export default function FeesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/fees/structure" className="block group">
                    <Card className="h-full transition-colors group-hover:border-blue-500">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Settings className="h-6 w-6 text-blue-600" />
                                <CardTitle>Fee Structure</CardTitle>
                            </div>
                            <CardDescription>Manage tuition types, amounts, and cycles.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/fees/collect" className="block group">
                    <Card className="h-full transition-colors group-hover:border-green-500">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-6 w-6 text-green-600" />
                                <CardTitle>Collect Fees</CardTitle>
                            </div>
                            <CardDescription>Search students, view dues, and record payments.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
