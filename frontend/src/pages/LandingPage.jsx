import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Compass, ArrowRight, Star, Mail, Phone, ShieldCheck, AlertTriangle, Users } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import DestinationRail from '../components/DestinationRail';
import api from '../services/api';

const HeroGlobe = lazy(() => import('../components/HeroGlobe'));

// Hill stations that have safety data – used to show safety badge on cards
const SAFETY_ENABLED_DESTINATIONS = [
  'shimla', 'jammu-kashmir', 'mussoorie', 'rishikesh',
  'manali', 'nainital', 'ooty', 'darjeeling',
];

// Curated Iconic Travel Destinations with authentic photography & real-world data
// Includes all 8 hill stations with geofencing safety data
const CURATED_DESTINATIONS = [
  {
    _id: 'curated-shimla',
    title: 'Shimla',
    name: 'Shimla',
    slug: 'shimla-himachal-pradesh',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    rating: 4.8,
    numReviews: 2150,
    visitorCount: '68k/mo',
    category: 'Mountains',
    safetyKey: 'shimla',
    description: 'The Queen of Hills with colonial charm, Mall Road heritage walks, and stunning Dhauladhar mountain panoramas.',
    shortDescription: 'The Queen of Hills with colonial charm, Mall Road heritage walks, and stunning Dhauladhar mountain panoramas.',
    images: ['https://images.unsplash.com/photo-1597074866923-dc0589150458?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-manali',
    title: 'Manali',
    name: 'Manali',
    slug: 'solang-valley-manali',
    city: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    rating: 4.9,
    numReviews: 1640,
    visitorCount: '54k/mo',
    category: 'Mountains',
    safetyKey: 'manali',
    description: 'Breathtaking snow-draped Himalayan peaks, Solang Valley adventures, and apple orchards in the Beas Valley.',
    shortDescription: 'Breathtaking snow-draped Himalayan peaks, Solang Valley adventures, and apple orchards in the Beas Valley.',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-mussoorie',
    title: 'Mussoorie',
    name: 'Mussoorie',
    slug: 'mussoorie-uttarakhand',
    city: 'Mussoorie',
    state: 'Uttarakhand',
    country: 'India',
    rating: 4.7,
    numReviews: 1420,
    visitorCount: '52k/mo',
    category: 'Mountains',
    safetyKey: 'mussoorie',
    description: 'The Queen of the Hills in Garhwal, famous for Kempty Falls, Camel\'s Back Road, and misty Gun Hill views.',
    shortDescription: 'The Queen of the Hills in Garhwal, famous for Kempty Falls, Camel\'s Back Road, and misty Gun Hill views.',
    images: ['https://images.unsplash.com/photo-1625057488410-22f7e1b4cce4?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-nainital',
    title: 'Nainital',
    name: 'Nainital',
    slug: 'nainital-uttarakhand',
    city: 'Nainital',
    state: 'Uttarakhand',
    country: 'India',
    rating: 4.8,
    numReviews: 1890,
    visitorCount: '60k/mo',
    category: 'Mountains',
    safetyKey: 'nainital',
    description: 'Enchanting lake district nestled in the Kumaon foothills with Naini Lake, Snow View Point, and scenic treks.',
    shortDescription: 'Enchanting lake district nestled in the Kumaon foothills with Naini Lake, Snow View Point, and scenic treks.',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-rishikesh',
    title: 'Rishikesh',
    name: 'Rishikesh',
    slug: 'triveni-ghat-rishikesh',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    rating: 4.8,
    numReviews: 1980,
    visitorCount: '58k/mo',
    category: 'Adventure',
    safetyKey: 'rishikesh',
    description: 'The Yoga Capital of the World along the turquoise Ganges, nestled at the peaceful foothills of the Himalayas.',
    shortDescription: 'The Yoga Capital of the World along the turquoise Ganges, nestled at the peaceful foothills of the Himalayas.',
    images: ['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-ooty',
    title: 'Ooty',
    name: 'Ooty',
    slug: 'ooty-tamil-nadu',
    city: 'Ooty',
    state: 'Tamil Nadu',
    country: 'India',
    rating: 4.7,
    numReviews: 1560,
    visitorCount: '55k/mo',
    category: 'Mountains',
    safetyKey: 'ooty',
    description: 'The Queen of Nilgiris with lush botanical gardens, heritage toy train, and sprawling tea plantations.',
    shortDescription: 'The Queen of Nilgiris with lush botanical gardens, heritage toy train, and sprawling tea plantations.',
    images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-darjeeling',
    title: 'Darjeeling',
    name: 'Darjeeling',
    slug: 'darjeeling-west-bengal',
    city: 'Darjeeling',
    state: 'West Bengal',
    country: 'India',
    rating: 4.8,
    numReviews: 1720,
    visitorCount: '48k/mo',
    category: 'Mountains',
    safetyKey: 'darjeeling',
    description: 'Land of thunderbolts with iconic tea gardens, Tiger Hill sunrise views, and the UNESCO toy train heritage.',
    shortDescription: 'Land of thunderbolts with iconic tea gardens, Tiger Hill sunrise views, and the UNESCO toy train heritage.',
    images: ['https://images.unsplash.com/photo-1622308644420-63c118e0f178?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-jk',
    title: 'Jammu & Kashmir',
    name: 'Jammu & Kashmir',
    slug: 'jammu-kashmir',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    country: 'India',
    rating: 4.9,
    numReviews: 2100,
    visitorCount: '70k/mo',
    category: 'Mountains',
    safetyKey: 'jammu-kashmir',
    description: 'Paradise on Earth with Dal Lake shikaras, Mughal gardens, snow-capped peaks, and the pristine Pahalgam valley.',
    shortDescription: 'Paradise on Earth with Dal Lake shikaras, Mughal gardens, snow-capped peaks, and the pristine Pahalgam valley.',
    images: ['https://images.unsplash.com/photo-1597074866923-dc0589150458?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-taj-mahal',
    title: 'Taj Mahal',
    name: 'Taj Mahal',
    slug: 'taj-mahal-agra',
    city: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    rating: 4.9,
    numReviews: 2450,
    visitorCount: '75k/mo',
    category: 'Heritage',
    description: 'The timeless monument of eternal love, built in gleaming white Makrana marble on the banks of Yamuna.',
    shortDescription: 'The timeless monument of eternal love, built in gleaming white Makrana marble on the banks of Yamuna.',
    images: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-jaipur',
    title: 'Jaipur',
    name: 'Jaipur',
    slug: 'amber-fort-jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    rating: 4.8,
    numReviews: 1890,
    visitorCount: '62k/mo',
    category: 'Heritage',
    description: 'The regal Pink City celebrated for grand Amer Fort, vibrant Johari bazaars, and royal Rajput palaces.',
    shortDescription: 'The regal Pink City celebrated for grand Amer Fort, vibrant Johari bazaars, and royal Rajput palaces.',
    images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-goa',
    title: 'Goa',
    name: 'Goa',
    slug: 'palolem-beach-goa',
    city: 'Panaji',
    state: 'Goa',
    country: 'India',
    rating: 4.8,
    numReviews: 3120,
    visitorCount: '88k/mo',
    category: 'Beaches',
    description: 'Sun-kissed Arabian shores, Portuguese heritage villas, water sports, and tranquil palm-fringed coastlines.',
    shortDescription: 'Sun-kissed Arabian shores, Portuguese heritage villas, water sports, and tranquil palm-fringed coastlines.',
    images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-varanasi',
    title: 'Varanasi',
    name: 'Varanasi',
    slug: 'dashashwamedh-ghat-varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    rating: 4.9,
    numReviews: 2780,
    visitorCount: '95k/mo',
    category: 'Spiritual',
    description: 'The spiritual heart of India, renowned for holy Ganges ghats and mesmerizing evening Ganga Aarti.',
    shortDescription: 'The spiritual heart of India, renowned for holy Ganges ghats and mesmerizing evening Ganga Aarti.',
    images: ['https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-kerala-backwaters',
    title: 'Kerala Backwaters',
    name: 'Kerala Backwaters',
    slug: 'alleppey-backwaters',
    city: 'Alleppey',
    state: 'Kerala',
    country: 'India',
    rating: 4.9,
    numReviews: 1420,
    visitorCount: '42k/mo',
    category: 'Nature',
    description: 'Serene emerald waterways, traditional kettuvallam houseboats, and lush coconut lagoons in God\u2019s Own Country.',
    shortDescription: 'Serene emerald waterways, traditional kettuvallam houseboats, and lush coconut lagoons in God\u2019s Own Country.',
    images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-leh-ladakh',
    title: 'Leh Ladakh',
    name: 'Leh Ladakh',
    slug: 'pangong-tso-ladakh',
    city: 'Leh',
    state: 'Ladakh',
    country: 'India',
    rating: 4.9,
    numReviews: 1350,
    visitorCount: '38k/mo',
    category: 'Mountains',
    description: 'Spectacular high-altitude desert moonscapes, Pangong Tso crystal waters, and ancient Buddhist gompas.',
    shortDescription: 'Spectacular high-altitude desert moonscapes, Pangong Tso crystal waters, and ancient Buddhist gompas.',
    images: ['https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=85'],
  },
  {
    _id: 'curated-udaipur',
    title: 'Udaipur',
    name: 'Udaipur',
    slug: 'city-palace-udaipur',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    rating: 4.9,
    numReviews: 1720,
    visitorCount: '48k/mo',
    category: 'Heritage',
    description: 'The romantic City of Lakes featuring opulent white marble palaces on shimmering Lake Pichola.',
    shortDescription: 'The romantic City of Lakes featuring opulent white marble palaces on shimmering Lake Pichola.',
    images: ['https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=85'],
  },
];

const POPULAR_CATEGORIES = ['All', 'Heritage', 'Mountains', 'Beaches', 'Spiritual', 'Nature', 'Adventure'];

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [destinations, setDestinations] = useState(CURATED_DESTINATIONS);
  const [heroSlide, setHeroSlide] = useState(0);
  const [showHeroGlobe, setShowHeroGlobe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const preloadImages = CURATED_DESTINATIONS.map((destination) => {
      const image = new Image();
      image.src = destination.images[0];
      return image;
    });
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % CURATED_DESTINATIONS.length);
    }, 4800);
    return () => {
      window.clearInterval(timer);
      preloadImages.forEach((image) => image.removeAttribute('src'));
    };
  }, []);

  useEffect(() => {
    let idleCallbackId;
    let timeoutId;
    const startGlobe = () => setShowHeroGlobe(true);
    if ('requestIdleCallback' in window) {
      idleCallbackId = window.requestIdleCallback(startGlobe, { timeout: 1400 });
    } else {
      timeoutId = window.setTimeout(startGlobe, 350);
    }
    return () => {
      if (idleCallbackId !== undefined) window.cancelIdleCallback?.(idleCallbackId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  // Keep curated destinations first, then fill the rails with unique catalog records.
  useEffect(() => {
    const fetchBackendDestinations = async () => {
      try {
        const res = await api.get('/destinations?limit=1000&sort=rating-desc');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const apiList = res.data.data;
          const usedIds = new Set();
          const curatedMatches = CURATED_DESTINATIONS.map((curated) => {
            const match = apiList.find((item) => {
              if (usedIds.has(item._id)) return false;
              const sameTitle = item.title?.toLowerCase() === curated.title.toLowerCase();
              const sameCityState = item.city?.toLowerCase() === curated.city.toLowerCase()
                && item.state?.toLowerCase() === curated.state.toLowerCase();
              return sameTitle || sameCityState;
            });
            if (!match) return null;
            usedIds.add(match._id);
            // Preserve safetyKey from curated data
            return { ...match, safetyKey: curated.safetyKey };
          }).filter(Boolean);
          const remaining = apiList.filter((item) => !usedIds.has(item._id));
          setDestinations([...curatedMatches, ...remaining].slice(0, 30));
        }
      } catch (err) {
        // Fallback to rich curated local dataset seamlessly
      }
    };

    fetchBackendDestinations();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/destinations');
    }
  };

  const filteredDestinations = (activeCategory === 'All'
    ? destinations
    : destinations.filter((destination) => destination.category?.toLowerCase() === activeCategory.toLowerCase())
  ).slice(0, 30);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="landing-hero relative min-h-[790px] lg:min-h-[720px] flex items-center overflow-hidden bg-[#061326]">
        {/* Large Travel Background Image */}
        <div className="absolute inset-0 w-full h-full z-0 bg-slate-100">
          {CURATED_DESTINATIONS.map((destination, index) => (
            <img
              key={destination._id}
              src={destination.images[0]}
              alt={`${destination.title}, ${destination.state}`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${index === heroSlide ? 'opacity-100' : 'opacity-0'}`}
              fetchPriority={index === heroSlide ? 'high' : 'auto'}
              onError={(event) => {
                if (event.currentTarget.dataset.fallback) {
                  event.currentTarget.style.visibility = 'hidden';
                } else {
                  event.currentTarget.dataset.fallback = 'true';
                  event.currentTarget.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=85';
                }
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030b18]/95 via-[#061326]/90 to-[#07182d]/82" />
        </div>

        <div className="hero-night-sky absolute inset-0 z-[1] pointer-events-none" aria-hidden="true" />
        <div className="hero-world-map absolute inset-0 z-[1] pointer-events-none" aria-hidden="true" />
        <div className="hero-city-lights absolute inset-0 z-[1] pointer-events-none" aria-hidden="true" />
        <svg className="hero-flight-paths absolute inset-0 z-[2] pointer-events-none" viewBox="0 0 1100 650" preserveAspectRatio="none" aria-hidden="true">
          <path className="hero-flight-line" d="M92 255 Q250 132 415 226 T760 241 T1030 192" />
          <path className="hero-flight-line hero-flight-line-warm" d="M205 475 Q392 335 575 420 T930 365" />
          <path className="hero-flight-line" d="M365 190 Q492 94 633 169 T892 139" />
          <g className="hero-flight-points">
            <circle cx="92" cy="255" r="3" /><circle cx="415" cy="226" r="3" />
            <circle cx="760" cy="241" r="3" /><circle cx="1030" cy="192" r="3" />
            <circle cx="205" cy="475" r="2.7" /><circle cx="575" cy="420" r="2.7" />
            <circle cx="930" cy="365" r="2.7" /><circle cx="633" cy="169" r="2.7" />
          </g>
        </svg>

        {showHeroGlobe && <Suspense fallback={null}><HeroGlobe /></Suspense>}

        {/* Hero Content */}
        <div className="landing-hero-layout relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-4 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(420px,1.06fr)] lg:gap-0 lg:px-12 xl:px-16">
          <div className="landing-hero-copy relative z-10 max-w-[650px] space-y-6 text-left text-white">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-sky-100 shadow-sm backdrop-blur-md">
              <Compass className="w-4 h-4 text-sky-300" />
              <span>Smart Tourism & Discovery Platform</span>
            </div>

            <div className="space-y-3">
              <h1 className="hero-brand-title text-6xl font-black leading-none sm:text-7xl xl:text-8xl">
                YatraLok
              </h1>
              <p className="max-w-xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Discover India&apos;s most beautiful destinations.
              </p>
              <p className="max-w-lg text-base leading-relaxed text-slate-200 sm:text-lg">
                Find places worth the journey, understand local crowd conditions, and plan your next route with YatraLok.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl pt-1">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white p-2.5 shadow-xl shadow-black/20"
              >
                <div className="pl-3 text-slate-400">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destination, city or state"
                  className="w-full min-w-0 bg-transparent px-2 py-3 text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 cursor-pointer"
                >
                  Explore
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-start gap-2.5 text-sm text-slate-200">
                <span className="mr-1 font-semibold text-slate-100">Popular:</span>
                {['Shimla', 'Manali', 'Nainital', 'Darjeeling', 'Ooty', 'Rishikesh'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => navigate(`/destinations?search=${encodeURIComponent(item)}`)}
                    className="rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-1.5 font-semibold text-white transition-colors hover:border-sky-300/50 hover:bg-white/15 cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="landing-hero-globe-space" aria-hidden="true" />
        </div>
      </section>

      {/* 2. CURATED TRAVEL DESTINATIONS – SINGLE SCROLLABLE ROW */}
      <section className="w-full px-4 sm:px-6 xl:px-8 space-y-9">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-blue-700 tracking-wider uppercase">
              Curated Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Top Places to Visit in India
            </h2>
            <p className="text-base text-slate-600 mt-2 max-w-2xl">
              Handpicked hill stations, cultural marvels, tranquil beaches, and majestic mountain escapes for your next journey.
            </p>
          </div>

          {/* Popular Categories Filter */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-150 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Single scrollable row with bigger cards */}
        <DestinationRail title="Explore India" destinations={filteredDestinations} />

        {/* "View More Destinations" Button */}
        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/destinations')}
            className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-102"
          >
            <span>View More Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-sm text-slate-500 mt-3">
            Explore 370+ destinations across all 28 states and union territories
          </p>
        </div>
      </section>

      {/* 3. ABOUT SECTION (CLEAN & MINIMAL) */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              About YatraLok
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              A Modern Way to Discover & Experience Incredible India
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              YatraLok is designed to make Indian travel seamless, safe, and inspiring. We bring together iconic heritage monuments, hidden scenic gems, and real-time tourist insights into one clean, modern travel platform.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-base">370+ Verified Places</h4>
                <p className="text-xs text-slate-500 mt-0.5">Accurate descriptions, locations, and traveler ratings</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-base">Safe Exploration</h4>
                <p className="text-xs text-slate-500 mt-0.5">Live crowd updates and instant emergency SOS access</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-sm h-72 sm:h-80">
            <img
              src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80"
              alt="Hampi Heritage India"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION (SIMPLE & CLEAN) */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-50/60 rounded-3xl border border-blue-100 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            Have Questions?
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900">
            Get in Touch with the YatraLok Team
          </h3>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Need travel recommendations, partnership inquiries, or assistance with tourist support? We are here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-sm font-semibold">
            <a
              href="mailto:contact@yatralok.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-800 hover:text-blue-600 shadow-xs"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span>contact@yatralok.com</span>
            </a>
            <a
              href="tel:1363"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-800 hover:text-blue-600 shadow-xs"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Tourist Helpline: 1363</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
