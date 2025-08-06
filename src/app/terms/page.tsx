"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, CreditCard, Shield, AlertTriangle, Mail } from "lucide-react";

const sections = [
    {
        id: "acceptance",
        title: "Acceptance of Terms",
        icon: <FileText className="w-6 h-6" />,
        content: [
            {
                text: "By accessing and using MicroTravel's website, mobile application, and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
            },
            {
                text: "These Terms of Service constitute a legally binding agreement between you and MicroTravel. Your use of our services is also governed by our Privacy Policy, which is incorporated by reference into these Terms."
            }
        ]
    },
    {
        id: "services",
        title: "Description of Services",
        icon: <Shield className="w-6 h-6" />,
        content: [
            {
                subtitle: "Travel Booking Services",
                text: "MicroTravel provides a platform for booking short-duration travel experiences, including accommodations, activities, and related services. We act as an intermediary between you and travel service providers."
            },
            {
                subtitle: "Platform Features",
                text: "Our platform includes features such as travel recommendations, booking management, user reviews, and customer support. These features are provided to enhance your travel experience."
            },
            {
                subtitle: "Service Availability",
                text: "We strive to maintain continuous service availability, but we do not guarantee uninterrupted access to our platform. We may temporarily suspend services for maintenance or updates."
            }
        ]
    },
    {
        id: "user-accounts",
        title: "User Accounts and Registration",
        icon: <Shield className="w-6 h-6" />,
        content: [
            {
                subtitle: "Account Creation",
                text: "To use certain features of our services, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary."
            },
            {
                subtitle: "Account Security",
                text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account."
            },
            {
                subtitle: "Account Termination",
                text: "We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason we deem appropriate."
            }
        ]
    },
    {
        id: "booking-payment",
        title: "Booking and Payment Terms",
        icon: <CreditCard className="w-6 h-6" />,
        content: [
            {
                subtitle: "Booking Process",
                text: "When you make a booking through our platform, you enter into a contract with the travel service provider. We facilitate this transaction but are not a party to the contract between you and the provider."
            },
            {
                subtitle: "Payment Processing",
                text: "All payments are processed securely through our payment partners. By providing payment information, you authorize us to charge the specified amount for your booking and any applicable fees."
            },
            {
                subtitle: "Pricing and Fees",
                text: "Prices displayed on our platform are subject to change without notice. Additional fees may apply for certain services. All prices include applicable taxes unless otherwise stated."
            },
            {
                subtitle: "Cancellation and Refunds",
                text: "Cancellation and refund policies vary by service provider and booking type. Please review the specific terms for each booking before confirming your reservation."
            }
        ]
    },
    {
        id: "user-conduct",
        title: "User Conduct and Prohibited Uses",
        icon: <AlertTriangle className="w-6 h-6" />,
        content: [
            {
                subtitle: "Acceptable Use",
                text: "You agree to use our services only for lawful purposes and in accordance with these Terms. You must not use our services in any way that could damage, disable, or impair our platform."
            },
            {
                subtitle: "Prohibited Activities",
                text: "You may not: (a) violate any applicable laws or regulations; (b) infringe on intellectual property rights; (c) transmit harmful or malicious code; (d) engage in fraudulent activities; (e) harass or harm other users."
            },
            {
                subtitle: "Content Guidelines",
                text: "Any content you submit must be accurate, lawful, and not infringe on third-party rights. We reserve the right to remove content that violates these guidelines."
            }
        ]
    },
    {
        id: "liability",
        title: "Limitation of Liability",
        icon: <Scale className="w-6 h-6" />,
        content: [
            {
                subtitle: "Service Disclaimer",
                text: "Our services are provided 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of information on our platform."
            },
            {
                subtitle: "Third-Party Services",
                text: "We are not responsible for the quality, safety, or legality of services provided by third-party travel providers. Your use of such services is at your own risk."
            },
            {
                subtitle: "Damages Limitation",
                text: "To the maximum extent permitted by law, our liability for any damages arising from your use of our services is limited to the amount you paid for the specific service that gave rise to the claim."
            }
        ]
    }
];

const tableOfContents = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "services", title: "Description of Services" },
    { id: "user-accounts", title: "User Accounts and Registration" },
    { id: "booking-payment", title: "Booking and Payment Terms" },
    { id: "user-conduct", title: "User Conduct and Prohibited Uses" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "privacy", title: "Privacy and Data Protection" },
    { id: "modifications", title: "Modifications to Terms" },
    { id: "governing-law", title: "Governing Law" },
    { id: "contact", title: "Contact Information" }
];

export default function TermsPage() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                            Please read these terms carefully before using our services. By using MicroTravel, you agree to these terms and conditions.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            Last updated: January 1, 2025
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Table of Contents */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl sticky top-8">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                        Table of Contents
                                    </h3>
                                    <nav className="space-y-2">
                                        {tableOfContents.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                className="block w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-1"
                                            >
                                                {item.title}
                                            </button>
                                        ))}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* Introduction */}
                            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                        Welcome to MicroTravel. These Terms of Service ("Terms") govern your use of our website,
                                        mobile application, and services. Please read these Terms carefully before using our platform.
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        By accessing or using MicroTravel, you agree to be bound by these Terms and all applicable
                                        laws and regulations. If you do not agree with any of these terms, you are prohibited from
                                        using or accessing our services.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Main Sections */}
                            {sections.map((section) => (
                                <Card key={section.id} id={section.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                    <CardContent className="p-8">
                                        <div className="flex items-center mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white mr-4">
                                                {section.icon}
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {section.title}
                                            </h2>
                                        </div>

                                        <div className="space-y-6">
                                            {section.content.map((item, index) => (
                                                <div key={index}>
                                                    {item.subtitle && (
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                            {item.subtitle}
                                                        </h3>
                                                    )}
                                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Additional Sections */}
                            <Card id="intellectual-property" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Intellectual Property Rights
                                    </h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            The content, features, and functionality of our services are owned by MicroTravel and are
                                            protected by international copyright, trademark, patent, trade secret, and other intellectual
                                            property laws.
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            You may not reproduce, distribute, modify, create derivative works of, publicly display,
                                            publicly perform, republish, download, store, or transmit any of our content without our
                                            prior written consent.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card id="privacy" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Privacy and Data Protection
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect
                                        your information when you use our services. By using our services, you agree to the collection
                                        and use of information in accordance with our Privacy Policy.
                                    </p>
                                    <div className="mt-4">
                                        <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                                            Read our Privacy Policy
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card id="modifications" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Modifications to Terms
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        We reserve the right to modify these Terms at any time. We will notify you of any changes by
                                        posting the new Terms on this page and updating the "Last updated" date. Your continued use
                                        of our services after any modifications constitutes acceptance of the new Terms.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="governing-law" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Governing Law and Dispute Resolution
                                    </h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            These Terms are governed by and construed in accordance with the laws of the State of New York,
                                            without regard to its conflict of law principles.
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            Any disputes arising from these Terms or your use of our services will be resolved through
                                            binding arbitration in accordance with the rules of the American Arbitration Association.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card id="contact" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white mr-4">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Contact Information
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            If you have any questions about these Terms of Service, please contact us:
                                        </p>
                                        <div className="space-y-2">
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <strong>Email:</strong> legal@microtravel.com
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <strong>Address:</strong> 123 Travel Street, New York, NY 10001
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <strong>Phone:</strong> +1 (555) 123-4567
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}