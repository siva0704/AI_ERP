'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Plus, BookOpen, User, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function LibraryPage() {
    const queryClient = useQueryClient();
    const [view, setView] = useState<'BOOKS' | 'ISSUES'>('BOOKS');
    const [showAddBook, setShowAddBook] = useState(false);

    // 1. Fetch Books
    const { data: books } = useQuery({
        queryKey: ['library.books'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/library/books');
            return res.json();
        }
    });

    // 2. Add Book
    const addBookMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('http://localhost:3001/api/library/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library.books'] });
            setShowAddBook(false);
            toast.success('Book Added');
        }
    });

    // 3. Issue Book
    const issueMutation = useMutation({
        mutationFn: async (data: { bookId: string, studentId: string }) => {
            const res = await fetch('http://localhost:3001/api/library/issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library.books'] });
            toast.success('Book Issued');
        }
    });

    // 4. Return Book
    const returnMutation = useMutation({
        mutationFn: async (issueId: string) => {
            const res = await fetch(`http://localhost:3001/api/library/return/${issueId}`, {
                method: 'POST',
            });
            return res.json();
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['library.books'] });
            toast.success(`Returned. Fine: $${data.fine}`);
        }
    });

    const { register, handleSubmit } = useForm();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Library Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('BOOKS')}
                        className={`px-4 py-2 rounded-md ${view === 'BOOKS' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                    >
                        Catalog
                    </button>
                    <button
                        onClick={() => setShowAddBook(!showAddBook)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <Plus size={20} /> Add Book
                    </button>
                </div>
            </div>

            {/* Add Book Form */}
            {showAddBook && (
                <Card className="bg-neutral-50 border-blue-200">
                    <CardHeader><CardTitle>Add New Book</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit((d) => addBookMutation.mutate(d))} className="flex gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-bold">Title</label>
                                <input {...register('title')} className="p-2 border rounded w-64" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold">Author</label>
                                <input {...register('author')} className="p-2 border rounded w-48" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold">ISBN</label>
                                <input {...register('isbn')} className="p-2 border rounded w-32" />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded font-bold">Save</button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Book List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books?.map((book: any) => (
                    <Card key={book.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between">
                                <span className="truncate">{book.title}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {book.status}
                                </span>
                            </CardTitle>
                            <CardDescription>{book.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-xs text-neutral-500 font-mono">{book.isbn || 'No ISBN'}</div>
                                {book.status === 'AVAILABLE' ? (
                                    <button
                                        onClick={() => {
                                            const studentId = prompt("Enter Student ID to Issue:");
                                            if (studentId) issueMutation.mutate({ bookId: book.id, studentId });
                                        }}
                                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-bold"
                                    >
                                        Issue
                                    </button>
                                ) : (
                                    <span className="text-xs italic text-neutral-400">Checked Out</span>
                                    // In a real app, we would query the active issue ID to allow return here. 
                                    // For simplicity in this CRUD, verify via DB or separate Issue List.
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
