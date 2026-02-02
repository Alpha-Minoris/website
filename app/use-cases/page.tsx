import { Metadata } from "next";
import UseCasesClient from "./use-cases-client";

export const metadata: Metadata = {
  title: "Use Cases - Alpha Minoris",
  description: "Explore 100+ validated AI proof-of-concept ideas across industries and functions. Real ROI, real case studies, real outcomes.",
};

// PUBLIC ROUTE: No authentication required
export const dynamic = 'force-static';

export default function UseCasesPage() {
  return <UseCasesClient />;
}
