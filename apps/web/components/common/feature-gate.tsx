
import { AlertCircle, Lock } from "lucide-react";

interface FeatureGateProps {
    title: string;
    description: string;
    children?: React.ReactNode;
    isLocked?: boolean;
}

export function FeatureGate({ title, description, isLocked = true, children }: FeatureGateProps) {
    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-2xl mx-auto p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                <Lock className="w-10 h-10 text-slate-400" />
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-display font-bold text-slate-900">{title}</h2>
                <div className="h-1 w-20 bg-[var(--color-accent)] mx-auto"></div>
                <p className="text-lg text-slate-600 leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-left max-w-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-amber-900 text-sm">System Update</p>
                    <p className="text-amber-800 text-sm">
                        Cascade is currently calibrating the engine for your branch. This module will be online in the next deployment cycle.
                    </p>
                </div>
            </div>
        </div>
    );
}
