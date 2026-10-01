/**
 * Destination Utilities: WebP Optimization, Dynamic Weather, Safety Score & Category Normalization
 */

/**
 * Optimizes an image URL to modern WebP format with size and quality constraints
 */
export const getOptimizedWebPUrl = (url, width = 800, quality = 80) => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&fm=webp&w=800&q=80';
  }

  try {
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('w', String(width));
      urlObj.searchParams.set('q', String(quality));
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      return urlObj.toString();
    }
  } catch {
    // If invalid URL, return original
  }

  return url;
};

/**
 * Standardize category names for UI display across all 7+ primary categories:
 * Tourist Places, Temples, Historical Sites, Cafes, Shopping, Beaches, Airports, Hill Stations
 */
export const formatCategoryName = (category = '') => {
  const cat = String(category).trim().toLowerCase();
  if (cat.includes('historic')) return 'Historical Sites';
  if (cat.includes('cafe') || cat.includes('restaurant')) return 'Cafes';
  if (cat.includes('shop')) return 'Shopping';
  if (cat.includes('temple')) return 'Temples';
  if (cat.includes('beach')) return 'Beaches';
  if (cat.includes('airport')) return 'Airports';
  if (cat.includes('hill') || cat.includes('mountain')) return 'Hill Stations';
  if (cat.includes('tourist')) return 'Tourist Places';
  return category || 'Tourist Places';
};

/**
 * Generates realistic contextual weather based on destination state/city/category
 */
export const getDestinationWeather = (destination = {}) => {
  const title = (destination.title || destination.name || '').toLowerCase();
  const city = (destination.city || '').toLowerCase();
  const state = (destination.state || '').toLowerCase();
  const cat = (destination.category || '').toLowerCase();

  // 1. Cold / Mountain / Hill Station
  const isMountain =
    /shimla|manali|mussoorie|nainital|ooty|darjeeling|kashmir|gulmarg|leh|ladakh|himachal|uttarakhand|sikkim|munnar|kodaikanal|coorg|gangtok/i.test(
      `${title} ${city} ${state}`
    ) || cat.includes('hill') || cat.includes('mountain');

  if (isMountain) {
    return {
      temp: '16°C',
      condition: 'Misty & Crisp',
      type: 'mountain',
    };
  }

  // 2. Coastal / Beaches
  const isCoastal =
    /goa|kovalam|puri|marina|varkala|gokarna|andaman|alibaug|daman|diu|kochi|pondicherry|mumbai/i.test(
      `${title} ${city} ${state}`
    ) || cat.includes('beach');

  if (isCoastal) {
    return {
      temp: '29°C',
      condition: 'Sunny Breeze',
      type: 'coastal',
    };
  }

  // 3. Cultural & Temples
  if (cat.includes('temple') || /varanasi|madurai|tirupati|amritsar|puri|haridwar/i.test(`${title} ${city}`)) {
    return {
      temp: '24°C',
      condition: 'Clear Sky',
      type: 'clear',
    };
  }

  // 4. Historical & Palaces
  if (cat.includes('historic') || /jaipur|agra|delhi|hampi|udaipur|jodhpur/i.test(`${title} ${city}`)) {
    return {
      temp: '27°C',
      condition: 'Pleasant & Sunny',
      type: 'sunny',
    };
  }

  // 5. Cafes & Shopping
  if (cat.includes('cafe') || cat.includes('shop')) {
    return {
      temp: '23°C',
      condition: 'Comfortable',
      type: 'pleasant',
    };
  }

  // 6. Airports & Transit
  if (cat.includes('airport')) {
    return {
      temp: '25°C',
      condition: 'Fair Visibility',
      type: 'clear',
    };
  }

  return {
    temp: '23°C',
    condition: 'Pleasant Weather',
    type: 'pleasant',
  };
};

/**
 * Computes safety score (e.g. 9.4/10 or 94%)
 */
export const getDestinationSafetyScore = (destination = {}) => {
  if (destination.safetyScore) {
    return Number(destination.safetyScore).toFixed(1);
  }

  const rating = Number(destination.rating) || 4.5;
  const isCrowdLow = destination.crowdStatus === 'low';
  const isCrowdHigh = destination.crowdStatus === 'high';

  let score = 9.1 + (rating - 4.0) * 0.7;
  if (isCrowdLow) score += 0.2;
  if (isCrowdHigh) score -= 0.3;

  if (score > 9.9) score = 9.9;
  if (score < 8.4) score = 8.4;

  return score.toFixed(1);
};
