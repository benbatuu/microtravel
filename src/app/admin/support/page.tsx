/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { adminAuthUtils } from '@/lib/admin-auth'
import {
    HeadphonesIcon,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertTriangle,
    MoreHorizontal,
    Search,
    Plus,
    Send,
    Paperclip,
    Eye
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface SupportTicket {
    id: string
    ticket_number: string
    user_id: string | null
    subject: string
    description: string
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assigned_to: string | null
    category: string | null
    tags: string[]
    created_at: string
    updated_at: string
    user?: {
        email: string
        full_name: string | null
    }
    assigned_admin?: {
        email: string
        full_name: string | null
    }
    messages?: TicketMessage[]
}

interface TicketMessage {
    id: string
    ticket_id: string
    sender_id: string
    message: string
    is_internal: boolean
    created_at: string
    sender?: {
        email: string
        full_name: string | null
        is_admin: boolean
    }
}

interface SupportStats {
    total_tickets: number
    open_tickets: number
    resolved_today: number
    avg_response_time: number
    satisfaction_rate: number
    tickets_by_priority: Record<string, number>
    tickets_by_status: Record<string, number>
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
    const [stats, setStats] = useState<SupportStats>({
        total_tickets: 0,
        open_tickets: 0,
        resolved_today: 0,
        avg_response_time: 0,
        satisfaction_rate: 0,
        tickets_by_priority: {},
        tickets_by_status: {}
    })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [showTicketDialog, setShowTicketDialog] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)

    const auth = useAuth()

    useEffect(() => {
        loadSupportData()
    }, [])

    const loadSupportData = async () => {
        try {
            setLoading(true)

            // Load support tickets with user and admin data
            const { data: ticketsData, error: ticketsError } = await supabase
                .from('support_tickets')
                .select(`
                    *,
                    user:profiles!support_tickets_user_id_fkey(
                        email,
                        full_name
                    ),
                    assigned_admin:profiles!support_tickets_assigned_to_fkey(
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })

            if (ticketsError) {
                console.error('Error loading tickets:', ticketsError)
                toast.error('Failed to load support tickets')
                return
            }

            setTickets(ticketsData || [])

            // Calculate stats
            const totalTickets = ticketsData?.length || 0
            const openTickets = ticketsData?.filter(t => ['open', 'in_progress'].includes(t.status)).length || 0

            // Calculate tickets resolved today
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const resolvedToday = ticketsData?.filter(t =>
                t.status === 'resolved' && new Date(t.updated_at) >= today
            ).length || 0

            // Calculate priority and status distributions
            const priorityDist = ticketsData?.reduce((acc, ticket) => {
                acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}

            const statusDist = ticketsData?.reduce((acc, ticket) => {
                acc[ticket.status] = (acc[ticket.status] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}

            setStats({
                total_tickets: totalTickets,
                open_tickets: openTickets,
                resolved_today: resolvedToday,
                avg_response_time: 2.4, // TODO: Calculate from actual response times
                satisfaction_rate: 94.5, // TODO: Calculate from feedback
                tickets_by_priority: priorityDist,
                tickets_by_status: statusDist
            })

        } catch (error) {
            console.error('Error loading support data:', error)
            toast.error('Failed to load support data')
        } finally {
            setLoading(false)
        }
    }

    const loadTicketMessages = async (ticketId: string) => {
        try {
            const { data: messagesData, error } = await supabase
                .from('support_ticket_messages')
                .select(`
                    *,
                    sender:profiles!support_ticket_messages_sender_id_fkey(
                        email,
                        full_name,
                        is_admin
                    )
                `)
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('Error loading messages:', error)
                return []
            }

            return messagesData || []
        } catch (error) {
            console.error('Error in loadTicketMessages:', error)
            return []
        }
    }

    const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    ...(newStatus === 'in_progress' && { assigned_to: auth.user?.id })
                })
                .eq('id', ticketId)

            if (error) {
                console.error('Error updating ticket status:', error)
                toast.error('Failed to update ticket status')
                return
            }

            // Log admin action
            await adminAuthUtils.logAdminAction(
                auth.user?.id || '',
                'update_ticket_status',
                'support_ticket',
                ticketId,
                {
                    new_status: newStatus,
                    previous_status: selectedTicket?.status
                }
            )

            toast.success('Ticket status updated successfully')
            await loadSupportData()

            // Update selected ticket if it's the one being updated
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null)
            }
        } catch (error) {
            console.error('Error in handleUpdateTicketStatus:', error)
            toast.error('Failed to update ticket status')
        }
    }

    const handleSendMessage = async () => {
        if (!selectedTicket || !newMessage.trim()) return

        try {
            setSendingMessage(true)

            const { error } = await supabase
                .from('support_ticket_messages')
                .insert({
                    ticket_id: selectedTicket.id,
                    sender_id: auth.user?.id,
                    message: newMessage.trim(),
                    is_internal: false
                })

            if (error) {
                console.error('Error sending message:', error)
                toast.error('Failed to send message')
                return
            }

            // Update ticket status to in_progress if it's open
            if (selectedTicket.status === 'open') {
                await handleUpdateTicketStatus(selectedTicket.id, 'in_progress')
            }

            // Log admin action
            await adminAuthUtils.logAdminAction(
                auth.user?.id || '',
                'send_ticket_message',
                'support_ticket',
                selectedTicket.id,
                {
                    message_length: newMessage.length,
                    ticket_number: selectedTicket.ticket_number
                }
            )

            setNewMessage('')
            toast.success('Message sent successfully')

            // Reload messages for the selected ticket
            const messages = await loadTicketMessages(selectedTicket.id)
            setSelectedTicket(prev => prev ? { ...prev, messages } : null)
        } catch (error) {
            console.error('Error in handleSendMessage:', error)
            toast.error('Failed to send message')
        } finally {
            setSendingMessage(false)
        }
    }

    const openTicketDialog = async (ticket: SupportTicket) => {
        const messages = await loadTicketMessages(ticket.id)
        setSelectedTicket({ ...ticket, messages })
        setShowTicketDialog(true)
    }

    const getPriorityBadgeVariant = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'destructive'
            case 'high': return 'destructive'
            case 'medium': return 'default'
            case 'low': return 'secondary'
            default: return 'secondary'
        }
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'open': return 'destructive'
            case 'in_progress': return 'default'
            case 'resolved': return 'outline'
            case 'closed': return 'secondary'
            default: return 'secondary'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return AlertTriangle
            case 'in_progress': return Clock
            case 'resolved': return CheckCircle
            case 'closed': return CheckCircle
            default: return MessageSquare
        }
    }

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = searchQuery === '' ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ticket.user?.email && ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter

        return matchesSearch && matchesStatus && matchesPriority
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Support Management</h1>
                    <p className="text-gray-600">Manage customer support tickets and inquiries</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Ticket
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_tickets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.open_tickets}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.resolved_today}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avg_response_time}h</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                        <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.satisfaction_rate}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
                    <CardDescription>
                        Manage customer support requests and inquiries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticket</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map((ticket) => {
                                const StatusIcon = getStatusIcon(ticket.status)
                                return (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className="h-4 w-4 text-gray-500" />
                                                <span className="font-mono text-sm">{ticket.ticket_number}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {ticket.user?.full_name || 'Anonymous'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {ticket.user?.email || 'No email'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs truncate" title={ticket.subject}>
                                                {ticket.subject}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                                                {ticket.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => openTicketDialog(ticket)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {ticket.status === 'open' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                                                        >
                                                            <Clock className="mr-2 h-4 w-4" />
                                                            Start Working
                                                        </DropdownMenuItem>
                                                    )}
                                                    {['open', 'in_progress'].includes(ticket.status) && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Mark Resolved
                                                        </DropdownMenuItem>
                                                    )}
                                                    {ticket.status === 'resolved' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
                                                        >
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Close Ticket
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Ticket Details Dialog */}
            <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Ticket {selectedTicket?.ticket_number}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTicket?.subject}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="space-y-6">
                            {/* Ticket Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Customer</label>
                                    <p className="font-medium">{selectedTicket.user?.full_name || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-600">{selectedTicket.user?.email || 'No email'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">
                                        <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>
                                            {selectedTicket.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Priority</label>
                                    <div className="mt-1">
                                        <Badge variant={getPriorityBadgeVariant(selectedTicket.priority)}>
                                            {selectedTicket.priority}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created</label>
                                    <p className="text-sm">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Original Description */}
                            <div>
                                <h4 className="font-medium mb-2">Original Request</h4>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div>
                                <h4 className="font-medium mb-2">Conversation</h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {selectedTicket.messages?.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender?.is_admin ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${message.sender?.is_admin
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium">
                                                        {message.sender?.full_name || message.sender?.email || 'Unknown'}
                                                    </span>
                                                    <span className="text-xs opacity-75">
                                                        {new Date(message.created_at).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reply Form */}
                            <div>
                                <h4 className="font-medium mb-2">Reply</h4>
                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Type your response..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        rows={4}
                                    />
                                    <div className="flex justify-between">
                                        <Button variant="outline" size="sm">
                                            <Paperclip className="mr-2 h-4 w-4" />
                                            Attach File
                                        </Button>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || sendingMessage}
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {sendingMessage ? 'Sending...' : 'Send Reply'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}