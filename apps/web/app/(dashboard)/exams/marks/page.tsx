"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Loader2, Save } from "lucide-react";

export default function ExamMarksPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [selectedExam, setSelectedExam] = useState<string>("");
    const [students, setStudents] = useState<any[]>([]); // Mock list for now or fetch
    const [marks, setMarks] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    // Fetch Exams on Load
    useEffect(() => {
        // Fetch exams
        // Mocking for UI dev if API not ready, but we have GET /exams
        fetch('/api/exams', {
            headers: {
                'x-tenant-id': 'tenant-123', // Hardcoded for dev, usually from Context
                'x-branch-id': 'branch-101'
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setExams(data);
            })
            .catch(err => console.error(err));

        // Mock Students for the class
        setStudents([
            { id: 'student-broke-1', name: 'Broke Student (S001)' },
            { id: 'student-rich-1', name: 'Rich Student (S002)' },
            { id: 'student-3', name: 'John Doe (S003)' }
        ]);
    }, []);

    const handleSave = async (studentId: string) => {
        if (!selectedExam) return toast.error("Select an exam first");
        const mark = marks[studentId];
        if (mark === undefined) return;

        try {
            const res = await fetch('/api/exams/marks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'tenant-123',
                    'x-branch-id': 'branch-101',
                    'x-user-role': 'STAFF' // Simulate Teacher
                },
                body: JSON.stringify({
                    examId: selectedExam,
                    studentId,
                    marks: mark
                })
            });

            if (res.ok) {
                toast.success("Marks Saved");
            } else {
                toast.error("Failed to save");
            }
        } catch (e) {
            toast.error("Error saving marks");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Exam Marks Entry</h2>
                <p className="text-muted-foreground">Input student scores for internal and external exams.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Exam</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="Choose Exam..." />
                        </SelectTrigger>
                        <SelectContent>
                            {exams.map(e => (
                                <SelectItem key={e.id} value={e.id}>{e.name} ({new Date(e.date).toLocaleDateString()})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedExam && (
                <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <CardDescription>Enter marks out of 100</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Marks Obtained</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-24"
                                                placeholder="0-100"
                                                value={marks[student.id] || ''}
                                                onChange={(e) => setMarks(prev => ({ ...prev, [student.id]: Number(e.target.value) }))}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline" onClick={() => handleSave(student.id)}>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
