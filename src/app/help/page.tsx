"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Search,
    HelpCircle,
    BookOpen,
    CreditCard,
    MapPin,
    Settings,
    Shield,
    ChevronDown,
    ChevronRight,
    MessageCircle,
    Phone,
    Mail,
    FileText,
    Users,
} from "lucide-react";

const categories = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: <BookOpen className="h-5 w-5" />,
        description: "Learn the basics of using MicroTravel",
        count: 4
    },
    {
        id: "booking",
        title: "Booking & Reservations",
        icon: <MapPin className="h-5 w-5" />,
        description: "Everything about making and managing bookings",
        count: 5
    },
    {
        id: "payment",
        title: "Payment & Billing",
        icon: <CreditCard className="h-5 w-5" />,
        description: "Payment methods, billing, and refunds",
        count: 5
    },
    {
        id: "account",
        title: "Account Management",
        icon: <Settings className="h-5 w-5" />,
        description: "Managing your profile and preferences",
        count: 4
    },
    {
        id: "safety",
        title: "Safety & Security",
        icon: <Shield className="h-5 w-5" />,
        description: "Staying safe and secure while traveling",
        count: 4
    }
];

const faqData = {
    "getting-started": [
        {
            question: "What is MicroTravel?",
            answer: "MicroTravel is a platform that specializes in short-duration travel experiences, typically lasting 1-3 days. We curate authentic local experiences that fit into busy schedules and budgets."
        },
        {
            question: "How do I create an account?",
            answer: "Click the 'Get Started' button on our homepage, then choose 'Sign Up'. You'll need to provide your email address, create a password, and verify your email to complete registration."
        },
        {
            question: "Is MicroTravel free to use?",
            answer: "Creating an account and browsing experiences is free. We offer different subscription tiers with varying features and benefits. You only pay for the travel experiences you book."
        },
        {
            question: "What makes MicroTravel different from other travel platforms?",
            answer: "We focus exclusively on short, authentic travel experiences. Our curated selection emphasizes quality over quantity, local connections, and sustainable tourism practices."
        }
    ],
    "booking": [
        {
            question: "How do I book a micro-travel experience?",
            answer: "Browse our experiences, select your preferred dates, choose any add-ons, and complete the booking process with payment. You'll receive instant confirmation via email."
        },
        {
            question: "Can I modify or cancel my booking?",
            answer: "Yes, you can modify or cancel bookings up to 48 hours before your experience starts. Premium members get more flexible cancellation terms. Check your booking details for specific policies."
        },
        {
            question: "What's included in a micro-travel package?",
            answer: "Each package typically includes accommodation, guided activities, local transportation, and 24/7 support. Specific inclusions vary by experience and are clearly listed on each booking page."
        },
        {
            question: "How far in advance should I book?",
            answer: "We recommend booking at least 1-2 weeks in advance for the best availability. Popular experiences and peak seasons may require earlier booking."
        },
        {
            question: "Can I book for a group?",
            answer: "Yes! We offer group bookings for 4+ people with special pricing. Contact our team for custom group packages and pricing."
        }
    ],
    "payment": [
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through Stripe."
        },
        {
            question: "When will I be charged?",
            answer: "Payment is processed immediately upon booking confirmation. For some experiences, we may require a deposit with the balance due closer to your travel date."
        },
        {
            question: "What is your refund policy?",
            answer: "Refunds depend on the cancellation timing and experience type. Generally, cancellations 48+ hours in advance receive full refunds, while later cancellations may incur fees."
        },
        {
            question: "Are there any hidden fees?",
            answer: "No hidden fees! All costs are clearly displayed before booking. This includes taxes, service fees, and any optional add-ons you select."
        },
        {
            question: "Can I get a receipt for my booking?",
            answer: "Yes, you'll receive a detailed receipt via email after booking. You can also download receipts from your account dashboard at any time."
        }
    ],
    "account": [
        {
            question: "How do I update my profile information?",
            answer: "Log into your account and go to 'Profile Settings'. You can update your personal information, preferences, and notification settings there."
        },
        {
            question: "I forgot my password. How do I reset it?",
            answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a reset link. Follow the instructions in the email to create a new password."
        },
        {
            question: "How do I delete my account?",
            answer: "Contact our support team to request account deletion. We'll help you export your data if needed and permanently delete your account within 30 days."
        },
        {
            question: "Can I change my email address?",
            answer: "Yes, you can update your email address in your profile settings. You'll need to verify the new email address before the change takes effect."
        }
    ],
    "safety": [
        {
            question: "How do you ensure the safety of your experiences?",
            answer: "All our partners are vetted for safety standards, insurance coverage, and local licensing. We provide 24/7 emergency support and detailed safety information for each experience."
        },
        {
            question: "What should I do in case of an emergency?",
            answer: "Contact our 24/7 emergency hotline immediately. The number is provided in your booking confirmation and is available in your mobile app."
        },
        {
            question: "Are your experiences insured?",
            answer: "Yes, all experiences include basic travel insurance. We recommend purchasing additional travel insurance for comprehensive coverage based on your needs."
        },
        {
            question: "How do you protect my personal information?",
            answer: "We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for detailed information about how we handle your information."
        }
    ]
};

