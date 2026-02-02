'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, Bookmark, Filter, X, Share2, ChevronDown } from 'lucide-react';
import { FooterStatic } from './footer-static';
import pocData from '@/poc_database.json';

interface UseCase {
  id: string;
  title: string;
  description: string;
  industry: string;
  function: string;
  aiType: string;
  roiRating: number;
  impactRating: number;
  complexityRating: number;
  timeToValue: string;
  investmentRange: string;
  keyMetrics: string[];
  caseStudies: Array<{
    company: string;
    vendor: string;
    outcome: string;
    metrics?: Record<string, string>;
  }>;
  prerequisites: string[];
  risks: string[];
  mitigation: string[];
  implementationSteps: string[];
  tags: string[];
}

interface FooterBlockData {
  logoType?: 'icon' | 'image';
  logoValue?: string;
  brandTitle?: string;
  tagline?: string;
  legalLinks?: string[];
  companyLines?: string[];
  sitemapLinks?: string[];
  socialLinks?: string[];
  legalTitle?: string;
  companyTitle?: string;
}

export default function UseCasesClient({ footerBlock }: { footerBlock?: FooterBlockData | null }) {
  const useCases: UseCase[] = pocData.use_cases;
  
  // All original state from index.html
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('roi-desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter states - all original
  const [industryFilters, setIndustryFilters] = useState<string[]>([]);
  const [functionFilters, setFunctionFilters] = useState<string[]>([]);
  const [aiTypeFilters, setAiTypeFilters] = useState<string[]>([]);
  const [timeFilters, setTimeFilters] = useState<string[]>([]);
  const [roiMin, setRoiMin] = useState(1);
  const [impactMin, setImpactMin] = useState(1);
  const [complexityMax, setComplexityMax] = useState(5);

  // Load bookmarks
  useEffect(() => {
    const saved = localStorage.getItem('useCaseBookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    localStorage.setItem('useCaseBookmarks', JSON.stringify(newBookmarks));
    showToast(bookmarks.includes(id) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  // Show toast
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  // Original filtering logic - EXACTLY as in index.html
  const filteredUseCases = useMemo(() => {
    let filtered = useCases.filter(uc => {
      if (showBookmarksOnly && !bookmarks.includes(uc.id)) return false;
      if (industryFilters.length && !industryFilters.includes(uc.industry)) return false;
      if (functionFilters.length && !functionFilters.includes(uc.function)) return false;
      if (aiTypeFilters.length && !aiTypeFilters.includes(uc.aiType)) return false;
      if (timeFilters.length && !timeFilters.includes(uc.timeToValue)) return false;
      if (uc.roiRating < roiMin) return false;
      if (uc.impactRating < impactMin) return false;
      if (uc.complexityRating > complexityMax) return false;
      if (searchQuery) {
        const searchStr = `${uc.title} ${uc.description} ${uc.industry} ${uc.function} ${uc.tags.join(' ')}`.toLowerCase();
        if (!searchStr.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });

    // Sorting - EXACTLY as in index.html
    switch(sortBy) {
      case 'roi-desc':
        filtered.sort((a, b) => b.roiRating - a.roiRating);
        break;
      case 'impact-desc':
        filtered.sort((a, b) => b.impactRating - a.impactRating);
        break;
      case 'complexity-asc':
        filtered.sort((a, b) => a.complexityRating - b.complexityRating);
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [useCases, industryFilters, functionFilters, aiTypeFilters, timeFilters, roiMin, impactMin, complexityMax, searchQuery, sortBy, showBookmarksOnly, bookmarks]);

  // Sort options
  const sortOptions = [
    { value: 'roi-desc', label: 'Highest ROI' },
    { value: 'impact-desc', label: 'Highest Impact' },
    { value: 'complexity-asc', label: 'Lowest Complexity' },
    { value: 'title-asc', label: 'Title A-Z' },
  ];

  // Get unique values - EXACTLY as in index.html
  const industries = [...new Set(useCases.map(u => u.industry))].sort();
  const functions = [...new Set(useCases.map(u => u.function))].sort();
  const aiTypes = [...new Set(useCases.map(u => u.aiType))].sort();
  const times = [...new Set(useCases.map(u => u.timeToValue))].sort();

  // Toggle filter - EXACTLY as in index.html
  const toggleFilter = (type: string, value: string, current: string[], setFn: (v: string[]) => void) => {
    if (current.includes(value)) {
      setFn(current.filter(v => v !== value));
    } else {
      setFn([...current, value]);
    }
  };

  // Clear all filters - EXACTLY as in index.html
  const clearFilters = () => {
    setIndustryFilters([]);
    setFunctionFilters([]);
    setAiTypeFilters([]);
    setTimeFilters([]);
    setRoiMin(1);
    setImpactMin(1);
    setComplexityMax(5);
    setSearchQuery('');
  };

  // Share use case
  const shareUseCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/use-cases?usecase=${id}`;
    navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard'));
  };

  // Scroll to dashboard
  const scrollToDashboard = () => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate avg ROI
  const avgROI = (useCases.reduce((sum, uc) => sum + uc.roiRating, 0) / useCases.length).toFixed(1);
  const stats = pocData.metadata.statistics;

  return (
    <div className="min-h-screen bg-transparent text-foreground antialiased">
      {/* Navigation - Glass morphism style */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white/[0.03] backdrop-blur-3xl backdrop-saturate-150 border border-white/[0.08] rounded-2xl px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-between">
            {/* Home Button */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-xl text-white hover:bg-white/10 hover:text-white gap-2 font-medium">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            <span className="font-semibold text-lg tracking-tight text-white font-heading">Use Case Overview</span>

            <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-5 py-2 text-sm font-medium shadow-glow">
              <Share2 className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - With gradient */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-accent text-sm font-medium tracking-wide uppercase">AI Strategy, Built and Delivered</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight font-heading text-white">
            Discover AI Use Cases
          </h1>
          
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Explore {useCases.length}+ validated AI proof-of-concept ideas across industries and functions. 
            Real ROI, real case studies, real outcomes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={scrollToDashboard}
              className="bg-accent hover:bg-accent/90 text-white rounded-full px-7 py-3 text-base font-medium transition-all hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4 mr-2" />
              Explore Use Cases
            </Button>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] text-white hover:bg-white/[0.08] rounded-full px-7 py-3 text-base font-medium transition-all"
            >
              <Filter className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
          
          {/* Quick Stats - Glass cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="text-3xl font-bold text-accent font-heading drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">{useCases.length}</div>
              <div className="text-muted-foreground text-sm mt-1">Use Cases</div>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="text-3xl font-bold text-accent font-heading drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">{industries.length}</div>
              <div className="text-muted-foreground text-sm mt-1">Industries</div>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="text-3xl font-bold text-accent font-heading drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">{functions.length}</div>
              <div className="text-muted-foreground text-sm mt-1">Functions</div>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="text-3xl font-bold text-accent font-heading drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">{avgROI}</div>
              <div className="text-muted-foreground text-sm mt-1">Avg ROI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section id="dashboard" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar - EXACT functionality from index.html */}
          <div className="mb-10">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search use cases by keyword, industry, or function..."
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full pl-14 pr-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:bg-white/[0.05] transition-all shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
              />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Glass card */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sticky top-24 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-white">Filters</h3>
                  <button onClick={clearFilters} className="text-accent text-sm hover:underline">Clear All</button>
                </div>
                
                {/* Industry Filter */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-xs">Industry</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    {industries.map((ind) => (
                      <label key={ind} className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-accent transition-colors py-1">
                        <div 
                          onClick={() => toggleFilter('industry', ind, industryFilters, setIndustryFilters)}
                          className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all ${
                            industryFilters.includes(ind) ? 'bg-accent' : 'bg-white/[0.05] border border-white/[0.1] hover:border-accent/50'
                          }`}
                        >
                          {industryFilters.includes(ind) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="flex-1 truncate">{ind}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Function Filter */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-xs">Function</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    {functions.map((func) => (
                      <label key={func} className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-accent transition-colors py-1">
                        <div 
                          onClick={() => toggleFilter('function', func, functionFilters, setFunctionFilters)}
                          className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${
                            functionFilters.includes(func) ? 'bg-accent border-accent' : 'border-accent/30 hover:border-accent/60'
                          }`}
                        >
                          {functionFilters.includes(func) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="flex-1 truncate">{func}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* AI Type Filter */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-xs">AI Technology</div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                    {aiTypes.map((type) => (
                      <label key={type} className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-accent transition-colors py-1">
                        <div 
                          onClick={() => toggleFilter('aiType', type, aiTypeFilters, setAiTypeFilters)}
                          className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${
                            aiTypeFilters.includes(type) ? 'bg-accent border-accent' : 'border-accent/30 hover:border-accent/60'
                          }`}
                        >
                          {aiTypeFilters.includes(type) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="flex-1 truncate">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* ROI Rating Slider */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-xs">ROI Rating</div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={roiMin}
                    onChange={(e) => setRoiMin(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/[0.1] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1+</span>
                    <span className="text-accent font-medium">{roiMin}+</span>
                    <span>5</span>
                  </div>
                </div>
                
                {/* Impact Rating Slider */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-xs">Impact Rating</div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={impactMin}
                    onChange={(e) => setImpactMin(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/[0.1] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1+</span>
                    <span className="text-accent font-medium">{impactMin}+</span>
                    <span>5</span>
                  </div>
                </div>
                
                {/* Complexity Slider */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-xs">Complexity</div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={complexityMax}
                    onChange={(e) => setComplexityMax(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/[0.1] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1</span>
                    <span className="text-accent font-medium">{complexityMax}-</span>
                    <span>5</span>
                  </div>
                </div>
                
                {/* Time to Value */}
                <div>
                  <div className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-xs">Time to Value</div>
                  <div className="space-y-2">
                    {times.map((time) => (
                      <label key={time} className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-accent transition-colors py-1">
                        <div 
                          onClick={() => toggleFilter('time', time, timeFilters, setTimeFilters)}
                          className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-all ${
                            timeFilters.includes(time) ? 'bg-accent border-accent' : 'border-accent/30 hover:border-accent/60'
                          }`}
                        >
                          {timeFilters.includes(time) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span>{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
            
            {/* Results Grid */}
            <main className="flex-1">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="text-muted-foreground">
                  Showing {filteredUseCases.length} of {showBookmarksOnly ? bookmarks.length : useCases.length} use cases
                </div>
                <div className="flex items-center gap-3">
                  {/* Bookmark Filter Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                    className={`rounded-xl gap-2 ${showBookmarksOnly ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-white'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${showBookmarksOnly ? 'fill-current' : ''}`} />
                    {showBookmarksOnly ? 'Show All' : 'Bookmarks'}
                    {bookmarks.length > 0 && (
                      <span className="ml-1 text-xs bg-accent/20 px-2 py-0.5 rounded-full">{bookmarks.length}</span>
                    )}
                  </Button>

                  {/* Custom Sort Dropdown */}
                  <div className="relative" ref={sortDropdownRef}>
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-2 text-sm hover:bg-white/[0.05] transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                    >
                      {sortOptions.find(o => o.value === sortBy)?.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showSortDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.24)] overflow-hidden z-50">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                              sortBy === option.value 
                                ? 'bg-accent/20 text-accent' 
                                : 'text-muted-foreground hover:bg-white/[0.05] hover:text-white'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {filteredUseCases.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No use cases match your filters.</p>
                  <Button onClick={clearFilters} className="mt-4 bg-accent hover:bg-accent/90">Clear Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredUseCases.map((uc) => (
                    <div
                      key={uc.id}
                      onClick={() => setSelectedUseCase(uc)}
                      className="group bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:bg-white/[0.05] transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                            {uc.industry}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                            {uc.function}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => toggleBookmark(uc.id, e)}
                          className={`text-lg transition-colors ${bookmarks.includes(uc.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                        >
                          <Bookmark className={`w-5 h-5 ${bookmarks.includes(uc.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white group-hover:text-accent transition-colors">{uc.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{uc.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">ROI:</span>
                          <span className="text-yellow-400">{'★'.repeat(uc.roiRating)}{'☆'.repeat(5-uc.roiRating)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">Impact:</span>
                          <span className="text-yellow-400">{'★'.repeat(uc.impactRating)}{'☆'.repeat(5-uc.impactRating)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-xs">Complexity:</span>
                          <span className="text-yellow-400">{'★'.repeat(uc.complexityRating)}{'☆'.repeat(5-uc.complexityRating)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/60"></span>
                          {uc.timeToValue}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/60"></span>
                          {uc.investmentRange}
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border/30 flex gap-2 flex-wrap">
                        {uc.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/[0.05] text-accent/90">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-white font-heading">Analytics Overview</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Industry Distribution - Donut Chart Style */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="font-semibold mb-6 text-white text-center">By Industry</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(stats.by_industry).map(([industry, count], i) => (
                  <div key={industry} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${195 + i * 30}, 86%, ${30 + (i % 3) * 15}%)` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{industry}</div>
                      <div className="text-sm font-medium text-white">{count as number}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Function Distribution */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="font-semibold mb-6 text-white text-center">By Function</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_function).map(([func, count]) => (
                  <div key={func} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate flex-1">{func}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-border/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${(count as number / 32) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-6 text-right">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Type & Investment Stats */}
            <div className="space-y-6">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <h3 className="font-semibold mb-4 text-white">By AI Technology</h3>
                <div className="space-y-2">
                  {Object.entries(stats.by_ai_type).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{type}</span>
                      <span className="text-white font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <h3 className="font-semibold mb-4 text-white">By Investment Range</h3>
                <div className="space-y-2">
                  {Object.entries(stats.by_investment_range).map(([range, count]) => (
                    <div key={range} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{range}</span>
                      <span className="text-white font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterStatic footerBlock={footerBlock} />

      {/* Detail Modal */}
      {selectedUseCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUseCase(null)}
          />
          <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            <button 
              onClick={() => setSelectedUseCase(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">
                  {selectedUseCase.industry}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                  {selectedUseCase.function}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] text-accent/80">
                  {selectedUseCase.aiType}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white font-heading">{selectedUseCase.title}</h2>
              <p className="text-muted-foreground text-lg">{selectedUseCase.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="text-2xl font-bold text-yellow-400">{'★'.repeat(selectedUseCase.roiRating)}{'☆'.repeat(5-selectedUseCase.roiRating)}</div>
                <div className="text-sm text-muted-foreground mt-1">ROI Rating</div>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="text-2xl font-bold text-yellow-400">{'★'.repeat(selectedUseCase.impactRating)}{'☆'.repeat(5-selectedUseCase.impactRating)}</div>
                <div className="text-sm text-muted-foreground mt-1">Impact</div>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="text-2xl font-bold text-yellow-400">{'★'.repeat(selectedUseCase.complexityRating)}{'☆'.repeat(5-selectedUseCase.complexityRating)}</div>
                <div className="text-sm text-muted-foreground mt-1">Complexity</div>
              </div>
            </div>

            {/* Case Studies */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                Case Studies
              </h3>
              {selectedUseCase.caseStudies.map((cs, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white">{cs.company}</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/[0.05] text-accent/80">{cs.vendor}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{cs.outcome}</p>
                  {cs.metrics && (
                    <div className="flex gap-4 mt-3 flex-wrap">
                      {Object.entries(cs.metrics).map(([k, v]) => (
                        <div key={k} className="text-xs">
                          <span className="text-muted-foreground">{k.replace(/_/g, ' ')}:</span>
                          <span className="text-accent font-medium ml-1">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Key Metrics & Prerequisites */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Key Metrics
                </h3>
                <ul className="space-y-2">
                  {selectedUseCase.keyMetrics.map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-accent text-xs">✓</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Prerequisites
                </h3>
                <ul className="space-y-2">
                  {selectedUseCase.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-accent text-xs">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Risks & Mitigation */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                Risks & Mitigation
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Risks:</div>
                  <ul className="space-y-1">
                    {selectedUseCase.risks.map((r, i) => (
                      <li key={i} className="text-sm text-red-400 flex items-start gap-2">
                        <span className="text-xs mt-0.5">⚠</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Mitigation:</div>
                  <ul className="space-y-1">
                    {selectedUseCase.mitigation.map((m, i) => (
                      <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                        <span className="text-xs mt-0.5">✓</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Implementation Steps */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-white">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                Implementation Steps
              </h3>
              <div className="space-y-3">
                {selectedUseCase.implementationSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-border/30">
              <Button 
                onClick={() => toggleBookmark(selectedUseCase.id)}
                className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-full gap-2"
              >
                <Bookmark className={`w-4 h-4 ${bookmarks.includes(selectedUseCase.id) ? 'fill-current' : ''}`} />
                {bookmarks.includes(selectedUseCase.id) ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button 
                variant="outline"
                onClick={(e) => shareUseCase(selectedUseCase.id, e)}
                className="border-white/20 text-white hover:bg-white/10 rounded-full gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-50 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.24)] transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {toast.message}
      </div>


    </div>
  );
}
