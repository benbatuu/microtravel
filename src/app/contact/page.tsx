"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    ArrowLeft,
    Send,
    MessageCircle,
    HeadphonesIcon,
    Globe
} from "lucide-react";

const contactMethods = [
    {
        icon: <Mail className="w-6 h-6" />,
        title: "Email Support",
        description: "Get help via email within 24 hours",
        contact: "support@microtravel.com",
        action: "Send Email"
    },
    {
        icon: <Phone className="w-6 h-6" />,
        title: "Phone Support",
        description: "Speak with our team directly",
        contact: "+1 (555) 123-4567",
        action: "Call Now"
    },
    {
        icon: <MessageCircle className="w-6 h-6" />,
        title: "Live Chat",
        description: "Chat with us in real-time",
        contact: "Available 9 AM - 6 PM EST",
        action: "Start Chat"
    },
    {
        icon: <HeadphonesIcon className="w-6 h-6" />,
        title: "Premium Support",
        description: "Priority support for premium members",
        contact: "premium@microtravel.com",
        action: "Contact Premium"
    }
];

const officeLocations = [
    {
        city: "New York",
        address: "123 Travel Street, NY 10001",
        phone: "+1 (555) 123-4567",
        hours: "Mon-Fri: 9 AM - 6 PM EST"
    },
    {
        city: "London",
        address: "456 Adventure Lane, London SW1A 1AA",
        phone: "+44 20 7123 4567",
        hours: "Mon-Fri: 9 AM - 6 PM GMT"
    },
    {
        city: "Tokyo",
        address: "789 Journey Road, Tokyo 100-0001",
        phone: "+81 3-1234-5678",
        hours: "Mon-Fri: 9 AM - 6 PM JST"
    }
];

const faqItems = [
    {
        question: "How do I book a micro-travel experience?",
        answer: "Simply browse our experiences, select your preferred dates, and complete the booking process. You'll receive instant confirmation."
    },
    {
        question: "What's included in a micro-travel package?",
        answer: "Each package includes accommodation, guided activities, local transportation, and 24/7 support. Meals may vary by package."
    },
    {
        question: "Can I cancel or modify my booking?",
        answer: "Yes, you can cancel or modify your booking up to 48 hours before departure. Premium members get more flexible cancellation terms."
    },
    {
        question: "Do you offer group discounts?",
        answer: "Yes, we offer discounts for groups of 4 or more. Contact our team for custom group pricing and packages."
    }
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "normal"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Basic validation
            if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
                throw new Error("Please fill in all required fields");
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error("Please enter a valid email address");
            }

            // Simulate form submission with API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
                priority: "normal"
            });
        } catch (error) {
            setIsSubmitting(false);
            alert(error instanceof Error ? error.message : "An error occurred. Please try again.");
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

            <div className="container mx-auto px-6 py-12 space-y-16">
                {/* Hero Section */}
                <section className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        Have questions about your next micro-adventure? We're here to help you every step of the way.
                    </p>
                </section>

                {/* Contact Methods */}
                <section className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactMethods.map((method, index) => (
                            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                                        {method.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                        {method.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                        {method.description}
                                    </p>
                                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-4">
                                        {method.contact}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    >
                                        {method.action}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Contact Form */}
                <section className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Send Us a Message
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Fill out the form below and we'll get back to you as soon as possible.
                        </p>
                    </div>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                        <CardContent className="p-8">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        Message Sent Successfully!
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        Thank you for contacting us. We'll get back to you within 24 hours.
                                    </p>
                                    <Button
                                        onClick={() => setSubmitted(false)}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name *
                                            </label>
                                            <Input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Subject *
                                            </label>
                                            <Input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full"
                                                placeholder="What's this about?"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Priority
                                            </label>
                                            <select
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            >
                                                <option value="low">Low Priority</option>
                                                <option value="normal">Normal Priority</option>
                                                <option value="high">High Priority</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                            rows={6}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                            placeholder="Tell us how we can help you..."
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Sending Message...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Office Locations */}
                <section className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Offices
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Visit us at one of our global locations
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {officeLocations.map((office, index) => (
                            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white mr-4">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {office.city}
                                        </h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {office.address}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {office.phone}
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Clock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {office.hours}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Quick answers to common questions
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqItems.map((item, index) => (
                            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        {item.question}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Can't find what you're looking for?
                        </p>
                        <Link href="/help">
                            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                Visit Help Center
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}