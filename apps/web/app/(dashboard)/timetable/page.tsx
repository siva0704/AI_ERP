"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Calendar, Clock, AlertTriangle } from "lucide-react";

// Helper: Minutes <-> HH:MM
const toTimeStr = (minutes: number) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function TimetablePage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "10:00",
        subjectId: "", // Logic: Assuming IDs exist, but for MVP checking specific IDs or manual entry? 
        // Ideally we fetch subjects. For demo, we might use simple strings or mock IDs if Subject API isn't ready.
        // Looking at schema: Subject, User(Teacher), Classroom are required.
        // I will use text inputs for IDs for now, or fetch if I can. 
        // Let's assume user enters UUIDs or we fetch. 
        // Actually, we don't have a Subject List UI yet. I'll use placeholders.
        teacherId: "",
        classroomId: ""
    });

    const getHeaders = () => ({
        "Content-Type": "application/json",
        "x-tenant-id": "tenant-123",
        "x-branch-id": "branch-101",
        "x-user-role": Cookies.get("user-role") || "BRANCH_ADMIN",
        "x-user-id": Cookies.get("user-id") || "demo-user",
    });

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/timetable/sessions", { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (e) { toast.error("Failed to load timetable"); }
        setLoading(false);
    };

    useEffect(() => { fetchTimetable(); }, []);

    const handleCreate = async () => {
        try {
            // Convert to Int
            const payload = {
                ...formData,
                startTime: toMinutes(formData.startTime),
                endTime: toMinutes(formData.endTime),
                // Mock IDs if empty for testing, or require user input
                // User must provide valid IDs or it fails FK constraint.
                // I'll assume the user knows IDs or I should fetch them.
                // For the "Cloning Test", I will rely on the user entering IDs.
            };

            const res = await fetch("/api/timetable/sessions", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                if (res.status === 409) {
                    toast.error("Conflict Detected!", {
                        description: err.details || "Double booking detected."
                    });
                    return;
                }
                throw new Error("Failed to create");
            }

            toast.success("Session Scheduled");
            setIsDialogOpen(false);
            fetchTimetable();
        } catch (e) { toast.error("Error scheduling session"); }
    };

    // Group by Day
    const sessionsByDay = DAYS.reduce((acc, day) => {
        acc[day] = sessions.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime - b.startTime);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Academic Timetable</h2>
                    <p className="text-muted-foreground">Manage weekly schedules and resolve conflicts.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Schedule Class</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule New Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Day</Label>
                                    <Select
                                        value={formData.dayOfWeek}
                                        onValueChange={v => setFormData({ ...formData, dayOfWeek: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <div className="flex gap-2">
                                        <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                        <span className="py-2">-</span>
                                        <Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Subject ID (UUID)</Label>
                                <Input value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} placeholder="e.g. sub-123" />
                            </div>
                            <div className="space-y-2">
                                <Label>Teacher ID (UUID)</Label>
                                <Input value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })} placeholder="e.g. user-123" />
                            </div>
                            <div className="space-y-2">
                                <Label>Classroom ID (UUID)</Label>
                                <Input value={formData.classroomId} onChange={e => setFormData({ ...formData, classroomId: e.target.value })} placeholder="e.g. room-101" />
                            </div>

                            <Button onClick={handleCreate} className="w-full">Schedule Session</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {DAYS.map(day => (
                    <Card key={day} className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground">{day}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {sessionsByDay[day]?.length === 0 && (
                                <p className="text-xs text-muted-foreground italic">No classes</p>
                            )}
                            {sessionsByDay[day]?.map(session => (
                                <div key={session.id} className="p-3 border rounded-md text-sm bg-accent/10 hover:bg-accent/20 transition-colors">
                                    <div className="flex items-center justify-between font-semibold mb-1">
                                        <span>{session.subject?.name || 'Subject'}</span>
                                        <span className="text-xs text-muted-foreground flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {toTimeStr(session.startTime)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {session.teacher?.firstName || 'Teacher'} • {session.classroom?.name || 'Room'}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
