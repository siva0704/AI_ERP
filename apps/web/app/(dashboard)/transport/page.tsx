"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, Bus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

// Types
type TransportRoute = {
    id: string;
    name: string;
    monthlyCost: string; // Decimal comes as string often
    vehicle?: {
        plateNumber: string;
        driverName: string;
    };
};

export default function TransportPage() {
    const [routes, setRoutes] = useState<TransportRoute[]>([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newRoute, setNewRoute] = useState({ name: "", monthlyCost: "", vehicleId: "" });
    const [allocation, setAllocation] = useState({ routeId: "", studentId: "" });

    // Helper for Headers
    const getHeaders = () => ({
        "Content-Type": "application/json",
        "x-tenant-id": "tenant-123",
        "x-branch-id": "branch-101",
        "x-user-role": Cookies.get("user-role") || "BRANCH_ADMIN", // Default strict, but user might be GROUP_ADMIN
    });

    // Fetch Routes
    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/transport/routes", {
                headers: getHeaders(),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Failed to fetch routes: ${res.status} ${txt}`);
            }
            const data = await res.json();
            setRoutes(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load routes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // Create Route
    const handleCreateRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/transport/routes", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    name: newRoute.name,
                    monthlyCost: parseFloat(newRoute.monthlyCost),
                    // Assuming vehicle creation is separate or optional for now
                }),
            });
            if (!res.ok) throw new Error("Failed to create route");
            toast.success("Route created successfully");
            setNewRoute({ name: "", monthlyCost: "", vehicleId: "" });
            fetchRoutes();
        } catch (error) {
            toast.error("Error creating route");
        }
    };

    // Allocate Student
    const handleAllocate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allocation.routeId || !allocation.studentId) return;

        try {
            const res = await fetch("/api/transport/allocate", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(allocation),
            });
            if (!res.ok) throw new Error("Failed to allocate student");
            toast.success("Student allocated & Fee generated!");
            setAllocation({ routeId: "", studentId: "" });
        } catch (error) {
            toast.error("Error allocating student");
        }
    };

    // Columns
    const columns: ColumnDef<TransportRoute>[] = [
        {
            accessorKey: "name",
            header: "Route Name",
        },
        {
            accessorKey: "monthlyCost",
            header: "Monthly Cost",
            cell: ({ row }) => `$${row.original.monthlyCost}`,
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllocation({ ...allocation, routeId: row.original.id })}
                >
                    Select for Allocation
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transport Management</h2>
                    <p className="text-muted-foreground">Manage routes, vehicles, and student allocations.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Create Route Form */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Create New Route</CardTitle>
                        <CardDescription>Add a new bus route to the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateRoute} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Route Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. North Route - Bus 1"
                                    value={newRoute.name}
                                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Monthly Cost ($)</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    placeholder="50.00"
                                    value={newRoute.monthlyCost}
                                    onChange={(e) => setNewRoute({ ...newRoute, monthlyCost: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                <Bus className="mr-2 h-4 w-4" />
                                Create Route
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Allocation Form */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Student Allocation</CardTitle>
                        <CardDescription>Assign a student to a route. This will generate a fee record.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAllocate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="routeId">Route ID</Label>
                                    <Input
                                        id="routeId"
                                        placeholder="Select from table below"
                                        value={allocation.routeId}
                                        onChange={(e) => setAllocation({ ...allocation, routeId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="studentId">Student ID</Label>
                                    <Input
                                        id="studentId"
                                        placeholder="Enter Student UUID"
                                        value={allocation.studentId}
                                        onChange={(e) => setAllocation({ ...allocation, studentId: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="secondary" className="w-full">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Assign & Generate Fee
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Routes Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Routes</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <DataTable columns={columns} data={routes} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
