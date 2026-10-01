import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Compass,
  Users,
  Sparkles,
  Mountain,
  ShieldCheck,
  ChevronUp,
  X,
  Landmark,
  Coffee,
  ShoppingBag,
  Sun,
  Plane,
} from 'lucide-react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';
import DestinationSkeleton from '../components/DestinationSkeleton';

// Primary categories requested: Tourist Places, Temples, Historical Sites, Cafes, Shopping, Beaches, Airports
const PRIMARY_CATEGORIES = [
  { label: 'All', value: 'All', icon: Compass },
  { label: 'Tourist Places', value: 'Tourist Places', icon: Sparkles },
  { label: 'Temples', value: 'Temples', icon: Sparkles },
  { label: 'Historical Sites', value: 'Historical Sites', icon: Landmark },
  { label: 'Cafes', value: 'Cafes', icon: Coffee },
  { label: 'Shopping', value: 'Shopping', icon: ShoppingBag },
  { label: 'Beaches', value: 'Beaches', icon: Sun },
  { label: 'Airports', value: 'Airports', icon: Plane },
  { label: 'Hill Stations', value: 'Hill Stations', icon: Mountain },
];

const CROWD_OPTIONS = [
  { label: 'All Crowd Levels', value: 'All' },
  { label: '🟢 Low Crowd (Calm & Open)', value: 'low' },
  { label: '🟡 Moderate Crowd (Steady)', value: 'moderate' },
  { label: '🔴 High Crowd (Peak Hours)', value: 'high' },
];

const POPULAR_HILL_STATIONS = [
  { label: 'Shimla', query: 'Shimla' },
  { label: 'Manali', query: 'Manali' },
  { label: 'Mussoorie', query: 'Mussoorie' },
  { label: 'Nainital', query: 'Nainital' },
  { label: 'Rishikesh', query: 'Rishikesh' },
  { label: 'Ooty', query: 'Ooty' },
  { label: 'Darjeeling', query: 'Darjeeling' },
  { label: 'Kashmir', query: 'Kashmir' },
];

const PAGE_SIZE = 12;

const DestinationsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [selectedCrowd, setSelectedCrowd] = useState(searchParams.get('crowd') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating-desc');

  // Hierarchy Data
  const [hierarchy, setHierarchy] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Data & Infinite Scroll Pagination States
  const [destinations, setDestinations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sentinel ref for infinite scroll observer
  const observerTarget = useRef(null);

  // Synchronize URL params with internal state
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    if (urlSearch !== null && urlSearch !== search) setSearch(urlSearch);
    if (urlCategory !== null && urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
  }, [searchParams]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Hierarchy (States & Cities)
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await api.get('/destinations/hierarchy');
        if (res.data?.success) {
          setHierarchy(res.data.data || []);
        }
      } catch (err) {
        console.error('Error loading hierarchy:', err);
      }
    };
    fetchHierarchy();
  }, []);

  // Update available cities when selectedState changes
  useEffect(() => {
    if (selectedState === 'All') {
      setAvailableCities([]);
      setSelectedCity('All');
    } else {
      const found = hierarchy.find((h) => h.state === selectedState);
      setAvailableCities(found ? found.cities || [] : []);
    }
  }, [selectedState, hierarchy]);

  // Fetch initial page whenever filters/sort/search change
  useEffect(() => {
    let isCancelled = false;

    const fetchInitialDestinations = async () => {
      setLoading(true);
      setPage(1);
      try {
        const params = {
          page: 1,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          state: selectedState !== 'All' ? selectedState : undefined,
          city: selectedCity !== 'All' ? selectedCity : undefined,
          crowd: selectedCrowd !== 'All' ? selectedCrowd : undefined,
          sort: sortBy,
        };

        const res = await api.get('/destinations', { params });
        if (!isCancelled && res.data?.success) {
          const list = res.data.destinations || res.data.data || [];
          const total = res.data.total != null ? res.data.total : list.length;
          const pages = res.data.totalPages || Math.ceil(total / PAGE_SIZE) || 1;

          setDestinations(list);
          setTotalCount(total);
          setTotalPages(pages);
          setHasMore(1 < pages);
        }
      } catch (err) {
        console.error('Error fetching initial destinations:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchInitialDestinations();

    return () => {
      isCancelled = true;
    };
  }, [search, selectedCategory, selectedState, selectedCity, selectedCrowd, sortBy]);

  // Fetch next page for infinite scroll
  const loadMoreDestinations = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = {
        page: nextPage,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        city: selectedCity !== 'All' ? selectedCity : undefined,
        crowd: selectedCrowd !== 'All' ? selectedCrowd : undefined,
        sort: sortBy,
      };

      const res = await api.get('/destinations', { params });
      if (res.data?.success) {
        const nextList = res.data.destinations || res.data.data || [];
        setDestinations((prev) => {
          const existingIds = new Set(prev.map((d) => d._id || d.id));
          const uniqueNew = nextList.filter((d) => !existingIds.has(d._id || d.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(nextPage < (res.data.totalPages || totalPages));
      }
    } catch (err) {
      console.error('Error loading more destinations:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loading, loadingMore, search, selectedCategory, selectedState, selectedCity, selectedCrowd, sortBy, totalPages]);

  // Setup IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const sentinel = observerTarget.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreDestinations();
        }
      },
      {
        root: null,
        rootMargin: '300px', // Pre-fetch before user reaches absolute bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMoreDestinations, hasMore, loading, loadingMore]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedCrowd('All');
    setSortBy('rating-desc');
    setSearchParams({});
  };

  const handleCategorySelect = (catValue) => {
    setSelectedCategory(catValue);
    setSearchParams(catValue === 'All' ? {} : { category: catValue });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header Banner */}
        <header className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-sky-800 text-white shadow-xl relative overflow-hidden">
          {/* Subtle geometric circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-bold uppercase tracking-wider border border-white/20">
              <Compass className="w-4 h-4 text-sky-300" />
              <span>Smart Tourism & Live Telemetry Explorer</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Explore India’s Iconic Destinations
            </h1>
            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
              Discover verified tourist places, holy temples, historical sites, lively cafes, vibrant shopping, and scenic beaches with real-time crowd status, live weather, and geofenced safety metrics.
            </p>

            {/* Quick Metrics Header Strip */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>370+ Curated Spots</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Users className="w-3.5 h-3.5 text-emerald-300" />
                <span>Live Crowd Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>Geofencing Safety Scores</span>
              </div>
            </div>
          </div>
        </header>

        {/* 2. Primary Category Filter Tabs */}
        <section aria-label="Destination Categories">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1">
              {PRIMARY_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory.toLowerCase() === cat.value.toLowerCase();
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 scale-102'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Search & Comprehensive Filter Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          {/* Top Row: Search Input + Sorting */}
          <div className="flex flex-col md:flex-row gap-3.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by destination name, temple, cafe, beach, airport, state, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="crowd-asc">Least Crowded (Low to High)</option>
                <option value="crowd-desc">Most Crowded (High to Low)</option>
                <option value="title-asc">Alphabetical (A - Z)</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs cursor-pointer"
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Hill Station Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 mr-1">
              <Mountain className="w-3.5 h-3.5" />
              <span>Hill Stations:</span>
            </span>
            {POPULAR_HILL_STATIONS.map((station) => (
              <button
                key={station.label}
                type="button"
                onClick={() => {
                  setSearch(station.query);
                  setSelectedState('All');
                  setSelectedCity('All');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  search.toLowerCase() === station.query.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50/70 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                }`}
              >
                {station.label}
              </button>
            ))}
          </div>

          {/* Secondary Filters: State, City, Crowd Density */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
              >
                <option value="All">All States ({hierarchy.reduce((acc, h) => acc + (h.count || 0), 0)})</option>
                {hierarchy.map((item) => (
                  <option key={item.state} value={item.state}>
                    {item.state} ({item.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Filter by City
              </label>
              <select
                value={selectedCity}
                disabled={selectedState === 'All'}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer shadow-inner"
              >
                <option value="All">
                  {selectedState === 'All' ? 'Select a State First' : 'All Cities'}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Crowd Density Level
              </label>
              <select
                value={selectedCrowd}
                onChange={(e) => setSelectedCrowd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
              >
                {CROWD_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Results Meta Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
          <p className="text-sm font-semibold text-slate-600">
            Showing <span className="font-extrabold text-slate-900">{destinations.length}</span> of{' '}
            <span className="font-extrabold text-slate-900">{totalCount}</span> verified places
            {selectedCategory !== 'All' && <span> in <span className="text-blue-600 font-bold">{selectedCategory}</span></span>}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">
              Infinite Scroll Enabled
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Safety Verified</span>
            </div>
          </div>
        </div>

        {/* 5. Destination Cards Grid with Universal Identical Layout */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <DestinationSkeleton key={i} />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <Compass className="w-12 h-12 text-blue-500 mx-auto opacity-70" />
            <h3 className="text-xl font-extrabold text-slate-900">No Destinations Match Filters</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              We couldn't find any places matching your criteria. Try switching category, clearing your search query, or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((dest) => (
                <DestinationCard key={dest._id || dest.id} destination={dest} />
              ))}
            </div>

            {/* Skeletons while loading more during infinite scroll */}
            {loadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <DestinationSkeleton key={`more-${i}`} />
                ))}
              </div>
            )}

            {/* Sentinel element observed by IntersectionObserver for infinite scroll */}
            <div ref={observerTarget} className="h-10 w-full flex items-center justify-center my-4">
              {hasMore && !loadingMore && (
                <button
                  type="button"
                  onClick={loadMoreDestinations}
                  className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer border border-slate-200"
                >
                  Load More Destinations ({destinations.length} of {totalCount})
                </button>
              )}
              {!hasMore && destinations.length > 0 && (
                <p className="text-xs font-semibold text-slate-400">
                  🎉 You've reached the end! All {totalCount} verified destinations loaded.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default DestinationsListPage;
