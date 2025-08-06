"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
    ChevronUp,
    MessageCircle,
    Phone,
    Mail
} from "lucide-react";

const categories = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: <BookOpen className="w-6 h-6" />,
        description: "Learn the basics of using MicroTravel",
        color: "from-blue-500 to-blue-600"
    },
    {
        id: "booking",
        title: "Booking & Reservations",
        icon: <MapPin className="w-6 h-6" />,
        description: "Everything about making and managing bookings",
        color: "from-green-500 to-green-600"
    },
    {
        id: "payment",
        title: "Payment & Billing",
        icon: <CreditCard className="w-6 h-6" />,
        description: "Payment methods, billing, and refunds",
        color: "from-purple-500 to-purple-600"
    },
    {
        id: "account",
        title: "Account Management",
        icon: <Settings className="w-6 h-6" />,
        description: "Managing your profile and preferences",
        color: "from-orange-500 to-orange-600"
    },
    {
        id: "safety",
        title: "Safety & Security",
        icon: <Shield className="w-6 h-6" />,
        description: "Staying safe and secure while traveling",
        color: "from-red-500 to-red-600"
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
        icon: <MessageCircle className="w-6 h-6" />,
        action: "Start Chat",
        availability: "Available 9 AM - 6 PM EST"
    },
    {
        title: "Phone Support",
        description: "Speak with us directly",
        icon: <Phone className="w-6 h-6" />,
        action: "Call Now",
        availability: "+1 (555) 123-4567"
    },
    {
        title: "Email Support",
        description: "Send us a detailed message",
        icon: <Mail className="w-6 h-6" />,
        action: "Send Email",
        availability: "support@microtravel.com"
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

            <div className="container mx-auto px-6 py-12 space-y-12">
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                        Help Center
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                        Find answers to your questions and get the help you need for your micro-travel adventures.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search for help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 py-4 text-lg rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                        />
                    </div>
                </section>

                {/* Categories */}
                <section className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {categories.map((category) => (
                            <Card
                                key={category.id}
                                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${selectedCategory === category.id
                                    ? 'ring-2 ring-purple-500 bg-white dark:bg-gray-800'
                                    : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800'
                                    } backdrop-blur-lg border-0 shadow-xl`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                                        {category.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {category.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {category.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {categories.find(cat => cat.id === selectedCategory)?.title} FAQ
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            {filteredFAQs.length} article{filteredFAQs.length !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    <div className="space-y-4">
                        {filteredFAQs.map((faq, index) => (
                            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                                <CardContent className="p-0">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {faq.question}
                                            </h3>
                                        </div>
                                        {expandedFAQ === index ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>

                                    {expandedFAQ === index && (
                                        <div className="px-6 pb-6">
                                            <div className="pl-9 border-l-2 border-purple-200 dark:border-purple-800">
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredFAQs.length === 0 && (
                        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No results found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    We couldn`t find any articles matching your search. Try different keywords or browse our categories.
                                </p>
                                <Button
                                    onClick={() => setSearchQuery("")}
                                    variant="outline"
                                    className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                >
                                    Clear Search
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Contact Support */}
                <section className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Still Need Help?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Our support team is here to help you with any questions or issues.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactOptions.map((option, index) => (
                            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                                        {option.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {option.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                        {option.description}
                                    </p>
                                    <p className="text-purple-600 dark:text-purple-400 font-medium text-sm mb-6">
                                        {option.availability}
                                    </p>
                                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                                        {option.action}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Additional Resources */}
                <section className="max-w-4xl mx-auto">
                    <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Additional Resources
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Explore more resources to make the most of your MicroTravel experience.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/about">
                                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                        About MicroTravel
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                        Contact Us
                                    </Button>
                                </Link>
                                <Link href="/privacy">
                                    <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                        Privacy Policy
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}