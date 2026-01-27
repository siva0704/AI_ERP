'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Database, HardDrive, ShieldAlert, RefreshCw } from 'lucide-react';

export default function HealthDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, auditRes] = await Promise.all([
                fetch('/api/health/stats'),
                fetch('/api/health/audit-feed')
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (auditRes.ok) setAuditLogs(await auditRes.json());

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch health data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Pulse</h1>
                    <p className="text-muted-foreground mt-1">Real-time observability and audit logging.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
                    <button onClick={fetchData} className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-colors">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Check</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats?.status?.toUpperCase() || 'CONNECTING...'}
                        </div>
                        <p className="text-xs text-muted-foreground">API & Web Services Reactive</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database Latency</CardTitle>
                        <Database className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.metrics?.dbLatency || '-'}</div>
                        <p className="text-xs text-muted-foreground">PostgreSQL Response Time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage Driver</CardTitle>
                        <HardDrive className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{stats?.metrics?.storageDriver || '-'}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.metrics?.storageObjects || 0} Objects Stored
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.metrics?.auditEvents || 0}</div>
                        <p className="text-xs text-muted-foreground">Recorded Actions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Live Feed */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Live Audit Feed (Last 20)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] w-full pr-4">
                        <div className="space-y-4">
                            {auditLogs.length === 0 && <p className="text-center text-muted-foreground py-8">No audit logs recorded yet.</p>}

                            {auditLogs.map((log) => (
                                <div key={log.id} className="flex flex-col gap-2 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2 items-center">
                                            <Badge variant={
                                                log.action === 'DELETE' ? 'destructive' :
                                                    log.action === 'POST' ? 'default' : 'secondary'
                                            }>
                                                {log.action}
                                            </Badge>
                                            <span className="font-mono text-sm text-blue-600">{log.resource}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-end mt-1">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">User:</span> <span className="font-medium">{log.userId || 'System'}</span>
                                            {log.duration && <span className="ml-3 text-xs text-muted-foreground">({log.duration}ms)</span>}
                                        </div>
                                    </div>

                                    {/* JSON Payload (Collapsed or Minimal) */}
                                    {log.reqPayload && log.reqPayload !== '{}' && (
                                        <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-auto max-h-20 max-w-full">
                                            {log.reqPayload}
                                        </pre>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
