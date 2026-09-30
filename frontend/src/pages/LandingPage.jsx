import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  ShieldCheck,
  AlertTriangle,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  Landmark,
  ShoppingBag,
  Clock,
  Sun,
  Plane,
  Coffee,
  CheckCircle2,
  Heart,
  TrendingUp,
  Radio,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';
import CrowdBadge from '../components/CrowdBadge';

const heroDestinations = [
  {
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Varanasi Ghats & Ganges',
    location: 'Varanasi, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Amber Fort & Palaces',
    location: 'Jaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Kerala Backwaters',
    location: 'Alleppey, Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Pristine Coastal Shores',
    location: 'Palolem Beach, Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Kashmir Mountain Valleys',
    location: 'Pahalgam, Jammu & Kashmir',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Golden Temple (Harmandir Sahib)',
    location: 'Amritsar, Punjab',
    image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Hampi Vijayanagara Ruins',
    location: 'Hampi, Karnataka',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Lake Pichola & City Palace',
    location: 'Udaipur, Rajasthan',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Ganges Foothills & Temples',
    location: 'Rishikesh, Uttarakhand',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=85',
  },
  {
    name: 'Meghalaya Misty Hills',
    location: 'Cherrapunji, Meghalaya',
    image: 'https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=2400&q=85',
  },
];

