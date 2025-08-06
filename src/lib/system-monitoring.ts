import { supabase } from './supabaseClient'

export interface SystemAlert {
    id?: string
    alert_type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    message: string
    metadata?: Record<string, any>
    resolved?: boolean
    resolved_by?: string
    resolved_at?: string
}

export interface WebhookEvent {
    id?: string
    stripe_event_id: string
    event_type: string
    processed?: boolean
    processing_attempts?: number
    last_processing_attempt?: string
    error_message?: string
    event_data?: Record<string, any>
}

export interface SystemMetrics {
    timestamp: string
    cpu_usage: number
    memory_usage: number
    disk_usage: number
    response_time: number
    error_rate: number
    active_connections: number
}

export class SystemMonitoringError extends Error {
    constructor(message: string, public code?: string) {
        super(message)
        this.name = 'SystemMonitoringError'
    }
}

export const systemMonitoring = {
    /**
     * Create a system alert
     */
    async createAlert(alert: SystemAlert): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('system_alerts')
                .insert({
                    alert_type: alert.alert_type,
                    severity: alert.severity,
                    title: alert.title,
                    message: alert.message,
                    metadata: alert.metadata || {},
                    resolved: false
                })

            if (error) {
                console.error('Error creating system alert:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in createAlert:', error)
            return false
        }
    },

    /**
     * Get system alerts
     */
    async getAlerts(
        resolved?: boolean,
        severity?: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<SystemAlert[]> {
        try {
            let query = supabase
                .from('system_alerts')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (resolved !== undefined) {
                query = query.eq('resolved', resolved)
            }

            if (severity) {
                query = query.eq('severity', severity)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching system alerts:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error in getAlerts:', error)
            return []
        }
    },

    /**
     * Resolve a system alert
     */
    async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('system_alerts')
                .update({
                    resolved: true,
                    resolved_by: resolvedBy,
                    resolved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', alertId)

            if (error) {
                console.error('Error resolving system alert:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in resolveAlert:', error)
            return false
        }
    },

    /**
     * Log webhook event
     */
    async logWebhookEvent(event: WebhookEvent): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('webhook_events')
                .insert({
                    stripe_event_id: event.stripe_event_id,
                    event_type: event.event_type,
                    processed: event.processed || false,
                    processing_attempts: event.processing_attempts || 0,
                    error_message: event.error_message,
                    event_data: event.event_data || {}
                })

            if (error) {
                console.error('Error logging webhook event:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in logWebhookEvent:', error)
            return false
        }
    },

    /**
     * Update webhook event processing status
     */
    async updateWebhookEvent(
        eventId: string,
        processed: boolean,
        errorMessage?: string
    ): Promise<boolean> {
        try {
            const { data: currentEvent } = await supabase
                .from('webhook_events')
                .select('processing_attempts')
                .eq('id', eventId)
                .single()

            const { error } = await supabase
                .from('webhook_events')
                .update({
                    processed,
                    processing_attempts: (currentEvent?.processing_attempts || 0) + 1,
                    last_processing_attempt: new Date().toISOString(),
                    error_message: errorMessage,
                    updated_at: new Date().toISOString()
                })
                .eq('id', eventId)

            if (error) {
                console.error('Error updating webhook event:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Error in updateWebhookEvent:', error)
            return false
        }
    },

    /**
     * Get webhook events
     */
    async getWebhookEvents(
        processed?: boolean,
        eventType?: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<WebhookEvent[]> {
        try {
            let query = supabase
                .from('webhook_events')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (processed !== undefined) {
                query = query.eq('processed', processed)
            }

            if (eventType) {
                query = query.eq('event_type', eventType)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching webhook events:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error in getWebhookEvents:', error)
            return []
        }
    },

    /**
     * Get failed webhook events that need retry
     */
    async getFailedWebhookEvents(maxAttempts: number = 3): Promise<WebhookEvent[]> {
        try {
            const { data, error } = await supabase
                .from('webhook_events')
                .select('*')
                .eq('processed', false)
                .lt('processing_attempts', maxAttempts)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('Error fetching failed webhook events:', error)
                return []
            }

            return data || []
        } catch (error) {
            console.error('Error in getFailedWebhookEvents:', error)
            return []
        }
    },

    /**
     * Record system metrics
     */
    async recordMetrics(metrics: SystemMetrics): Promise<boolean> {
        try {
            // In a real implementation, this would store metrics in a time-series database
            // For now, we'll just log critical metrics as alerts if thresholds are exceeded

            if (metrics.cpu_usage > 80) {
                await this.createAlert({
                    alert_type: 'high_cpu_usage',
                    severity: metrics.cpu_usage > 90 ? 'critical' : 'high',
                    title: 'High CPU Usage Detected',
                    message: `CPU usage is at ${metrics.cpu_usage}%`,
                    metadata: { cpu_usage: metrics.cpu_usage, timestamp: metrics.timestamp }
                })
            }

            if (metrics.memory_usage > 85) {
                await this.createAlert({
                    alert_type: 'high_memory_usage',
                    severity: metrics.memory_usage > 95 ? 'critical' : 'high',
                    title: 'High Memory Usage Detected',
                    message: `Memory usage is at ${metrics.memory_usage}%`,
                    metadata: { memory_usage: metrics.memory_usage, timestamp: metrics.timestamp }
                })
            }

            if (metrics.response_time > 1000) {
                await this.createAlert({
                    alert_type: 'slow_response_time',
                    severity: metrics.response_time > 2000 ? 'high' : 'medium',
                    title: 'Slow Response Time Detected',
                    message: `Average response time is ${metrics.response_time}ms`,
                    metadata: { response_time: metrics.response_time, timestamp: metrics.timestamp }
                })
            }

            if (metrics.error_rate > 5) {
                await this.createAlert({
                    alert_type: 'high_error_rate',
                    severity: metrics.error_rate > 10 ? 'critical' : 'high',
                    title: 'High Error Rate Detected',
                    message: `Error rate is at ${metrics.error_rate}%`,
                    metadata: { error_rate: metrics.error_rate, timestamp: metrics.timestamp }
                })
            }

            return true
        } catch (error) {
            console.error('Error in recordMetrics:', error)
            return false
        }
    },

    /**
     * Check system health
     */
    async checkSystemHealth(): Promise<{
        status: 'healthy' | 'warning' | 'critical'
        issues: string[]
        metrics: Partial<SystemMetrics>
    }> {
        try {
            // Get recent unresolved alerts
            const recentAlerts = await this.getAlerts(false, undefined, 10)

            // Count critical and high severity alerts
            const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical')
            const highAlerts = recentAlerts.filter(a => a.severity === 'high')

            // Get failed webhook events
            const failedWebhooks = await this.getFailedWebhookEvents()

            const issues: string[] = []
            let status: 'healthy' | 'warning' | 'critical' = 'healthy'

            if (criticalAlerts.length > 0) {
                status = 'critical'
                issues.push(`${criticalAlerts.length} critical alerts`)
            } else if (highAlerts.length > 0 || failedWebhooks.length > 5) {
                status = 'warning'
                if (highAlerts.length > 0) {
                    issues.push(`${highAlerts.length} high priority alerts`)
                }
                if (failedWebhooks.length > 5) {
                    issues.push(`${failedWebhooks.length} failed webhook events`)
                }
            }

            // TODO: Add actual system metrics collection
            const metrics: Partial<SystemMetrics> = {
                timestamp: new Date().toISOString(),
                // These would be collected from actual system monitoring
                cpu_usage: 0,
                memory_usage: 0,
                disk_usage: 0,
                response_time: 0,
                error_rate: 0,
                active_connections: 0
            }

            return { status, issues, metrics }
        } catch (error) {
            console.error('Error in checkSystemHealth:', error)
            return {
                status: 'critical',
                issues: ['Unable to check system health'],
                metrics: { timestamp: new Date().toISOString() }
            }
        }
    },

    /**
     * Send alert notifications
     */
    async sendAlertNotification(alert: SystemAlert, recipients: string[]): Promise<boolean> {
        try {
            // TODO: Implement actual notification sending (email, Slack, etc.)
            // For now, just log the notification
            console.log('Alert notification:', {
                alert: alert.title,
                severity: alert.severity,
                recipients: recipients.length,
                message: alert.message
            })

            return true
        } catch (error) {
            console.error('Error in sendAlertNotification:', error)
            return false
        }
    },

    /**
     * Auto-resolve stale alerts
     */
    async autoResolveStaleAlerts(maxAgeHours: number = 24): Promise<number> {
        try {
            const cutoffTime = new Date()
            cutoffTime.setHours(cutoffTime.getHours() - maxAgeHours)

            // Get alerts that are old and of low/medium severity
            const { data: staleAlerts, error: fetchError } = await supabase
                .from('system_alerts')
                .select('id')
                .eq('resolved', false)
                .in('severity', ['low', 'medium'])
                .lt('created_at', cutoffTime.toISOString())

            if (fetchError) {
                console.error('Error fetching stale alerts:', fetchError)
                return 0
            }

            if (!staleAlerts || staleAlerts.length === 0) {
                return 0
            }

            // Auto-resolve these alerts
            const { error: updateError } = await supabase
                .from('system_alerts')
                .update({
                    resolved: true,
                    resolved_by: 'system',
                    resolved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .in('id', staleAlerts.map(a => a.id))

            if (updateError) {
                console.error('Error auto-resolving stale alerts:', updateError)
                return 0
            }

            return staleAlerts.length
        } catch (error) {
            console.error('Error in autoResolveStaleAlerts:', error)
            return 0
        }
    },

    /**
     * Get system monitoring dashboard data
     */
    async getDashboardData(): Promise<{
        alerts: {
            total: number
            unresolved: number
            critical: number
            high: number
        }
        webhooks: {
            total_today: number
            failed_today: number
            success_rate: number
        }
        system_health: {
            status: 'healthy' | 'warning' | 'critical'
            uptime: number
            response_time: number
        }
    }> {
        try {
            // Get alert counts
            const [allAlerts, unresolvedAlerts] = await Promise.all([
                this.getAlerts(undefined, undefined, 1000),
                this.getAlerts(false, undefined, 1000)
            ])

            const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical')
            const highAlerts = unresolvedAlerts.filter(a => a.severity === 'high')

            // Get today's webhook events
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { data: todayWebhooks } = await supabase
                .from('webhook_events')
                .select('processed')
                .gte('created_at', today.toISOString())

            const totalWebhooksToday = todayWebhooks?.length || 0
            const successfulWebhooksToday = todayWebhooks?.filter(w => w.processed).length || 0
            const failedWebhooksToday = totalWebhooksToday - successfulWebhooksToday

            // Calculate success rate
            const successRate = totalWebhooksToday > 0
                ? (successfulWebhooksToday / totalWebhooksToday) * 100
                : 100

            // Get system health
            const healthCheck = await this.checkSystemHealth()

            return {
                alerts: {
                    total: allAlerts.length,
                    unresolved: unresolvedAlerts.length,
                    critical: criticalAlerts.length,
                    high: highAlerts.length
                },
                webhooks: {
                    total_today: totalWebhooksToday,
                    failed_today: failedWebhooksToday,
                    success_rate: successRate
                },
                system_health: {
                    status: healthCheck.status,
                    uptime: 99.9, // TODO: Calculate actual uptime
                    response_time: 245 // TODO: Get actual response time
                }
            }
        } catch (error) {
            console.error('Error in getDashboardData:', error)
            return {
                alerts: { total: 0, unresolved: 0, critical: 0, high: 0 },
                webhooks: { total_today: 0, failed_today: 0, success_rate: 0 },
                system_health: { status: 'critical', uptime: 0, response_time: 0 }
            }
        }
    }
}