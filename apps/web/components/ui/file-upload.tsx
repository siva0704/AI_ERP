'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface FileUploadProps {
    onUploadComplete: (url: string) => void;
    label?: string;
}

export function FileUpload({ onUploadComplete, label = "Upload Document" }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File too large. Max 5MB allowed.");
            return;
        }

        setIsUploading(true);
        setFileName(file.name);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('type', 'DOCUMENT');

        try {
            const role = Cookies.get("user-role") || "BRANCH_ADMIN";
            const res = await fetch('http://localhost:3001/api/documents/upload', {
                method: 'POST',
                headers: {
                    'x-user-role': role,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            onUploadComplete(data.url);
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload file");
            setFileName(null);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
            />

            {!fileName ? (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-500 text-sm">{label}</span>
                </Button>
            ) : (
                <div className="flex items-center justify-between p-3 border rounded-md bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm truncate font-medium text-green-700">{fileName}</span>
                    </div>
                    {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-green-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFileName(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                        >
                            <X className="w-3 h-3 text-green-700" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
