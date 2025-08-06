"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from '@/contexts/I18nContext';

interface FAQSectionProps {
    className?: string;
    maxItems?: number;
}

export function FAQSection({ className = "", maxItems }: FAQSectionProps) {
    const { t, messages, isLoading } = useI18n();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // FAQ verisini doğrudan messages objesinden al
    let faqs: any[] = messages?.faq?.items || [];

    if (isLoading || faqs.length === 0) {
        return null;
    }

    const displayFaqs = maxItems ? faqs.slice(0, maxItems) : faqs;

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className={`w-full max-w-7xl mx-auto py-24 ${className}`}>
            <div className="container">
                <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
                    {/* Sol taraf - Başlık ve açıklama */}
                    <div className="flex flex-col gap-6">
                        <h2 className="text-4xl font-semibold">
                            {t('faq.title')}<br />
                            <span className="text-muted-foreground/70">
                                {t('faq.subtitle')}
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground md:text-xl">
                            {t('faq.description')}
                            <a href="#" className="mx-1 whitespace-nowrap underline">
                                {t('faq.supportTeam')}
                            </a>
                            {t('faq.specialists')}
                        </p>
                        <Button 
                            variant="outline" 
                            className="w-fit"
                        >
                            {t('faq.viewAllFaqs')}
                        </Button>
                    </div>

                    {/* Sağ taraf - Accordion */}
                    <div data-slot="accordion" data-orientation="vertical">
                        {displayFaqs.map((faq, index) => (
                            <div 
                                key={index}
                                data-state={openIndex === index ? "open" : "closed"}
                                data-orientation="vertical" 
                                data-slot="accordion-item" 
                                className="border-b last:border-b-0"
                            >
                                <h3 
                                    data-orientation="vertical" 
                                    data-state={openIndex === index ? "open" : "closed"} 
                                    className="flex"
                                >
                                    <button
                                        type="button"
                                        aria-controls={`faq-${index}`}
                                        aria-expanded={openIndex === index}
                                        data-state={openIndex === index ? "open" : "closed"}
                                        data-orientation="vertical"
                                        id={`faq-trigger-${index}`}
                                        data-slot="accordion-trigger"
                                        className="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 text-left"
                                        onClick={() => toggleFAQ(index)}
                                    >
                                        {faq.question}
                                        <ChevronDown 
                                            className={`lucide lucide-chevron-down text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 ${
                                                openIndex === index ? 'rotate-180' : ''
                                            }`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </h3>
                                <div 
                                    data-state={openIndex === index ? "open" : "closed"}
                                    id={`faq-${index}`}
                                    hidden={openIndex !== index}
                                    role="region" 
                                    aria-labelledby={`faq-trigger-${index}`}
                                    data-orientation="vertical" 
                                    data-slot="accordion-content" 
                                    className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
                                >
                                    {openIndex === index && (
                                        <div className="pb-4 pt-0">
                                            <p className="text-muted-foreground leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}