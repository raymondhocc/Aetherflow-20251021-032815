import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/ui/hero-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export function DocsPage() {
  const [documentationContent, setDocumentationContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchDocumentation = async () => {
      try {
        setLoading(true);
        // In Vite, files in the root directory are served relative to the root.
        const response = await fetch('/docs/note.md');
        if (!response.ok) {
          throw new Error(`Failed to fetch documentation: ${response.statusText}`);
        }
        const markdown = await response.text();
        setDocumentationContent(markdown);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching documentation.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentation();
  }, []);
  return (
    <AppLayout>
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      <main>
        <HeroSection
          title="AetherFlow Documentation"
          subtitle="Comprehensive guides and information to help you get the most out of AetherFlow's real-time data intelligence platform."
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-16 lg:py-20 space-y-12">
            <SectionHeader title="Platform Guide" description="Learn how to use AetherFlow's features." />
            <Card>
              <CardContent className="p-6 md:p-8">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2 mt-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center">{error}</div>
                ) : (
                  <article className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {documentationContent}
                    </ReactMarkdown>
                  </article>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}