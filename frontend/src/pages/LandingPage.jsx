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
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';
import CrowdBadge from '../components/CrowdBadge';

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
  const navigate = useNavigate();

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
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-8 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-8 z-10">
          {/* Top safety pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-900/80 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-glow-amber"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Smart Tourism & Real-time Crowd Safety Guard</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Travel Safely, Explore{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Boundlessly
            </span>{' '}
            with Yatra Lok
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Discover ancient sanctums, royal palaces, coastal shores, and secret cafes across India with real-time crowd density indicators and instant GPS emergency SOS.
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
              className="p-2 rounded-2xl bg-navy-900/80 border border-white/20 backdrop-blur-2xl shadow-glass flex items-center gap-2"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <input
                type="text"
                placeholder="Search by monument, state, city (e.g. Taj Mahal, Varanasi, Goa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none px-2"
              />
              <button
                type="submit"
                className="glass-button-primary shrink-0 py-2.5 px-6 text-xs uppercase tracking-wider"
              >
                Search Places
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Popular:</span>
              {['Varanasi', 'Taj Mahal', 'Jaipur', 'Baga Beach', 'Manali'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/destinations?search=${tag}`)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. ANIMATED STATISTICS COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Happy Travelers', value: '120,000+', icon: Users, color: 'text-amber-400' },
            { label: 'Verified Destinations', value: '500+', icon: Landmark, color: 'text-blue-400' },
            { label: 'Crowd Safety Index', value: '99.4%', icon: ShieldCheck, color: 'text-emerald-400' },
            { label: 'SOS Response Time', value: '< 4 Mins', icon: AlertTriangle, color: 'text-rose-400' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-navy-900/40 backdrop-blur-xl border border-white/10 shadow-glass text-center space-y-2"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-slate-400">
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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Themes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Curated Travel Categories
            </h2>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
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
                className="group cursor-pointer relative p-6 rounded-2xl bg-navy-900/50 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 shadow-glass hover:shadow-glass-hover transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'Explore authentic highlights and heritage.'}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-amber-400/80 group-hover:text-amber-300 gap-1">
                  <span>View listings</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. POPULAR DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Traveler Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Popular Destinations Across India
            </h2>
          </div>
          <Link
            to="/destinations?sort=rating-desc"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => (
            <DestinationCard key={dest._id} destination={dest} />
          ))}
        </div>
      </section>

      {/* 5. CROWD SAFETY INDICATOR PROMO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-navy-900/90 via-navy-800/80 to-navy-900/90 border border-white/15 p-8 sm:p-12 overflow-hidden shadow-2xl">
          {/* Subtle amber accent beam */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Real-time Safety Standard</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Know The Crowd Before You Go.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Yatra Lok’s smart footfall telemetry continuously classifies destinations into three dynamic crowd levels, so you can pick peaceful visiting hours and travel stress-free.
              </p>

              {/* 3 Indicators Breakdown */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-950/60 border border-emerald-500/20">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">
                      Green - Low Crowd (Calm & Peaceful)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Capacity &lt; 40%. Optimal for serene sightseeing, peaceful photography, and zero wait queues.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-950/60 border border-amber-500/20">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">
                      Yellow - Moderate Crowd (Lively Rush)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Capacity 40% - 75%. Lively festive atmosphere with standard manageable queues.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-950/60 border border-rose-500/20">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">
                      Red - High Crowd (Heavy Rush & Caution)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Capacity &gt; 75%. Peak rush hours. Exercise caution, keep personal belongings secure, and follow queue lines.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/crowd-safety"
                className="glass-button-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>Launch Live Crowd Radar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual Glass Card Graphic */}
            <div className="p-6 rounded-2xl bg-navy-950/80 border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Density Sample
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  Live Telemetry
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Taj Mahal, Agra</p>
                    <p className="text-[10px] text-slate-400">Historical Places</p>
                  </div>
                  <CrowdBadge level="high" percentage={88} size="sm" />
                </div>
                <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Solang Valley, Manali</p>
                    <p className="text-[10px] text-slate-400">Tourist Places</p>
                  </div>
                  <CrowdBadge level="low" percentage={30} size="sm" />
                </div>
                <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Hawa Mahal, Jaipur</p>
                    <p className="text-[10px] text-slate-400">Historical Places</p>
                  </div>
                  <CrowdBadge level="moderate" percentage={65} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION / SIGNUP BANNER */}
      <section className="max-w-5xl mx-auto px-4 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-amber-600/30 via-navy-900/80 to-navy-950 border border-amber-500/30 shadow-glow-amber space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Begin Your Sacred & Safe Journey?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Create your personalized tourist profile today to save favorite places, track safety notices, and explore India with total peace of mind.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <Link
              to="/signup"
              className="glass-button-primary text-xs uppercase tracking-wider px-8 py-3.5"
            >
              Sign Up As Tourist
            </Link>
            <Link
              to="/destinations"
              className="glass-button-secondary text-xs tracking-wider px-8 py-3.5"
            >
              Explore Without Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
