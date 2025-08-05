"use client";

import { useState } from "react";
import { Mail, Check, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsletterSignupProps {
    className?: string;
    variant?: 'default' | 'compact';
}

export function NewsletterSignup({ className = "", variant = 'default' }: NewsletterSignupProps) {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("E-posta adresi gereklidir");
            return;
        }

        if (!validateEmail(email)) {
            setError("Geçerli bir e-posta adresi girin");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Here you would typically make an API call to your newsletter service
            // await fetch('/api/newsletter/subscribe', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ email })
            // });

            setIsSuccess(true);
            setEmail("");

            // Track conversion event (analytics integration)
            const { Analytics } = await import('@/lib/analytics');
            Analytics.trackNewsletterSignup(variant === 'compact' ? 'compact_form' : 'full_form');

            // Reset success state after 5 seconds
            setTimeout(() => setIsSuccess(false), 5000);
        } catch {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (variant === 'compact') {
        return (
            <div className={`${className}`}>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            type="email"
                            placeholder="E-posta adresiniz"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-full px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={isSubmitting || isSuccess}
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 py-3 shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isSuccess ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Abone Ol
                            </>
                        )}
                    </Button>
                </form>

                {isSuccess && (
                    <p className="text-green-600 dark:text-green-400 text-sm mt-3 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Teşekkürler! E-posta listemize eklendik.
                    </p>
                )}
            </div>
        );
    }

    return (
        <section className={`max-w-4xl mx-auto px-4 ${className}`}>
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl p-8 sm:p-12 backdrop-blur-lg border border-white/20 dark:border-gray-700/20">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            Özel Fırsatları Kaçırma!
                        </h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
                            En yeni mikro seyahat fırsatları, ipuçları ve sadece abone olanlara özel %20 indirim kodu için bültenimize katıl.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                                    disabled={isSubmitting || isSuccess}
                                />
                                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm flex items-center justify-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting || isSuccess}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8 py-3 text-lg font-semibold shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Kaydediliyor...
                                    </>
                                ) : isSuccess ? (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        Başarıyla Kaydedildi!
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Ücretsiz Abone Ol
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {isSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 max-w-md mx-auto">
                            <p className="text-green-700 dark:text-green-300 text-sm flex items-center justify-center gap-2">
                                <Check className="w-5 h-5" />
                                Harika! İndirim kodunuz e-posta adresinize gönderildi.
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Spam göndermiyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
                        <br />
                        <a href="/privacy" className="underline hover:text-purple-600">
                            Gizlilik Politikası
                        </a>
                        {" • "}
                        <a href="/terms" className="underline hover:text-purple-600">
                            Kullanım Şartları
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}