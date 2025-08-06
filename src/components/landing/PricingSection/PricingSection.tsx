import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from '@/contexts/I18nContext';

const planOrder = ["free", "explorer", "traveler"];
const planPrices = {
    free: 0,
    explorer: 12,
    traveler: 29,
    enterprise: 99
};

export function PricingSection({ className = "" }: { className?: string }) {
    const { t, messages, isLoading } = useI18n();
    if (isLoading || !messages?.pricing?.plans) return null;

    const plans = planOrder.map((key) => {
        const plan = messages.pricing.plans[key];
        return {
            key,
            name: plan.name,
            description: plan.description,
            button: plan.button,
            features: plan.features,
            popular: plan.popular,
            price: planPrices[key as keyof typeof planPrices] ?? 0,
            priceUnit: messages.pricing.currency || "$",
            priceNote: t('pricing.perMonth'),
        };
    });

    return (
        <section className={`w-full max-w-7xl mx-auto pt-32 ${className}`}>
            <div className="container">
                <div className="flex flex-col items-center justify-center gap-9.5">
                    <h1 className="text-center font-serif text-5xl leading-none text-foreground md:text-6xl lg:text-7xl">
                        {t('pricing.title')}
                    </h1>
                    <p className="text-center text-lg text-muted-foreground max-w-2xl mb-8">
                        {t('pricing.subtitle')}
                    </p>
                    <div className="mt-3 grid w-full grid-cols-1 gap-5 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.key}
                                className={`relative h-full w-full rounded-lg border px-6 py-5 bg-background ${plan.popular ? "border-primary" : "border-muted-2"}`}
                            >
                                <div className="text-2xl mb-1">{plan.name}</div>
                                <div className="text-[2.875rem] leading-[1.05] font-semibold">{plan.priceUnit}{plan.price}</div>
                                <div className="text-xs text-muted-2-foreground">
                                    <div>{plan.priceNote}</div>
                                </div>
                                <a
                                    href="#"
                                    data-slot="button"
                                    className={`mt-2 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-10 rounded-md px-6 has-[>svg]:px-4 w-full ${plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                                >
                                    {plan.button}
                                    <ArrowRight className="ml-1" />
                                </a>
                                <div className="mt-6 flex flex-col gap-4">
                                    {Array.isArray(plan.features) && plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-foreground">
                                            <Check className="size-5 stroke-1 text-green-500" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 w-fit -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                                        {plan.popular}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}