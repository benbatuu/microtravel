"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Download,
    Search,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Receipt,
    DollarSign
} from "lucide-react";

interface Invoice {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    invoiceNumber: string;
    paymentMethod: string;
    downloadUrl?: string;
}

const mockInvoices: Invoice[] = [
    {
        id: '1',
        date: '2025-01-01',
        amount: 29.99,
        status: 'paid',
        description: 'Explorer Plan - Monthly Subscription',
        invoiceNumber: 'INV-2025-001',
        paymentMethod: '**** 4242',
        downloadUrl: '#'
    },
    {
        id: '2',
        date: '2024-12-01',
        amount: 29.99,
        status: 'paid',
        description: 'Explorer Plan - Monthly Subscription',
        invoiceNumber: 'INV-2024-012',
        paymentMethod: '**** 4242',
        downloadUrl: '#'
    },
    {
        id: '3',
        date: '2024-11-01',
        amount: 29.99,
        status: 'paid',
        description: 'Explorer Plan - Monthly Subscription',
        invoiceNumber: 'INV-2024-011',
        paymentMethod: '**** 4242',
        downloadUrl: '#'
    },
    {
        id: '4',
        date: '2024-10-15',
        amount: 99.99,
        status: 'paid',
        description: 'Traveler Plan - Annual Subscription',
        invoiceNumber: 'INV-2024-010',
        paymentMethod: '**** 4242',
        downloadUrl: '#'
    },
    {
        id: '5',
        date: '2024-10-01',
        amount: 29.99,
        status: 'failed',
        description: 'Explorer Plan - Monthly Subscription',
        invoiceNumber: 'INV-2024-009',
        paymentMethod: '**** 4242'
    }
];

const statusConfig = {
    paid: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20',
        label: 'Paid'
    },
    pending: {
        icon: <Clock className="w-4 h-4" />,
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        label: 'Pending'
    },
    failed: {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20',
        label: 'Failed'
    }
};

export default function BillingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    const filteredInvoices = mockInvoices.filter(invoice => {
        const matchesSearch = invoice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
        const matchesDate = !dateRange.start || !dateRange.end ||
            (new Date(invoice.date) >= new Date(dateRange.start) &&
                new Date(invoice.date) <= new Date(dateRange.end));

        return matchesSearch && matchesStatus && matchesDate;
    });

    const totalPaid = mockInvoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0);

    const handleDownload = (invoice: Invoice) => {
        // In a real implementation, this would download the actual invoice
        console.log('Downloading invoice:', invoice.invoiceNumber);
        alert(`Downloading ${invoice.invoiceNumber}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Billing History
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        View and download your payment history and invoices
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatAmount(totalPaid)}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Total Paid
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {mockInvoices.length}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Total Invoices
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {mockInvoices.filter(i => i.status === 'paid').length}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Successful Payments
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search invoices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full lg:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-full lg:w-40"
                            />
                            <Input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-full lg:w-40"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Receipt className="w-5 h-5" />
                        <span>Invoice History</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Invoice
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredInvoices.map((invoice) => {
                                    const status = statusConfig[invoice.status];
                                    return (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {invoice.invoiceNumber}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {invoice.paymentMethod}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {formatDate(invoice.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {invoice.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {formatAmount(invoice.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                    {status.icon}
                                                    <span className="ml-1">{status.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {invoice.downloadUrl && invoice.status === 'paid' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownload(invoice)}
                                                        className="flex items-center space-x-1"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span>Download</span>
                                                    </Button>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredInvoices.length === 0 && (
                        <div className="text-center py-12">
                            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No invoices found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Try adjusting your search criteria or date range.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Export Your Data
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Download your complete billing history for your records
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}