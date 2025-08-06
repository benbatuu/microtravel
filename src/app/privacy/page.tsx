"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Globe, Mail } from "lucide-react";

const sections = [
    {
        id: "information-collection",
        title: "Information We Collect",
        icon: <Eye className="w-6 h-6" />,
        content: [
            {
                subtitle: "Personal Information",
                text: "We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes your name, email address, phone number, payment information, and travel preferences."
            },
            {
                subtitle: "Usage Information",
                text: "We automatically collect information about how you use our services, including your IP address, browser type, device information, pages visited, and the time and date of your visits."
            },
            {
                subtitle: "Location Information",
                text: "With your consent, we may collect information about your location to provide location-based services and improve your travel experience."
            }
        ]
    },
    {
        id: "information-use",
        title: "How We Use Your Information",
        icon: <UserCheck className="w-6 h-6" />,
        content: [
            {
                subtitle: "Service Provision",
                text: "We use your information to provide, maintain, and improve our services, process bookings, send confirmations, and provide customer support."
            },
            {
                subtitle: "Communication",
                text: "We may use your information to send you updates about your bookings, promotional offers, newsletters, and other communications related to our services."
            },
            {
                subtitle: "Personalization",
                text: "We use your information to personalize your experience, recommend travel experiences, and tailor our services to your preferences."
            },
            {
                subtitle: "Legal Compliance",
                text: "We may use your information to comply with legal obligations, resolve disputes, and enforce our agreements."
            }
        ]
    },
    {
        id: "information-sharing",
        title: "Information Sharing",
        icon: <Globe className="w-6 h-6" />,
        content: [
            {
                subtitle: "Service Providers",
                text: "We may share your information with third-party service providers who help us operate our business, such as payment processors, travel partners, and technology providers."
            },
            {
                subtitle: "Business Transfers",
                text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction."
            },
            {
                subtitle: "Legal Requirements",
                text: "We may disclose your information if required by law, court order, or government request, or to protect our rights and safety."
            },
            {
                subtitle: "Consent",
                text: "We may share your information with your consent or at your direction."
            }
        ]
    },
    {
        id: "data-security",
        title: "Data Security",
        icon: <Lock className="w-6 h-6" />,
        content: [
            {
                subtitle: "Security Measures",
                text: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
            },
            {
                subtitle: "Encryption",
                text: "We use industry-standard encryption to protect sensitive information during transmission and storage."
            },
            {
                subtitle: "Access Controls",
                text: "We limit access to your personal information to employees and contractors who need it to perform their job functions."
            },
            {
                subtitle: "Regular Audits",
                text: "We regularly review and update our security practices to ensure the ongoing protection of your information."
            }
        ]
    },
    {
        id: "your-rights",
        title: "Your Rights and Choices",
        icon: <Shield className="w-6 h-6" />,
        content: [
            {
                subtitle: "Access and Correction",
                text: "You have the right to access, update, or correct your personal information. You can do this through your account settings or by contacting us."
            },
            {
                subtitle: "Data Portability",
                text: "You have the right to request a copy of your personal information in a structured, machine-readable format."
            },
            {
                subtitle: "Deletion",
                text: "You have the right to request deletion of your personal information, subject to certain legal and business requirements."
            },
            {
                subtitle: "Marketing Communications",
                text: "You can opt out of receiving marketing communications from us by following the unsubscribe instructions in our emails or contacting us directly."
            },
            {
                subtitle: "Cookies",
                text: "You can control cookies through your browser settings, though this may affect the functionality of our services."
            }
        ]
    }
];

const tableOfContents = [
    { id: "information-collection", title: "Information We Collect" },
    { id: "information-use", title: "How We Use Your Information" },
    { id: "information-sharing", title: "Information Sharing" },
    { id: "data-security", title: "Data Security" },
    { id: "your-rights", title: "Your Rights and Choices" },
    { id: "cookies", title: "Cookies and Tracking" },
    { id: "children", title: "Children's Privacy" },
    { id: "international", title: "International Transfers" },
    { id: "retention", title: "Data Retention" },
    { id: "changes", title: "Changes to This Policy" },
    { id: "contact", title: "Contact Us" }
];

export default function PrivacyPage() {
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
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
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
                                        At MicroTravel, we are committed to protecting your privacy and ensuring the security of your personal information.
                                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website,
                                        mobile application, and services.
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        By using our services, you agree to the collection and use of information in accordance with this policy.
                                        If you do not agree with our policies and practices, please do not use our services.
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
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                        {item.subtitle}
                                                    </h3>
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
                            <Card id="cookies" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Cookies and Tracking Technologies
                                    </h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            We use cookies and similar tracking technologies to enhance your experience on our website.
                                            Cookies are small data files stored on your device that help us remember your preferences and improve our services.
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            You can control cookies through your browser settings, but please note that disabling cookies may affect
                                            the functionality of our website.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card id="children" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Children's Privacy
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Our services are not intended for children under the age of 13. We do not knowingly collect personal
                                        information from children under 13. If you are a parent or guardian and believe your child has provided
                                        us with personal information, please contact us so we can delete such information.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="international" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        International Data Transfers
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Your information may be transferred to and processed in countries other than your own.
                                        We ensure that such transfers comply with applicable data protection laws and that appropriate
                                        safeguards are in place to protect your information.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="retention" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Data Retention
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        We retain your personal information for as long as necessary to provide our services,
                                        comply with legal obligations, resolve disputes, and enforce our agreements.
                                        When we no longer need your information, we will securely delete or anonymize it.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="changes" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Changes to This Privacy Policy
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        We may update this Privacy Policy from time to time. We will notify you of any changes by
                                        posting the new Privacy Policy on this page and updating the "Last updated" date.
                                        We encourage you to review this Privacy Policy periodically for any changes.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="contact" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-8">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white mr-4">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Contact Us
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                                        </p>
                                        <div className="space-y-2">
                                            <p className="text-gray-600 dark:text-gray-300">
                                                <strong>Email:</strong> privacy@microtravel.com
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