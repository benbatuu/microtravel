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
    CreditCard,
    Shield,
    AlertTriangle,
    Mail,
    BookOpen,
    Users,
    Globe,
    Clock,
    ChevronRight
} from "lucide-react";

// Define types for the content structure
interface ContentItem {
    subtitle?: string;
    text: string;
}

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: ContentItem[];
}

const sections: Section[] = [
    {
        id: "acceptance",
        title: "Acceptance of Terms",
        icon: <FileText className="h-5 w-5" />,
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
        icon: <Shield className="h-5 w-5" />,
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
        icon: <Users className="h-5 w-5" />,
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
        icon: <CreditCard className="h-5 w-5" />,
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
        icon: <AlertTriangle className="h-5 w-5" />,
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
        icon: <Scale className="h-5 w-5" />,
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
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <section className="text-center space-y-4 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm font-medium mb-4">
                            <Scale className="h-4 w-4" />
                            Legal Document
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Terms of Service
                        </h1>
                        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
                            Please read these terms carefully before using our services. By using MicroTravel, you agree to these terms and conditions.
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