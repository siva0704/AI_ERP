
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ChevronRight, Printer } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessViewProps {
    title: string;
    subtitle: string;
    summaryItems: { label: string; value: string | number }[];
    actionButtons: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'secondary' | 'ghost';
        icon?: React.ReactNode;
    }[];
}

export function SuccessView({ title, subtitle, summaryItems, actionButtons }: SuccessViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[50vh] p-4"
        >
            <Card className="max-w-md w-full border-green-200 shadow-xl bg-gradient-to-b from-white to-green-50/30">
                <CardHeader className="text-center pb-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4"
                    >
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-green-800">{title}</CardTitle>
                    <p className="text-muted-foreground mt-2">{subtitle}</p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-white border border-green-100 p-4 space-y-3 shadow-sm">
                        {summaryItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 last:border-0 pb-2 last:pb-0">
                                <span className="text-gray-500 font-medium">{item.label}</span>
                                <span className="font-bold text-gray-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                    {actionButtons.map((btn, index) => (
                        <Button
                            key={index}
                            variant={btn.variant || 'default'}
                            className={`w-full ${btn.variant === 'outline' ? 'border-green-200 text-green-700 hover:bg-green-50' : 'bg-green-600 hover:bg-green-700 text-white shadow-md'}`}
                            onClick={btn.onClick}
                        >
                            {btn.icon && <span className="mr-2">{btn.icon}</span>}
                            {btn.label}
                        </Button>
                    ))}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
