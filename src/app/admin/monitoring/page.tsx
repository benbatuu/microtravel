'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { adminAuthUtils } from '@/lib/admin-auth'
import {
    Activity,
    Bell,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Zap,
    HardDrive,
    Cpu,
    MemoryStick,
    RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    response_time: number
    error_rate: number
    last_updated: string
}

interface WebhookEvent {
    id: string
    stripe_event_id: string
    event_type: string
    processed: boolean
    processing_attempts: number
    last_processing_attempt: string | null
    error_message: string | null
    created_at: string
    updated_at: string
}

interface SystemAlert {
    id: string
    alert_type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    resolved: boolean
    resolved_by: string | null
    resolved_at: string | null
    created_at: string
    updated_at: string
}

interface DatabaseMetrics {
    connections: {
        active: number
        idle: number
        max: number
    }
    queries: {
        slow_queries: number
        avg_query_time: number
        queries_per_second: number
    }
    storage: {
        used: number
        available: number
        percentage: number
    }
}

interface SystemMetrics {
    cpu_usage: number
    memory_usage: number
    disk_usage: number
    network_io: {
        incoming: number
        outgoing: number
    }
    response_times: {
        api: number
        database: number
        external_services: number
    }
}

export default function AdminMonitoringPage() {
    const [systemHealth, setSystemHealth] = useState<SystemHealth>({
        status: 'healthy',
        uptime: 99.9,
        response_time: 245,
        error_rate: 0.1,
        last_updated: new Date().toISOString()
    })
    const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([])
    const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
    const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics>({
        connections: { active: 12, idle: 8, max: 100 },
        queries: { slow_queries: 2, avg_query_time: 45, queries_per_second: 150 },
        storage: { used: 2.4, available: 10, percentage: 24 }
    })
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
        cpu_usage: 35,
        memory_usage: 68,
        disk_usage: 42,
        network_io: { incoming: 1.2, outgoing: 0.8 },
        response_times: { api: 245, database: 12, external_services: 890 }
    })
    const [loading, setLoading] = useState(true)
    const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null)
    const [showAlertDialog, setShowAlertDialog] = useState(false)

    const auth = useAuth()

    useEffect(() => {
        loadMonitoringData()

        // Set up real-time updates
        const interval = setInterval(loadMonitoringData, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [])

    const loadMonitoringData = async () => {
        try {
            setLoading(true)

            // Load webhook events
            const { data: webhooksData, error: webhooksError } = await supabase
                .from('webhook_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (webhooksError) {
                console.error('Error loading webhook events:', webhooksError)
            } else {
                setWebhookEvents(webhooksData || [])
            }

            // Load system alerts
            const { data: alertsData, error: alertsError } = await supabase
                .from('system_alerts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (alertsError) {
                console.error('Error loading system alerts:', alertsError)
            } else {
                setSystemAlerts(alertsData || [])
            }

            // Simulate system metrics updates (in a real app, these would come from monitoring services)
            setSystemMetrics(prev => ({
                ...prev,
                cpu_usage: Math.max(10, Math.min(90, prev.cpu_usage + (Math.random() - 0.5) * 10)),
                memory_usage: Math.max(20, Math.min(95, prev.memory_usage + (Math.random() - 0.5) * 5)),
                response_times: {
                    ...prev.response_times,
                    api: Math.max(100, Math.min(1000, prev.response_times.api + (Math.random() - 0.5) * 50))
                }
            }))

            setSystemHealth(prev => ({
                ...prev,
                last_updated: new Date().toISOString(),
                response_time: systemMetrics.response_times.api
            }))

        } catch (error) {
            console.error('Error loading monitoring data:', error)
            toast.error('Failed to load monitoring data')
        } finally {
            setLoading(false)
        }
    }

    const handleResolveAlert = async (alert: SystemAlert) => {
        try {
            const { error } = await supabase
                .from('system_alerts')
                .update({
                    resolved: true,
                    resolved_by: auth.user?.id,
                    resolved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', alert.id)

            if (error) {
                console.error('Error resolving alert:', error)
                toast.error('Failed to resolve alert')
                return
            }

            // Log admin action
            await adminAuthUtils.logAdminAction(
                auth.user?.id || '',
                'resolve_system_alert',
                'system_alert',
                alert.id,
                {
                    alert_type: alert.alert_type,
                    severity: alert.severity,
                    title: alert.title
                }
            )

            toast.success('Alert resolved successfully')
            await loadMonitoringData()
            setShowAlertDialog(false)
        } catch (error) {
            console.error('Error in handleResolveAlert:', error)
            toast.error('Failed to resolve alert')
        }
    }

    const handleRetryWebhook = async (webhookEvent: WebhookEvent) => {
        try {
            // TODO: Implement webhook retry logic
            // This would involve re-processing the webhook event

            const { error } = await supabase
                .from('webhook_events')
                .update({
                    processing_attempts: webhookEvent.processing_attempts + 1,
                    last_processing_attempt: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', webhookEvent.id)

            if (error) {
                console.error('Error retrying webhook:', error)
                toast.error('Failed to retry webhook')
                return
            }

            // Log admin action
            await adminAuthUtils.logAdminAction(
                auth.user?.id || '',
                'retry_webhook_processing',
                'webhook_event',
                webhookEvent.id,
                {
                    event_type: webhookEvent.event_type,
                    stripe_event_id: webhookEvent.stripe_event_id,
                    attempt_number: webhookEvent.processing_attempts + 1
                }
            )

            toast.success('Webhook retry initiated')
            await loadMonitoringData()
        } catch (error) {
            console.error('Error in handleRetryWebhook:', error)
            toast.error('Failed to retry webhook')
        }
    }

    const createSystemAlert = async (type: string, severity: 'low' | 'medium' | 'high' | 'critical', title: string, message: string) => {
        try {
            const { error } = await supabase
                .from('system_alerts')
                .insert({
                    alert_type: type,
                    severity,
                    title,
                    message,
                    resolved: false
                })

            if (error) {
                console.error('Error creating system alert:', error)
                return
            }

            await loadMonitoringData()
        } catch (error) {
            console.error('Error in createSystemAlert:', error)
        }
    }

    // Check for system issues and create alerts
    useEffect(() => {
        if (systemMetrics.cpu_usage > 80) {
            createSystemAlert('high_cpu', 'high', 'High CPU Usage', `CPU usage is at ${systemMetrics.cpu_usage}%`)
        }
        if (systemMetrics.memory_usage > 90) {
            createSystemAlert('high_memory', 'critical', 'Critical Memory Usage', `Memory usage is at ${systemMetrics.memory_usage}%`)
        }
        if (systemMetrics.response_times.api > 1000) {
            createSystemAlert('slow_response', 'medium', 'Slow API Response', `API response time is ${systemMetrics.response_times.api}ms`)
        }
    }, [systemMetrics])

    const getHealthStatus = () => {
        if (systemMetrics.cpu_usage > 80 || systemMetrics.memory_usage > 90) return 'critical'
        if (systemMetrics.cpu_usage > 60 || systemMetrics.memory_usage > 75) return 'warning'
        return 'healthy'
    }

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600'
            case 'warning': return 'text-yellow-600'
            case 'critical': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const getSeverityBadgeVariant = (severity: string) => {
        switch (severity) {
            case 'critical': return 'destructive'
            case 'high': return 'destructive'
            case 'medium': return 'default'
            case 'low': return 'secondary'
            default: return 'secondary'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return AlertTriangle
            case 'high': return AlertTriangle
            case 'medium': return Clock
            case 'low': return CheckCircle
            default: return Activity
        }
    }

    const currentHealth = getHealthStatus()
    const unresolvedAlerts = systemAlerts.filter(alert => !alert.resolved)
    const failedWebhooks = webhookEvents.filter(event => !event.processed && event.processing_attempts > 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">System Monitoring</h1>
                    <p className="text-gray-600">Monitor system health, performance, and alerts</p>
                </div>
                <Button onClick={loadMonitoringData} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Activity className={`h-4 w-4 ${getHealthColor(currentHealth)}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getHealthColor(currentHealth)}`}>
                            {currentHealth.charAt(0).toUpperCase() + currentHealth.slice(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(systemHealth.last_updated).toLocaleTimeString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemHealth.uptime}%</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemMetrics.response_times.api}ms</div>
                        <p className="text-xs text-muted-foreground">
                            Average API response
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{unresolvedAlerts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Require attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="alerts">
                        Alerts
                        {unresolvedAlerts.length > 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                                {unresolvedAlerts.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="webhooks">
                        Webhooks
                        {failedWebhooks.length > 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                                {failedWebhooks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="database">Database</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* System Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Resources</CardTitle>
                                <CardDescription>Current resource utilization</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="flex items-center gap-2">
                                            <Cpu className="h-4 w-4" />
                                            CPU Usage
                                        </span>
                                        <span>{systemMetrics.cpu_usage}%</span>
                                    </div>
                                    <Progress value={systemMetrics.cpu_usage} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="flex items-center gap-2">
                                            <MemoryStick className="h-4 w-4" />
                                            Memory Usage
                                        </span>
                                        <span>{systemMetrics.memory_usage}%</span>
                                    </div>
                                    <Progress value={systemMetrics.memory_usage} />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="flex items-center gap-2">
                                            <HardDrive className="h-4 w-4" />
                                            Disk Usage
                                        </span>
                                        <span>{systemMetrics.disk_usage}%</span>
                                    </div>
                                    <Progress value={systemMetrics.disk_usage} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Response Times */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Response Times</CardTitle>
                                <CardDescription>Average response times by service</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">API Endpoints</span>
                                    <Badge variant="outline">{systemMetrics.response_times.api}ms</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Database Queries</span>
                                    <Badge variant="outline">{systemMetrics.response_times.database}ms</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">External Services</span>
                                    <Badge variant="outline">{systemMetrics.response_times.external_services}ms</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Network I/O</span>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">↓ {systemMetrics.network_io.incoming} MB/s</Badge>
                                        <Badge variant="outline">↑ {systemMetrics.network_io.outgoing} MB/s</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Alerts</CardTitle>
                            <CardDescription>
                                Active system alerts and notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {unresolvedAlerts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                    <h3 className="font-medium mb-2">No Active Alerts</h3>
                                    <p className="text-sm">All systems are operating normally.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {unresolvedAlerts.map((alert) => {
                                        const SeverityIcon = getSeverityIcon(alert.severity)
                                        return (
                                            <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                                                <SeverityIcon className={`h-5 w-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-500' :
                                                        alert.severity === 'high' ? 'text-orange-500' :
                                                            alert.severity === 'medium' ? 'text-yellow-500' :
                                                                'text-blue-500'
                                                    }`} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{alert.title}</h4>
                                                        <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                                                            {alert.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(alert.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAlert(alert)
                                                        setShowAlertDialog(true)
                                                    }}
                                                >
                                                    Resolve
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="webhooks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Webhook Events</CardTitle>
                            <CardDescription>
                                Recent webhook events and processing status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Attempts</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhookEvents.slice(0, 10).map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="font-mono text-sm">
                                                {event.stripe_event_id.substring(0, 20)}...
                                            </TableCell>
                                            <TableCell>{event.event_type}</TableCell>
                                            <TableCell>
                                                {event.processed ? (
                                                    <Badge variant="outline" className="text-green-600">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Processed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <XCircle className="mr-1 h-3 w-3" />
                                                        Failed
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{event.processing_attempts}</TableCell>
                                            <TableCell>
                                                {new Date(event.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {!event.processed && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRetryWebhook(event)}
                                                    >
                                                        Retry
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="database" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Database Connections</CardTitle>
                                <CardDescription>Current connection pool status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Active Connections</span>
                                    <Badge variant="default">{databaseMetrics.connections.active}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Idle Connections</span>
                                    <Badge variant="outline">{databaseMetrics.connections.idle}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Max Connections</span>
                                    <Badge variant="secondary">{databaseMetrics.connections.max}</Badge>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Connection Usage</span>
                                        <span>
                                            {Math.round((databaseMetrics.connections.active / databaseMetrics.connections.max) * 100)}%
                                        </span>
                                    </div>
                                    <Progress value={(databaseMetrics.connections.active / databaseMetrics.connections.max) * 100} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Query Performance</CardTitle>
                                <CardDescription>Database query metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Queries per Second</span>
                                    <Badge variant="default">{databaseMetrics.queries.queries_per_second}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Avg Query Time</span>
                                    <Badge variant="outline">{databaseMetrics.queries.avg_query_time}ms</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Slow Queries</span>
                                    <Badge variant={databaseMetrics.queries.slow_queries > 5 ? "destructive" : "secondary"}>
                                        {databaseMetrics.queries.slow_queries}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Storage Used</span>
                                        <span>{databaseMetrics.storage.used}GB / {databaseMetrics.storage.available}GB</span>
                                    </div>
                                    <Progress value={databaseMetrics.storage.percentage} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Alert Resolution Dialog */}
            <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Alert</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to mark this alert as resolved?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAlert && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{selectedAlert.title}</h4>
                                    <Badge variant={getSeverityBadgeVariant(selectedAlert.severity)}>
                                        {selectedAlert.severity}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{selectedAlert.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Created: {new Date(selectedAlert.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => selectedAlert && handleResolveAlert(selectedAlert)}>
                            Resolve Alert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}