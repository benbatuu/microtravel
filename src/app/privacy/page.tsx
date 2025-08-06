"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    FileText,
    Scale,
    Shield,
    Mail,
    BookOpen,
    Globe,
    Clock,
    ChevronRight,
    Eye,
    UserCheck,
    Lock
} from "lucide-react";

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
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <section className="text-center space-y-4 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm font-medium mb-4">
                            <Shield className="h-4 w-4" />
                            Privacy Policy
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Privacy Policy
                        </h1>
                        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Last updated: January 1, 2025
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Table of Contents */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Contents
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <nav className="space-y-1">
                                        {tableOfContents.map((item, index) => (
                                            <Button
                                                key={item.id}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => scrollToSection(item.id)}
                                                className="w-full justify-start h-auto py-2 px-3 text-sm font-normal hover:bg-muted/80"
                                            >
                                                <span className="text-muted-foreground mr-2">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span className="truncate">{item.title}</span>
                                            </Button>
                                        ))}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* Introduction */}
                            <Card>
                                <CardContent className="p-8">
                                    <div className="prose prose-gray dark:prose-invert max-w-none">
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Welcome to MicroTravel. These Terms of Service (`Terms``) govern your use of our website,
                                            mobile application, and services. Please read these Terms carefully before using our platform.
                                        </p>
                                        <p className="text-muted-foreground leading-relaxed">
                                            By accessing or using MicroTravel, you agree to be bound by these Terms and all applicable
                                            laws and regulations. If you do not agree with any of these terms, you are prohibited from
                                            using or accessing our services.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Main Sections */}
                            {sections.map((section, sectionIndex) => (
                                <Card key={section.id} id={section.id}>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                {section.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {String(sectionIndex + 1).padStart(2, '0')}
                                                    </Badge>
                                                    <CardTitle className="text-xl">
                                                        {section.title}
                                                    </CardTitle>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {section.content.map((item, index) => (
                                                <div key={index} className="space-y-3">
                                                    {item.subtitle && (
                                                        <h4 className="font-semibold text-foreground">
                                                            {item.subtitle}
                                                        </h4>
                                                    )}
                                                    <p className="text-muted-foreground leading-relaxed">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Additional Sections */}
                            <Card id="intellectual-property">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">07</Badge>
                                                <CardTitle className="text-xl">Intellectual Property Rights</CardTitle>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        The content, features, and functionality of our services are owned by MicroTravel and are
                                        protected by international copyright, trademark, patent, trade secret, and other intellectual
                                        property laws.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        You may not reproduce, distribute, modify, create derivative works of, publicly display,
                                        publicly perform, republish, download, store, or transmit any of our content without our
                                        prior written consent.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="privacy">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">08</Badge>
                                                <CardTitle className="text-xl">Privacy and Data Protection</CardTitle>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect
                                        your information when you use our services. By using our services, you agree to the collection
                                        and use of information in accordance with our Privacy Policy.
                                    </p>
                                    <div>
                                        <Link href="/privacy">
                                            <Button variant="outline" className="gap-2">
                                                Read our Privacy Policy
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card id="modifications">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">09</Badge>
                                                <CardTitle className="text-xl">Modifications to Terms</CardTitle>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        We reserve the right to modify these Terms at any time. We will notify you of any changes by
                                        posting the new Terms on this page and updating the `Last updated`` date. Your continued use
                                        of our services after any modifications constitutes acceptance of the new Terms.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="governing-law">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Scale className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">10</Badge>
                                                <CardTitle className="text-xl">Governing Law and Dispute Resolution</CardTitle>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        These Terms are governed by and construed in accordance with the laws of the State of New York,
                                        without regard to its conflict of law principles.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Any disputes arising from these Terms or your use of our services will be resolved through
                                        binding arbitration in accordance with the rules of the American Arbitration Association.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card id="contact">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">11</Badge>
                                                <CardTitle className="text-xl">Contact Information</CardTitle>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        If you have any questions about these Terms of Service, please contact us:
                                    </p>
                                    <Separator />
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                        <div className="space-y-1">
                                            <p className="font-medium">Email</p>
                                            <p className="text-sm text-muted-foreground">legal@microtravel.com</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">Address</p>
                                            <p className="text-sm text-muted-foreground">123 Travel Street, New York, NY 10001</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}