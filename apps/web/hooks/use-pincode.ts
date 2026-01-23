import { useState, useEffect } from 'react';

// Mock Data for Karnataka
const PINCODE_DATA: Record<string, { city: string; state: string }> = {
    '560001': { city: 'Bengaluru', state: 'Karnataka' },
    '560034': { city: 'Bengaluru', state: 'Karnataka' },
    '570001': { city: 'Mysuru', state: 'Karnataka' },
    '580001': { city: 'Hubballi', state: 'Karnataka' },
    '590001': { city: 'Belagavi', state: 'Karnataka' },
    '575001': { city: 'Mangaluru', state: 'Karnataka' },
};

export function usePincode(pincode: string | undefined) {
    const [data, setData] = useState<{ city: string; state: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!pincode || pincode.length !== 6) {
            setData(null);
            return;
        }

        setIsLoading(true);
        // Simulate API delay
        const timer = setTimeout(() => {
            const found = PINCODE_DATA[pincode];
            if (found) {
                setData(found);
            } else {
                // Default fallback if not in mock
                setData({ city: '', state: '' });
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [pincode]);

    return { data, isLoading };
}
