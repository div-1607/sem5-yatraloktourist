import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Users,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Filter,
  Star,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import mlApi from '../services/mlApi';
import { useAuth } from '../context/AuthContext';

const INTEREST_TAGS = [
  'Heritage',
  'Nature',
  'Spiritual',
  'Adventure',
  'Photography',
  'Trekking',
  'Beaches',
  'Architecture',
  'Wildlife',
  'Nightlife',
  'Culinary',
  'Hill Station',
];

export default function RecommendationsHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('smart'); // smart, feed, similar, weather
  const [loading, setLoading] = useState(false);

  // Filter States for Smart Recommendations
  const [age, setAge] = useState(27);
  const [budgetTier, setBudgetTier] = useState('moderate');
  const [selectedInterests, setSelectedInterests] = useState(['Heritage', 'Nature', 'Photography']);
  const [smartResults, setSmartResults] = useState([]);

  // Personalized Feed State
  const [feedData, setFeedData] = useState(null);

  // Similar Tourists State
  const [similarResults, setSimilarResults] = useState([]);

  // Weather Recommendation State
  const [selectedWeather, setSelectedWeather] = useState('Sunny');
  const [weatherResults, setWeatherResults] = useState([]);

  // Fetch Smart Recommendations
  const fetchSmartRecommendations = async () => {
    try {
      setLoading(true);
      const res = await mlApi.getSmartRecommendations({
        age,
        budgetTier,
        interests: selectedInterests,
      });
      if (res.data && res.data.data) {
        setSmartResults(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load smart recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Feed
  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await mlApi.getPersonalizedFeed();
      if (res.data && res.data.data) {
        setFeedData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load personalized feed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Similar Tourists Picks
  const fetchSimilar = async () => {
    try {
      setLoading(true);
      const res = await mlApi.getSimilarTourists();
      if (res.data && res.data.data) {
        setSimilarResults(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load similar tourists picks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Weather-Based Recommendations
  const fetchWeather = async (weather = selectedWeather) => {
    try {
      setLoading(true);
      const res = await mlApi.getWeatherRecommendations(weather);
      if (res.data && res.data.data) {
        setWeatherResults(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load weather recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Trigger data load on tab switch
  useEffect(() => {
    if (activeTab === 'smart') fetchSmartRecommendations();
    else if (activeTab === 'feed') fetchFeed();
    else if (activeTab === 'similar') fetchSimilar();
    else if (activeTab === 'weather') fetchWeather(selectedWeather);
  }, [activeTab]);

  const toggleInterest = (tag) => {
    if (selectedInterests.includes(tag)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((t) => t !== tag));
      } else {
        toast.error('Please select at least 1 interest');
      }
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-black-deep text-slate-100 pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8 text-center sm:text-left">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-blue-royal/40 to-navy-950 border border-blue-electric/30 backdrop-blur-2xl shadow-glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-electric/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-royal/40 border border-blue-electric/30 text-blue-neon text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-electric animate-spin" />
              AI & Machine Learning Tourism Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Smart Destination Recommendation Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl mt-2 leading-relaxed">
              Powered by Scikit-Learn TF-IDF Cosine Similarity, Collaborative Filtering, Dynamic Behavior Modeling, and Real-Time Weather Matching.
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap gap-2 mt-6 p-1.5 rounded-2xl bg-navy-950/70 border border-blue-electric/25 backdrop-blur-xl w-fit">
          <button
            onClick={() => setActiveTab('smart')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'smart'
                ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-neon" /> Smart Profile Engine
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-neon" /> Netflix-Style Tourist Feed
          </button>

          <button
            onClick={() => setActiveTab('similar')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'similar'
                ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-blue-neon" /> Similar Tourists
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" /> Weather Match
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* TAB 1: SMART PROFILE RECOMMENDATIONS */}
        {activeTab === 'smart' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Filter Drawer / Left Controls (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl h-fit">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  ML Recommendation Criteria
                </h3>
              </div>

              {/* Age Slider */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-300">Traveler Age</span>
                  <span className="text-blue-400">{age} years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="75"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Budget Tier */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Budget Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {['budget', 'moderate', 'luxury'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudgetTier(b)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition ${
                        budgetTier === b
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Tags */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Interests & Passions ({selectedInterests.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_TAGS.map((tag) => {
                    const isSelected = selectedInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={fetchSmartRecommendations}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Recalculate AI Matches
              </button>
            </div>

            {/* Right Results Grid (8 cols) */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-xs mt-3">Computing ML Cosine Similarities & Scores...</p>
                </div>
              ) : smartResults.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-sm">
                  No destinations match current criteria. Try expanding your interest selection.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {smartResults.map((item, idx) => {
                    const d = item.destination;
                    return (
                      <motion.div
                        key={d._id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 backdrop-blur-xl overflow-hidden shadow-xl transition-all group flex flex-col justify-between"
                      >
                        <div>
                          {/* Image & Match Badge */}
                          <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                            <img
                              src={d.images && d.images[0] ? d.images[0] : 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80'}
                              alt={d.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-black text-emerald-400 flex items-center gap-1 shadow-lg">
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              {item.matchScore}% MATCH
                            </div>
                            <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-slate-200">
                              {d.city}, {d.state}
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-5">
                            <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors">
                              {d.title}
                            </h3>

                            {/* Match Reasons */}
                            <div className="mt-3 space-y-1">
                              {item.matchReasons &&
                                item.matchReasons.map((reason, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-1.5 text-xs text-slate-300">
                                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    <span>{reason}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-5 pt-0 mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {d.averageRating || 4.5}
                          </div>
                          <Link
                            to={`/destinations/${d._id}`}
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                          >
                            Explore Details <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIZED TOURIST FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-8">
            {loading || !feedData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-xs mt-3">Synthesizing personalized tourist stream...</p>
              </div>
            ) : (
              <>
                {/* Section 1: Top AI Picks */}
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Top Recommended For Your Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {feedData.topPicks.map((item, i) => (
                      <div
                        key={item.destination._id || i}
                        className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl hover:border-indigo-500/40 transition group"
                      >
                        <img
                          src={item.destination.images && item.destination.images[0] ? item.destination.images[0] : 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80'}
                          alt={item.destination.title}
                          className="h-36 w-full object-cover rounded-xl mb-3"
                        />
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-emerald-400">{item.matchScore}% Match</span>
                          <span className="text-xs text-slate-400">{item.destination.city}</span>
                        </div>
                        <h4 className="font-bold text-base text-slate-200 group-hover:text-blue-400">
                          {item.destination.title}
                        </h4>
                        <Link
                          to={`/destinations/${item.destination._id}`}
                          className="mt-3 block text-xs font-semibold text-blue-400 hover:text-blue-300"
                        >
                          View Destination &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Hidden Gems */}
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" />
                    Hidden Gems with High Satisfaction
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {feedData.hiddenGems.map((item, i) => (
                      <div
                        key={item.destination._id || i}
                        className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl hover:border-emerald-500/40 transition group"
                      >
                        <h4 className="font-bold text-base text-slate-200 group-hover:text-emerald-400">
                          {item.destination.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {item.destination.description}
                        </p>
                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span className="text-emerald-400 font-semibold">Low Crowd Unexplored</span>
                          <Link
                            to={`/destinations/${item.destination._id}`}
                            className="text-blue-400 font-semibold"
                          >
                            Explore &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Verified High Safety Places */}
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    Top Verified Safety Ratings (&gt; 90/100)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {feedData.safetyPicks.map((item, i) => (
                      <div
                        key={item.destination._id || i}
                        className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl hover:border-teal-500/40 transition group"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> High Safety
                          </span>
                          <span className="text-xs text-slate-400">{item.destination.state}</span>
                        </div>
                        <h4 className="font-bold text-base text-slate-200 group-hover:text-teal-400">
                          {item.destination.title}
                        </h4>
                        <Link
                          to={`/destinations/${item.destination._id}`}
                          className="mt-3 block text-xs font-semibold text-blue-400 hover:text-blue-300"
                        >
                          Check Crowd & Safety &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: SIMILAR TOURISTS RECOMMENDATIONS */}
        {activeTab === 'similar' && (
          <div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-6 flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-xs text-purple-300">
                <strong>Collaborative Filtering Active:</strong> These spots are highly endorsed by tourists who share your exact interest profile and rating history.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-xs mt-3">Computing Tourist Cluster Similarity...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarResults.map((item, idx) => {
                  const d = item.destination;
                  return (
                    <div
                      key={d._id || idx}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition group"
                    >
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                          {item.communityEndorsementScore}% Community Score
                        </span>
                        <span className="text-slate-400">{item.similarVisitorsCount} Similar Visitors</span>
                      </div>
                      <h4 className="font-bold text-lg text-slate-100 group-hover:text-purple-400 transition-colors">
                        {d.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
                      <Link
                        to={`/destinations/${d._id}`}
                        className="mt-4 block text-xs font-semibold text-purple-400 hover:text-purple-300"
                      >
                        Explore Destination &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WEATHER-BASED RECOMMENDATIONS */}
        {activeTab === 'weather' && (
          <div>
            {/* Weather Switcher Bar */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { name: 'Sunny', icon: Sun, color: 'text-amber-400' },
                { name: 'Rainy', icon: CloudRain, color: 'text-blue-400' },
                { name: 'Cold', icon: Snowflake, color: 'text-sky-300' },
                { name: 'Foggy', icon: Wind, color: 'text-teal-300' },
              ].map((w) => {
                const IconComponent = w.icon;
                const isSelected = selectedWeather.toLowerCase() === w.name.toLowerCase();
                return (
                  <button
                    key={w.name}
                    onClick={() => {
                      setSelectedWeather(w.name);
                      fetchWeather(w.name);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${w.color}`} />
                    {w.name} Weather Picks
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 text-xs mt-3">Filtering destinations for {selectedWeather} weather...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {weatherResults.map((item, idx) => {
                  const d = item.destination;
                  return (
                    <div
                      key={d._id || idx}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-sky-500/40 transition group"
                    >
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-bold text-sky-400">
                          {item.weatherSuitabilityScore}% Weather Match
                        </span>
                        <span className="text-slate-400">{d.state}</span>
                      </div>
                      <h4 className="font-bold text-lg text-slate-100 group-hover:text-sky-400">
                        {d.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        {item.weatherTip}
                      </p>
                      <Link
                        to={`/destinations/${d._id}`}
                        className="mt-4 block text-xs font-semibold text-blue-400 hover:text-blue-300"
                      >
                        Plan Weather Visit &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
