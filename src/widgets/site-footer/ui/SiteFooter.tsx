import { PageContainer } from "@/shared/ui/page-container";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline-soft py-8">
      <PageContainer className="text-fine-print text-muted">
        <span>© {new Date().getFullYear()} duworks. All rights reserved.</span>
      </PageContainer>
    </footer>
  );
}
