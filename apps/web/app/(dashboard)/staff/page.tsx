"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { Search, UserPlus, Briefcase, DollarSign, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function StaffPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingStaff, setEditingStaff] = useState<any | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('auth_token');
            const role = Cookies.get('user-role');

            const query = search ? `?search=${search}` : '';
            const res = await fetch(`/api/staff${query}`, {
                headers: {
                    'x-user-role': role || 'GUEST',
                    'x-branch-id': 'branch-101'
                }
            });
            if (res.ok) {
                setStaff(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [search]);

    const handleEditClick = (profile: any) => {
        setEditingStaff({ ...profile });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const role = Cookies.get('user-role') || 'BRANCH_ADMIN';
            const res = await fetch(`/api/staff/${editingStaff.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': role,
                },
                body: JSON.stringify(editingStaff)
            });

            if (!res.ok) throw new Error('Failed to update');

            toast.success("Staff profile updated");
            setIsDialogOpen(false);
            fetchStaff();
        } catch (err) {
            toast.error("Update failed");
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Staff Directory</h1>
                    <p className="text-slate-500 mt-2">Manage your branch employees and roles.</p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Staff
                </Button>
            </div>

            <div className="flex items-center space-x-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <Search className="h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                />
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map((profile) => (
                        <div key={profile.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                                        {profile.firstName ? profile.firstName[0] : profile.user.email[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">
                                            {profile.firstName} {profile.lastName}
                                        </div>
                                        <div className="text-xs text-slate-500">{profile.user.email}</div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="capitalize">{profile.department}</Badge>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-slate-400" />
                                    <span>{profile.designation}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-slate-400" />
                                    <span>${Number(profile.baseSalary).toLocaleString()}/yr</span>
                                </div>
                            </div>

                            <div className="pt-4 mt-auto border-t border-slate-50 flex gap-2">
                                <Button variant="ghost" size="sm" className="w-full text-indigo-600" onClick={() => handleEditClick(profile)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                                </Button>
                            </div>
                        </div>
                    ))}

                    {staff.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            No staff found. Try adjusting your search.
                        </div>
                    )}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Staff Profile</DialogTitle>
                    </DialogHeader>

                    {editingStaff && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={editingStaff.firstName}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={editingStaff.lastName}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Input
                                        value={editingStaff.designation}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, designation: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input
                                        value={editingStaff.department}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Qualification</Label>
                                <Input
                                    value={editingStaff.qualification || ''}
                                    onChange={(e) => setEditingStaff({ ...editingStaff, qualification: e.target.value })}
                                    placeholder="e.g. M.Sc, B.Ed"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Salary (USD)</Label>
                                    <Input
                                        type="number"
                                        value={editingStaff.baseSalary}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, baseSalary: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Experience (Years)</Label>
                                    <Input
                                        type="number"
                                        value={editingStaff.experienceYears || 0}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, experienceYears: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4 mt-2">
                                <h4 className="font-semibold text-sm">Banking Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Account No</Label>
                                        <Input
                                            value={editingStaff.bankAccountNo || ''}
                                            onChange={(e) => setEditingStaff({ ...editingStaff, bankAccountNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>IFSC / Sort Code</Label>
                                        <Input
                                            value={editingStaff.bankIfsc || ''}
                                            onChange={(e) => setEditingStaff({ ...editingStaff, bankIfsc: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-4 mt-2">
                                <h4 className="font-semibold text-sm">Emergency Contact</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Contact Name</Label>
                                        <Input
                                            value={editingStaff.emergencyContactName || ''}
                                            onChange={(e) => setEditingStaff({ ...editingStaff, emergencyContactName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                            value={editingStaff.emergencyContactPhone || ''}
                                            onChange={(e) => setEditingStaff({ ...editingStaff, emergencyContactPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
