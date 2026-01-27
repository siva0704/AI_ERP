"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, BookOpen, Repeat, Book, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

// Types
type Book = {
    id: string;
    title: string;
    author: string;
    isbn: string;
    status: 'AVAILABLE' | 'ISSUED' | 'LOST';
};

type Issue = {
    id: string;
    book: Book;
    student: {
        firstName: string;
        lastName: string;
        enrollmentNo: string;
    };
    issueDate: string;
    dueDate: string;
};

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'circulation'>('catalog');
    const [books, setBooks] = useState<Book[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "" });
    const [issuePayload, setIssuePayload] = useState({ bookId: "", studentId: "" });

    // Helper for Headers
    const getHeaders = () => ({
        "Content-Type": "application/json",
        "x-tenant-id": "tenant-123",
        "x-branch-id": "branch-101",
        "x-user-role": Cookies.get("user-role") || "BRANCH_ADMIN",
        "x-user-id": Cookies.get("user-id") || "demo-user",
    });

    // Fetch Data
    const fetchBooks = async () => {
        try {
            const res = await fetch("/api/library/books", { headers: getHeaders() });
            if (res.ok) setBooks(await res.json());
        } catch (e) { toast.error("Failed to fetch books"); }
    };

    const fetchIssues = async () => {
        try {
            const res = await fetch("/api/library/issues", { headers: getHeaders() });
            if (res.ok) setIssues(await res.json());
        } catch (e) { toast.error("Failed to fetch active issues"); }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchBooks(), fetchIssues()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Create Book
    const handleCreateBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/library/books", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(newBook),
            });
            if (!res.ok) throw new Error();
            toast.success("Book added to catalog");
            setNewBook({ title: "", author: "", isbn: "" });
            fetchBooks();
        } catch (e) { toast.error("Failed to add book"); }
    };

    // Issue Book
    const handleIssueBook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/library/issue", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(issuePayload),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to issue");
            }
            toast.success("Book issued successfully");
            setIssuePayload({ bookId: "", studentId: "" });
            fetchBooks(); // Update status
            fetchIssues(); // Update list
        } catch (e: any) { toast.error(e.message || "Failed to issue book"); }
    };

    // Return Book
    const handleReturnBook = async (issueId: string) => {
        try {
            const res = await fetch(`/api/library/return/${issueId}`, {
                method: "POST",
                headers: getHeaders(),
            });
            const data = await res.json();

            if (data.fine > 0) {
                toast.warning(`Book Returned. Fine generated: $${data.fine}`);
            } else {
                toast.success("Book returned successfully");
            }
            fetchBooks();
            fetchIssues();
        } catch (e) { toast.error("Failed to return book"); }
    };

    // Columns
    const bookColumns: ColumnDef<Book>[] = [
        { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span> },
        { accessorKey: "title", header: "Title" },
        { accessorKey: "author", header: "Author" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.original.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {row.original.status}
                </span>
            )
        },
    ];

    const issueColumns: ColumnDef<Issue>[] = [
        { accessorKey: "book.title", header: "Book" },
        {
            accessorKey: "student",
            header: "Student",
            cell: ({ row }) => `${row.original.student?.firstName} ${row.original.student?.lastName}`
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString()
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <Button size="sm" variant="destructive" onClick={() => handleReturnBook(row.original.id)}>
                    Return
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Library & Media Center</h2>
                    <p className="text-muted-foreground">Manage catalog, circulation, and due dates.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'catalog' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('catalog')}
                    >
                        <Book className="mr-2 h-4 w-4" /> Catalog
                    </Button>
                    <Button
                        variant={activeTab === 'circulation' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('circulation')}
                    >
                        <Repeat className="mr-2 h-4 w-4" /> Circulation Desk
                    </Button>
                </div>
            </div>

            {activeTab === 'catalog' && (
                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="col-span-3 h-fit">
                        <CardHeader>
                            <CardTitle>Add New Book</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateBook} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Author</Label>
                                    <Input value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>ISBN</Label>
                                    <Input value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} />
                                </div>
                                <Button type="submit" className="w-full">Add to Catalog</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader><CardTitle>Book Catalog</CardTitle></CardHeader>
                        <CardContent>
                            <DataTable columns={bookColumns} data={books} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'circulation' && (
                <div className="grid gap-4 md:grid-cols-7">
                    <Card className="col-span-3 h-fit">
                        <CardHeader>
                            <CardTitle>Issue Book</CardTitle>
                            <CardDescription>Issue a book to a student. Max 2 books per student.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleIssueBook} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Book ID</Label>
                                    <Input
                                        placeholder="Scan or Enter Book UUID"
                                        value={issuePayload.bookId}
                                        onChange={e => setIssuePayload({ ...issuePayload, bookId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Student ID</Label>
                                    <Input
                                        placeholder="Enter Student UUID"
                                        value={issuePayload.studentId}
                                        onChange={e => setIssuePayload({ ...issuePayload, studentId: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    <Repeat className="mr-2 h-4 w-4" /> Issue Book
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader><CardTitle>Active Issues</CardTitle></CardHeader>
                        <CardContent>
                            <DataTable columns={issueColumns} data={issues} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
