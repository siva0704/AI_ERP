
"use client";

import { AdmissionWizard } from "@/components/admissions/admission-wizard";
import { UserPlus } from "lucide-react";

export default function AdmissionsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 rounded-lg">
                    <UserPlus className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">New Admission</h1>
                    <p className="text-slate-500">Register a new student and generate their academic profile.</p>
                </div>
            </div>

            <AdmissionWizard />
        </div>
    );
}
