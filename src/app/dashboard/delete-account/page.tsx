"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertTriangle,
    Download,
    Trash2,
    Shield,
    Clock,
    FileText,
    Database,
    CreditCard,
    Mail,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";

const deletionReasons = [
    "I'm not using the service enough",
    "The service is too expensive",
    "I found a better alternative",
    "Privacy concerns",
    "Technical issues",
    "Poor customer service",
    "Other"
];

const dataTypes = [
    {
        type: "Profile Information",
        description: "Your personal details, preferences, and account settings",
        icon: <Shield className="w-5 h-5" />,
        size: "< 1MB"
    },
    {
        type: "Travel Experiences",
        description: "Your saved experiences, reviews, and travel history",
        icon: <FileText className="w-5 h-5" />,
        size: "~5MB"
    },
    {
        type: "Photos & Media",
        description: "All uploaded images and media files",
        icon: <Database className="w-5 h-5" />,
        size: "~120MB"
    },
    {
        type: "Billing History",
        description: "Payment records and invoice history",
        icon: <CreditCard className="w-5 h-5" />,
        size: "< 1MB"
    }
];

export default function DeleteAccountPage() {
    const [step, setStep] = useState(1);
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [otherReason, setOtherReason] = useState("");
    const [confirmationText, setConfirmationText] = useState("");
    const [exportRequested, setExportRequested] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleReasonChange = (reason: string, checked: boolean) => {
        if (checked) {
            setSelectedReasons([...selectedReasons, reason]);
        } else {
            setSelectedReasons(selectedReasons.filter(r => r !== reason));
        }
    };

    const handleExportData = () => {
        // In a real implementation, this would trigger data export
        setExportRequested(true);
        alert("Data export has been initiated. You'll receive an email with download links within 24 hours.");
    };

    const handleDeleteAccount = async () => {
        if (confirmationText !== "DELETE MY ACCOUNT") {
            alert("Please type the confirmation text exactly as shown.");
            return;
        }

        setIsDeleting(true);

        // Simulate deletion process
        await new Promise(resolve => setTimeout(resolve, 3000));

        alert("Your account has been scheduled for deletion. You have 30 days to reactivate if you change your mind.");
        setIsDeleting(false);
    };

    if (step === 1) {
        return (
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Settings
                        </Button>
                    </Link>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Delete Account
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        We`re sorry to see you go. Before you delete your account, please review the information below.
                    </p>
                </div>

                {/* Warning */}
                <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                                    Account Deletion is Permanent
                                </h3>
                                <div className="text-red-800 dark:text-red-200 text-sm space-y-2">
                                    <p>Once you delete your account, there`s no going back. This action will:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Permanently delete all your travel experiences and data</li>
                                        <li>Cancel any active subscriptions immediately</li>
                                        <li>Remove access to all premium features</li>
                                        <li>Delete all uploaded photos and media</li>
                                        <li>Remove your profile from our community</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Export */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Download className="w-5 h-5" />
                            <span>Export Your Data</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            Before deleting your account, you can download a copy of your data. This includes all your
                            travel experiences, photos, and account information.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dataTypes.map((data, index) => (
                                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                        {data.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {data.type}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {data.description}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {data.size}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                        Export Processing Time
                                    </p>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        Data exports typically take 24-48 hours to process
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleExportData}
                                disabled={exportRequested}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {exportRequested ? "Export Requested" : "Export Data"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle>Help Us Improve</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-gray-600 dark:text-gray-300">
                            We`d love to know why you`re leaving. Your feedback helps us improve MicroTravel for everyone.
                        </p>

                        <div className="space-y-3">
                            <p className="font-medium text-gray-900 dark:text-white">
                                What`s your main reason for leaving? (Select all that apply)
                            </p>
                            {deletionReasons.map((reason, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`reason-${index}`}
                                        checked={selectedReasons.includes(reason)}
                                        onCheckedChange={(checked) => handleReasonChange(reason, checked as boolean)}
                                    />
                                    <label
                                        htmlFor={`reason-${index}`}
                                        className="text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        {reason}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {selectedReasons.includes("Other") && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Please specify:
                                </label>
                                <textarea
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                    placeholder="Tell us more about your reason for leaving..."
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Continue Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={() => setStep(2)}
                        className="bg-red-600 hover:bg-red-700 text-white px-8"
                    >
                        Continue to Delete Account
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Confirm Account Deletion
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                    This is your final chance to reconsider. Account deletion cannot be undone.
                </p>
            </div>

            {/* Final Warning */}
            <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">
                                Final Warning
                            </h3>
                            <div className="text-red-800 dark:text-red-200 space-y-3">
                                <p className="font-medium">
                                    You are about to permanently delete your MicroTravel account. This action will:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="font-medium">Immediately:</p>
                                        <ul className="text-sm space-y-1">
                                            <li>• Cancel your active subscription</li>
                                            <li>• Revoke access to all features</li>
                                            <li>• Remove your profile from community</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-medium">Within 30 days:</p>
                                        <ul className="text-sm space-y-1">
                                            <li>• Delete all travel experiences</li>
                                            <li>• Remove all uploaded photos</li>
                                            <li>• Purge all personal data</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Grace Period */}
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                        <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                                30-Day Grace Period
                            </h3>
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                After deletion, your account will be deactivated but not permanently removed for 30 days.
                                During this time, you can contact support to reactivate your account and restore your data.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        <span>Confirm Deletion</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            To confirm account deletion, please type <strong>DELETE MY ACCOUNT</strong> in the box below:
                        </p>
                        <Input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="Type: DELETE MY ACCOUNT"
                            className="font-mono"
                        />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            Need help instead of deletion?
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                            Our support team is here to help with any issues you`re experiencing.
                        </p>
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" size="sm">
                                <Mail className="w-4 h-4 mr-2" />
                                Contact Support
                            </Button>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                support@microtravel.com
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            disabled={confirmationText !== "DELETE MY ACCOUNT" || isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white px-8"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting Account...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete My Account
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}