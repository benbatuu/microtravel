"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    CreditCard,
    Plus,
    Trash2,
    Check,
    Shield,
    Calendar,
    Lock,
} from "lucide-react";

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'bank';
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    holderName: string;
}

const mockPaymentMethods: PaymentMethod[] = [
    {
        id: '1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2027,
        isDefault: true,
        holderName: 'John Doe'
    },
    {
        id: '2',
        type: 'card',
        brand: 'mastercard',
        last4: '5555',
        expiryMonth: 8,
        expiryYear: 2026,
        isDefault: false,
        holderName: 'John Doe'
    }
];

const cardBrandLogos = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    discover: '💳'
};

export default function PaymentMethodsPage() {
    const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCard, setNewCard] = useState({
        number: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        holderName: ''
    });

    const handleSetDefault = (id: string) => {
        setPaymentMethods(methods =>
            methods.map(method => ({
                ...method,
                isDefault: method.id === id
            }))
        );
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this payment method?')) {
            setPaymentMethods(methods => methods.filter(method => method.id !== id));
        }
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real implementation, this would integrate with Stripe
        const newMethod: PaymentMethod = {
            id: Date.now().toString(),
            type: 'card',
            brand: 'visa', // This would be determined by the card number
            last4: newCard.number.slice(-4),
            expiryMonth: parseInt(newCard.expiryMonth),
            expiryYear: parseInt(newCard.expiryYear),
            isDefault: paymentMethods.length === 0,
            holderName: newCard.holderName
        };

        setPaymentMethods([...paymentMethods, newMethod]);
        setNewCard({ number: '', expiryMonth: '', expiryYear: '', cvc: '', holderName: '' });
        setShowAddForm(false);
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setNewCard(prev => ({ ...prev, number: formatted }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Payment Methods
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Manage your payment methods and billing information
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                </Button>
            </div>

            {/* Security Notice */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Your Payment Information is Secure
                            </h3>
                            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                                We use industry-standard encryption and work with trusted payment processors like Stripe
                                to ensure your payment information is always protected. We never store your full card details on our servers.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add Payment Method Form */}
            {showAddForm && (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5" />
                            <span>Add New Payment Method</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCard} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cardholder Name
                                </label>
                                <Input
                                    type="text"
                                    value={newCard.holderName}
                                    onChange={(e) => setNewCard(prev => ({ ...prev, holderName: e.target.value }))}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Card Number
                                </label>
                                <Input
                                    type="text"
                                    value={newCard.number}
                                    onChange={handleCardNumberChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Month
                                    </label>
                                    <select
                                        value={newCard.expiryMonth}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, expiryMonth: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">MM</option>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                            <option key={month} value={month.toString().padStart(2, '0')}>
                                                {month.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Year
                                    </label>
                                    <select
                                        value={newCard.expiryYear}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, expiryYear: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">YYYY</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        CVC
                                    </label>
                                    <Input
                                        type="text"
                                        value={newCard.cvc}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                        placeholder="123"
                                        maxLength={4}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Add Card Securely
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Payment Methods List */}
            <div className="space-y-4">
                {paymentMethods.map((method) => (
                    <Card key={method.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                                        {cardBrandLogos[method.brand as keyof typeof cardBrandLogos]}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                                {method.brand} •••• {method.last4}
                                            </h3>
                                            {method.isDefault && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {method.holderName}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-1">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {!method.isDefault && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetDefault(method.id)}
                                            className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                        >
                                            Set as Default
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(method.id)}
                                        className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {paymentMethods.length === 0 && (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardContent className="p-12 text-center">
                        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Payment Methods
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Add a payment method to start booking your micro-travel experiences.
                        </p>
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Payment Method
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Security Information */}
            <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-lg border-0 shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                        <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Payment Security
                            </h3>
                            <div className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                                <p>• All payment information is encrypted and processed securely through Stripe</p>
                                <p>• We never store your full credit card details on our servers</p>
                                <p>• Your payment methods are protected by industry-standard security measures</p>
                                <p>• You can remove payment methods at any time from this page</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}