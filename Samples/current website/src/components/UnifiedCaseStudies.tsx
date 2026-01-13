import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Building2, Users } from "lucide-react@0.487.0";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface CaseStudy {
  id: number;
  company: string;
  industry: string;
  logoUrl: string;
  challenge: string;
  outcome: string;
  keyInsight: string;
  heroImageUrl: string;
  employees: number;
  companySize: string;
  location: string;
  fullChallenge: string;
  fullSolution: string;
  originalUrl: string | null;
  toolsUsed: Array<{ name: string; logo: string }> | null;
  metrics: Record<string, string>;
  financials: any | null;
}

export function UnifiedCaseStudies() {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  
  const itemsPerPage = 6;
  const totalPages = Math.ceil(caseStudies.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCases = caseStudies.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const response = await fetch('http://localhost:4242/api/testimonials');
        if (!response.ok) {
          throw new Error('Failed to fetch case studies');
        }
        const data = await response.json();
        setCaseStudies(data);
      } catch (err) {
        console.error('Error fetching case studies:', err);
        setError('Failed to load case studies');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, []);

  // Convert metrics object to array format
  const getMetricsArray = (metrics: Record<string, string>) => {
    return Object.entries(metrics).map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }));
  };

  // Reset showAllMetrics when modal opens with different case
  useEffect(() => {
    setShowAllMetrics(false);
  }, [selectedCase?.id]);

  if (loading) {
    return (
      <section className="py-24 lg:py-40 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Loading case studies...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 lg:py-40 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-lg text-destructive">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 lg:py-40 bg-background">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-5 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            AI Transformation in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore detailed success stories and discover how organizations leverage AI to solve complex challenges and achieve remarkable results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentCases.map((caseStudy) => {
            const metricsArray = getMetricsArray(caseStudy.metrics);
            
            return (
              <Card 
                key={caseStudy.id}
                className="border-border/40 hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl overflow-hidden group h-full"
                onClick={() => setSelectedCase(caseStudy)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={caseStudy.heroImageUrl}
                    alt={caseStudy.company}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center p-2">
                        <img src={caseStudy.logoUrl} alt={caseStudy.company} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-xs text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
                        {caseStudy.industry}
                      </span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl">{caseStudy.company}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {caseStudy.outcome}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex gap-4">
                        {metricsArray.slice(0, 2).map((metric, idx) => (
                          <div key={idx}>
                            <div className="text-primary">{metric.value}</div>
                            <div className="text-xs text-muted-foreground">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                      <button className="text-primary text-sm hover:underline">
                        View Details →
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                }
              }}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                }
              }}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Click on any case study to explore the full transformation journey
          </p>
        </div>
      </div>

      {/* Detail Modal - Matching Testimonials structure */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
          {selectedCase && (
            <>
              {/* Hero Image */}
              <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={selectedCase.heroImageUrl}
                  alt={selectedCase.company}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white p-3 flex items-center justify-center border border-border/40 shadow-lg">
                      <ImageWithFallback
                        src={selectedCase.logoUrl}
                        alt={selectedCase.company}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl text-white mb-1">{selectedCase.company}</DialogTitle>
                      <Badge variant="secondary" className="bg-white/90">
                        {selectedCase.industry}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Tools Used - Prominent placement */}
                {selectedCase.toolsUsed && selectedCase.toolsUsed.length > 0 && (
                  <div className="mb-6 pb-4 border-b border-border/40">
                    <div className="flex items-center mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Powered By</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedCase.toolsUsed.map((tool, idx) => (
                        <div 
                          key={idx} 
                          className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-muted/30 to-muted/60 border border-border/40 hover:border-primary/40 hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            <img src={tool.logo} alt={tool.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{tool.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics Section - Full width grid when expanded */}
                {showAllMetrics && (
                  <section className="mb-12 pb-6 border-b border-border/40">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Metrics</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAllMetrics(false)}
                        className="text-xs"
                      >
                        Show less
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {getMetricsArray(selectedCase.metrics).map((metric, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 rounded-lg bg-muted/50 border border-border/40 hover:border-primary/30 transition-colors"
                          title={metric.label}
                        >
                          <div className="text-primary text-xl font-bold mb-1">{metric.value}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Column - Metrics (when collapsed) + Company Details */}
                  <div className="space-y-6">
                    {!showAllMetrics && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm text-muted-foreground">Key Metrics</h3>
                          {getMetricsArray(selectedCase.metrics).length > 3 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowAllMetrics(true)}
                              className="text-xs h-auto p-1"
                            >
                              +{getMetricsArray(selectedCase.metrics).length - 3} more
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {getMetricsArray(selectedCase.metrics).slice(0, 3).map((metric, idx) => (
                            <div key={idx} className="p-4 rounded-lg bg-muted/50 border border-border/40">
                              <div className="text-primary text-2xl mb-1">{metric.value}</div>
                              <div className="text-sm text-muted-foreground">{metric.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Building2 className="h-4 w-4" />
                          <span>Industry</span>
                        </div>
                        <p className="text-foreground">{selectedCase.industry}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Users className="h-4 w-4" />
                          <span>Company Size</span>
                        </div>
                        <p className="text-foreground">{selectedCase.companySize}</p>
                      </div>

                      {selectedCase.location && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Location</div>
                          <p className="text-foreground">{selectedCase.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Challenge and Solution */}
                  <div className="md:col-span-2 space-y-6 text-foreground">
                    <div>
                      <h3 className="text-lg mb-3 text-primary">The Challenge</h3>
                      <p className="text-sm leading-relaxed">
                        {selectedCase.fullChallenge || selectedCase.challenge}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3 text-primary">Our Solution</h3>
                      <p className="text-sm leading-relaxed">
                        {selectedCase.fullSolution}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg mb-3 text-primary">Results Achieved</h3>
                      <p className="text-sm leading-relaxed">
                        {selectedCase.outcome}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 space-y-4">
                  {selectedCase.keyInsight && (
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Key Insight</p>
                          <p className="text-sm text-muted-foreground italic">
                            {selectedCase.keyInsight}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      This case study represents publicly available market intelligence and industry trends. 
                      Specific results may vary based on organization size, industry, and implementation approach.
                    </p>
                  </div>

                  {selectedCase.originalUrl && (
                    <div className="flex justify-center">
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90"
                        asChild
                      >
                        <a href={selectedCase.originalUrl} target="_blank" rel="noopener noreferrer">
                          Learn More About This Solution
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
