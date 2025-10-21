import React from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
type HeroSectionProps = {
  title: React.ReactNode;
  subtitle: string;
  actions?: React.ReactNode;
  className?: string;
};
export function HeroSection({ title, subtitle, actions, className }: HeroSectionProps) {
  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' } },
  };
  return (
    <section className={cn("relative overflow-hidden bg-gradient-hero-pattern", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-24 md:py-32">
          <motion.div
            initial="hidden"
            animate="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            className="text-center"
          >
            <motion.h1
              variants={FADE_IN_ANIMATION_VARIANTS}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground text-balance"
            >
              {title}
            </motion.h1>
            <motion.p
              variants={FADE_IN_ANIMATION_VARIANTS}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
            >
              {subtitle}
            </motion.p>
            {actions && (
              <motion.div
                variants={FADE_IN_ANIMATION_VARIANTS}
                className="mt-10 flex justify-center items-center gap-4"
              >
                {actions}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}