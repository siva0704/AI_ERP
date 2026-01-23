
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    Calendar,
    Clock,
    Figma,
    BookOpen,
    Bus
} from "lucide-react";

export type UserRole = 'GROUP_ADMIN' | 'BRANCH_ADMIN' | 'STAFF' | 'STUDENT';

export interface NavItemConfig {
    href: string;
    icon: any; // LucideIcon type is generic, simple any or specific type if imported
    label: string;
    roles: UserRole[];
    isFeatureGated?: boolean; // For "Coming Soon" features
}

export const NAVIGATION_ITEMS: NavItemConfig[] = [
    {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Overview",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN", "STAFF", "STUDENT"]
    },
    {
        href: "/admissions",
        icon: Users,
        label: "Admissions",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN"]
    },
    {
        href: "/fees",
        icon: CreditCard,
        label: "Fees",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN", "STUDENT"] // Students see their own fee status
    },
    {
        href: "/attendance",
        icon: Calendar,
        label: "Attendance",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN", "STAFF"]
    },
    {
        href: "/timetable",
        icon: Clock,
        label: "Timetable",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN", "STAFF", "STUDENT"]
    },
    {
        href: "/exams",
        icon: Figma,
        label: "Exams",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN", "STAFF", "STUDENT"]
    },
    {
        href: "/library",
        icon: BookOpen,
        label: "Library",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN", "STAFF", "STUDENT"],
        isFeatureGated: true
    },
    {
        href: "/transport",
        icon: Bus,
        label: "Transport",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN", "STAFF", "STUDENT"],
    },
    {
        href: "/settings",
        icon: Settings,
        label: "Settings",
        roles: ["GROUP_ADMIN", "BRANCH_ADMIN"]
    },
];

export const getNavItemsForRole = (role: string): NavItemConfig[] => {
    return NAVIGATION_ITEMS.filter(item => item.roles.includes(role as UserRole));
};
