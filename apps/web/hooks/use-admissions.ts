import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from "js-cookie";

export interface AdmissionData {
    firstName: string;
    lastName: string;
    email: string;
    enrollmentNo?: string;
    guardianName?: string;
    guardianContact?: string;
    admissionFee?: number;

    // New Fields
    gender?: string;
    dob?: string;
    bloodGroup?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    previousSchool?: string;
    gradeLevel?: string;
}

export const useAdmissions = () => {
    const queryClient = useQueryClient();

    const createAdmissionMutation = useMutation({
        mutationFn: async (data: AdmissionData) => {
            const role = Cookies.get("user-role") || "BRANCH_ADMIN";
            const response = await fetch("http://localhost:3001/api/admissions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-role": role,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create admission");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });

    const useStudents = () => useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const role = Cookies.get("user-role") || "BRANCH_ADMIN";
            const res = await fetch('http://localhost:3001/api/admissions', {
                headers: {
                    "x-user-role": role,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch students');
            return res.json();
        }
    });

    return {
        createAdmission: createAdmissionMutation,
        useStudents
    };
};