const contactOptions = [
    {
        title: "Live Chat",
        description: "Chat with our support team",
        icon: <MessageCircle className="h-5 w-5" />,
        action: "Start Chat",
        availability: "Available 9 AM - 6 PM EST",
        status: "online"
    },
    {
        title: "Phone Support",
        description: "Speak with us directly",
        icon: <Phone className="h-5 w-5" />,
        action: "Call Now",
        availability: "+1 (555) 123-4567",
        status: "available"
    },
    {
        title: "Email Support",
        description: "Send us a detailed message",
        icon: <Mail className="h-5 w-5" />,
        action: "Send Email",
        availability: "support@microtravel.com",
        status: "24h"
    }
];

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("getting-started");
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const filteredFAQs = faqData[selectedCategory as keyof typeof faqData].filter(
        faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Section */}
                <section className="text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Help Center
                    </h1>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
                        Find answers to your questions and get the help you need for your micro-travel adventures.
                    </p>

                    {/* Search Bar */}
                    <div className="mx-auto max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <div className="w-full max-w-7xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {categories.map((category) => (
                        <Card
                            key={category.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory === category.id
                                ? 'ring-2 ring-ring shadow-md'
                                : 'hover:border-border'
                                }`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            {category.icon}
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {category.count}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold leading-none">
                                            {category.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* FAQ Section */}
                <section className="w-full max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            {selectedCategoryData?.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                {selectedCategoryData?.title}
                            </h2>
                            <p className="text-muted-foreground">
                                {filteredFAQs.length} article{filteredFAQs.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredFAQs.map((faq, index) => (
                            <Card key={index}>
                                <CardContent className="p-0">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="flex w-full items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="font-medium">
                                                {faq.question}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 text-muted-foreground transition-transform ${expandedFAQ === index ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {expandedFAQ === index && (
                                        <>
                                            <Separator />
                                            <div className="p-6 pt-4">
                                                <div className="pl-7">
                                                    <p className="text-muted-foreground leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredFAQs.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center space-y-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">
                                        No results found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        We couldn`t find any articles matching your search. Try different keywords or browse our categories.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setSearchQuery("")}
                                    variant="outline"
                                >
                                    Clear Search
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Contact Support */}
                <section className="w-full max-w-7xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Still Need Help?
                        </h2>
                        <p className="text-muted-foreground">
                            Our support team is here to help you with any questions or issues.
                        </p>
                    </div>

                    <div className="w-full max-w-7xl mx-auto grid gap-6 md:grid-cols-3">
                        {contactOptions.map((option, index) => (
                            <Card key={index} className="relative hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            {option.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">
                                                {option.title}
                                            </CardTitle>
                                            <Badge
                                                variant={option.status === 'online' ? 'default' : 'secondary'}
                                                className="text-xs mt-1"
                                            >
                                                {option.status === 'online' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />}
                                                {option.status === 'online' ? 'Online' :
                                                    option.status === 'available' ? 'Available' : '24h Response'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        {option.description}
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            {option.availability}
                                        </p>
                                        <Button className="w-full">
                                            {option.action}
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Additional Resources */}
                <section className="max-w-7xl w-full mx-auto">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">
                                Additional Resources
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Explore more resources to make the most of your MicroTravel experience.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <Link href="/about">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="mr-2 h-4 w-4" />
                                        About MicroTravel
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="mr-2 h-4 w-4" />
                                        Contact Us
                                    </Button>
                                </Link>
                                <Link href="/privacy">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Privacy Policy
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    );
}