const iconMap = {
  Compass,
  Sparkles,
  Landmark,
  ShoppingBag,
  Clock,
  Sun,
  Plane,
  Coffee,
};

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const navigate = useNavigate();

  // Preload carousel images for seamless non-flicker transitions
  useEffect(() => {
    heroDestinations.forEach((dest) => {
      const img = new Image();
      img.src = dest.image;
    });
  }, []);

  // Automatic smooth transition between destinations (slows down when hovered)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroDestinations.length);
    }, isHeroHovered ? 12000 : 6000);

    return () => clearInterval(timer);
  }, [isHeroHovered]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes] = await Promise.all([
          api.get('/destinations/categories'),
          api.get('/destinations/featured'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
        if (featRes.data.success) {
          setFeaturedDestinations(featRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/destinations');
    }
  };

  return (
    <div className="space-y-24 pb-20 bg-black-deep text-slate-100 min-h-screen">
      {/* 1. HERO SECTION WITH CINEMATIC DESTINATION CAROUSEL */}
      <section
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        className="relative min-h-[90vh] flex flex-col items-center justify-center pt-8 pb-12 overflow-hidden select-none"
      >
        {/* Full-Screen Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            poster="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2400&q=85"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>

          {/* Subtle Dark / Transparent Overlay & Blue-Black Color Grading for Maximum Readability */}
          <div className="absolute inset-0 bg-black-deep/45 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black-deep/75 via-navy-950/40 to-black-deep/90 pointer-events-none" />
          
          {/* Gentle Vignette Around Edges */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.7) 100%)',
            }}
          />

          {/* Ambient Luxury Dark Glow Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-electric/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-royal/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-navy-800/25 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Foreground Content with Floating Luxury Glassmorphism */}
        <div className="relative max-w-5xl mx-auto px-4 text-center z-10 w-full">
          <div className="p-6 sm:p-10 rounded-3xl bg-black-deep/40 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(10,31,68,0.37)] hover:border-blue-electric/30 transition-all duration-500 space-y-8">
            {/* Top safety pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-950/80 border border-blue-electric/30 text-blue-neon text-xs font-bold backdrop-blur-xl shadow-glow-electric"
            >
              <Radio className="w-4 h-4 text-blue-electric animate-pulse" />
              <span>Futuristic Smart Tourism & Live Crowd Geofence System</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight drop-shadow-md"
            >
              Travel Safely, Explore{' '}
              <span className="bg-gradient-to-r from-blue-neon via-blue-electric to-blue-royal bg-clip-text text-transparent">
                Boundlessly
              </span>{' '}
              with YatraLok
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal"
            >
              Discover sacred temples, royal heritage fortresses, misty hilltops, and pristine shores across India with live ML crowd predictions and instant GPS emergency SOS.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <form
                onSubmit={handleSearch}
                className="p-2 rounded-2xl bg-black-midnight/80 border border-blue-electric/35 backdrop-blur-2xl shadow-glass-panel flex items-center gap-2"
              >
                <div className="pl-3 text-slate-400">
                  <Search className="w-5 h-5 text-blue-electric" />
                </div>
                <input
                  type="text"
                  placeholder="Search by monument, state, city (e.g. Kedarnath, Taj Mahal, Goa)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none px-2"
                />
                <button
                  type="submit"
                  className="glass-button-primary shrink-0 py-2.5 px-6 text-xs uppercase tracking-wider cursor-pointer"
                >
                  Search Places
                </button>
              </form>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                <span className="font-bold text-slate-300">Trending Now:</span>
                {['Kedarnath', 'Taj Mahal', 'Varanasi', 'Jaipur', 'Radhanagar Beach', 'Manali'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/destinations?search=${tag}`)}
                    className="px-3 py-1 rounded-full bg-navy-950/70 hover:bg-blue-royal/40 hover:text-white border border-blue-electric/20 text-slate-300 transition-colors shadow-glass cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Carousel Destination Tag & Subtle Blue Theme Indicators */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 z-20">
            {/* Active Landmark Info Pill */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black-midnight/70 border border-blue-electric/30 text-xs text-slate-300 backdrop-blur-xl shadow-glass"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-electric" />
              <span className="font-semibold text-white">{heroDestinations[currentSlide].name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-blue-neon">{heroDestinations[currentSlide].location}</span>
            </motion.div>

            {/* Subtle Carousel Indicators */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-black-midnight/60 border border-white/5 backdrop-blur-md">
              {heroDestinations.map((dest, idx) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  title={`${dest.name}, ${dest.location}`}
                  className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${
                    currentSlide === idx
                      ? 'w-6 bg-blue-electric shadow-[0_0_8px_#3B82F6]'
                      : 'w-1.5 bg-slate-500/40 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to ${dest.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ANIMATED STATISTICS COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Active Tourists', value: '120,000+', icon: Users, color: 'text-blue-electric' },
            { label: 'Verified Destinations', value: '500+', icon: Landmark, color: 'text-blue-neon' },
            { label: 'Crowd Safety Index', value: '99.4%', icon: ShieldCheck, color: 'text-emerald-400' },
            { label: 'SOS Response Window', value: '< 3 Mins', icon: AlertTriangle, color: 'text-red-400' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="glass-card p-6 text-center space-y-3"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-navy-950/80 border border-blue-electric/30 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. TOURISM CATEGORIES CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-neon uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-electric" />
              <span>Explore Themes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Curated Travel Collections
            </h2>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-neon hover:text-white transition-colors"
          >
            <span>Browse All Places</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon] || Compass;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => navigate(`/destinations?category=${encodeURIComponent(cat.name)}`)}
                className="group cursor-pointer relative p-6 rounded-2xl bg-black-midnight/70 backdrop-blur-2xl border border-blue-electric/25 hover:border-blue-electric/60 shadow-glass hover:shadow-glass-hover transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-navy-950/80 border border-blue-electric/30 flex items-center justify-center text-blue-neon group-hover:scale-110 transition-transform shadow-glow-electric">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-electric transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'Explore authentic highlights and heritage.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-blue-neon group-hover:text-white gap-1 transition-colors">
                  <span>View listings</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-neon uppercase tracking-widest mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-blue-electric" />
              <span>Verified Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Trending Destinations with Live Crowd Feeds
            </h2>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-neon hover:text-white transition-colors"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.slice(0, 6).map((dest) => (
            <DestinationCard key={dest._id} destination={dest} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
