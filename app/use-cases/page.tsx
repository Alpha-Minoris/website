import { Metadata } from "next";
import UseCasesClient from "./use-cases-client";
import { getSections, getVersions } from '@/lib/cache/page-cache'

export const metadata: Metadata = {
  title: "Use Cases - Alpha Minoris",
  description: "Explore 100+ validated AI proof-of-concept ideas across industries and functions. Real ROI, real case studies, real outcomes.",
};

// PUBLIC ROUTE: No authentication required
export const dynamic = 'force-static';

export default async function UseCasesPage() {
  // Fetch footer data from database
  let footerBlock = null;
  try {
    const sections = await getSections();
    const footerSection = sections?.find(s => s.slug === 'footer');
    if (footerSection) {
      const versions = await getVersions([footerSection.id]);
      footerBlock = versions?.[0]?.layout_json || null;
    }
  } catch (e) {
    console.error('Error fetching footer:', e);
  }

  return <UseCasesClient footerBlock={footerBlock} />;
}
