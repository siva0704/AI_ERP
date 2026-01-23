"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Cookies from "js-cookie";

export default function ExamResultsPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [lockAmount, setLockAmount] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            const studentId = Cookies.get("user-id") || "student-broke-1"; // Default to broke for demo
            try {
                const res = await fetch(`/api/exams/results/${studentId}`, {
                    headers: {
                        'x-tenant-id': 'tenant-123',
                        'x-branch-id': 'branch-101',
                        'x-user-role': 'STUDENT'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                } else if (res.status === 402) {
                    // Fee Lock Logic
                    setIsLocked(true);
                    const errJson = await res.json();
                    // Extract amount from message if possible, or just show generic
                    // Message format: "Marksheet blocked due to outstanding fees: $500"
                    const msg = errJson.message || "";
                    const match = msg.match(/\$(\d+)/);
                    if (match) setLockAmount(Number(match[1]));
                    setError(msg);
                } else {
                    setError("Failed to load results");
                }
            } catch (e) {
                setError("Network error");
            }
            setLoading(false);
        };

        fetchResults();
    }, []);

    if (loading) return <div className="p-8">Loading results...</div>;

    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
                <div className="bg-red-100 p-6 rounded-full">
                    <Lock className="w-12 h-12 text-red-600" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold text-red-700">Access Restricted</h2>
                    <p className="text-muted-foreground">
                        Your examination results are currently withheld due to outstanding fee dues.
                    </p>
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Outstanding Dues</AlertTitle>
                        <AlertDescription>
                            Please clear your pending balance of <strong>${lockAmount}</strong> to view your marksheet immediately.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Results</h2>
                <p className="text-muted-foreground">Semester performance and grades.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Academic Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {results.length === 0 ? (
                        <p className="text-muted-foreground italic">No results found.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.exam?.name || 'Exam'}</TableCell>
                                        <TableCell>{r.exam?.date ? new Date(r.exam.date).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="font-bold">{r.marks} / 100</TableCell>
                                        <TableCell>
                                            {Number(r.marks) >= 40 ? (
                                                <Badge className="bg-green-600">PASS</Badge>
                                            ) : (
                                                <Badge variant="destructive">FAIL</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
