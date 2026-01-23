'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, X, Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function AssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your AI Assistant. Ask me about Revenue, Students, or Dues." }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const mutation = useMutation({
        mutationFn: async (query: string) => {
            const token = localStorage.getItem('token') || ''; // Assuming token is here for now, or handled by middleware/cookie
            // But we know we use cookies mostly. Let's try fetch directly.
            const res = await fetch('http://localhost:3001/api/assistant/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth headers if needed, but we rely on cookies mostly for web
                },
                body: JSON.stringify({ query }),
            });
            if (!res.ok) throw new Error('Failed to get response');
            return res.json();
        },
        onSuccess: (data) => {
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        },
        onError: () => {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        }
    });

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        mutation.mutate(userMsg);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
                >
                    <Bot className="w-8 h-8 text-white" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-80 h-96 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="bg-blue-600 text-white p-3 rounded-t-lg flex flex-row justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <CardTitle className="text-sm font-medium">Assistant</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white hover:bg-blue-700 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50" ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border shadow-sm text-slate-800 rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {mutation.isPending && (
                            <div className="flex justify-start">
                                <div className="bg-white border shadow-sm px-3 py-2 rounded-lg rounded-bl-none">
                                    <span className="animate-pulse text-slate-400">Typing...</span>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-2 border-t bg-white">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full gap-2"
                        >
                            <input
                                className="flex-1 text-sm px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Ask something..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <Button type="submit" size="icon" disabled={mutation.isPending || !input.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
