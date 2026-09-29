import os
import sys
import math
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'saved_models')

# Load trained models
crowd_model_path = os.path.join(MODELS_DIR, 'crowd_rf_model.pkl')
safety_model_path = os.path.join(MODELS_DIR, 'safety_gb_model.pkl')

crowd_model = None
safety_model = None

try:
    if os.path.exists(crowd_model_path):
        crowd_model = joblib.load(crowd_model_path)
        print("[ML Service] Loaded Crowd Random Forest Model")
    if os.path.exists(safety_model_path):
        safety_model = joblib.load(safety_model_path)
        print("[ML Service] Loaded Safety Gradient Boosting Model")
except Exception as e:
    print(f"[ML Service Warning] Error loading models: {e}")

# Helper: calculate distance in km
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'service': 'YatraLok Python ML Microservice',
        'crowdModelLoaded': crowd_model is not None,
        'safetyModelLoaded': safety_model is not None,
        'pythonVersion': sys.version
    })

# 1. CROWD PREDICTION ENDPOINT
@app.route('/predict-crowd', methods=['POST'])
def predict_crowd():
    try:
        data = request.json or {}
        hour = int(data.get('hour', 14))
        is_weekend = 1 if data.get('isWeekend', False) else 0
        season = data.get('season', 'winter').lower()
        season_map = {'winter': 0, 'summer': 1, 'monsoon': 2, 'autumn': 3}
        season_code = season_map.get(season, 0)
        is_festival = 1 if data.get('isFestival', False) else 0
        temp_c = float(data.get('tempC', 25.0))
        base_popularity = int(data.get('basePopularity', 7))

        if crowd_model:
            input_df = pd.DataFrame([{
                'hour': hour,
                'is_weekend': is_weekend,
                'season_code': season_code,
                'is_festival': is_festival,
                'temp_c': temp_c,
                'base_popularity': base_popularity
            }])
            pred = crowd_model.predict(input_df)[0]
            probs = crowd_model.predict_proba(input_df)[0]
            confidence = float(np.max(probs))
        else:
            # Algorithmic fallback
            score = base_popularity * 5 + (is_weekend * 20) + (is_festival * 30)
            if (10 <= hour <= 12) or (16 <= hour <= 19): score += 25
            if score < 40: pred = 0
            elif score < 70: pred = 1
            else: pred = 2
            confidence = 0.85

        label_map = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'}
        color_map = {0: 'Green', 1: 'Yellow', 2: 'Red'}
        score_map = {0: 30, 1: 65, 2: 92}

        pred_label = label_map.get(int(pred), 'MEDIUM')
        pred_color = color_map.get(int(pred), 'Yellow')
        crowd_score = score_map.get(int(pred), 60)

        return jsonify({
            'success': True,
            'predictedCrowdLevel': pred_label,
            'statusColor': pred_color,
            'crowdScore': crowd_score,
            'confidenceScore': round(confidence, 3),
            'factorsEvaluated': {
                'hour': hour,
                'isWeekend': bool(is_weekend),
                'season': season,
                'isFestival': bool(is_festival),
                'temperatureC': temp_c
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 2. SAFETY PREDICTION ENDPOINT
@app.route('/predict-safety', methods=['POST'])
def predict_safety():
    try:
        data = request.json or {}
        crowd_level_str = str(data.get('crowdLevel', 'MEDIUM')).upper()
        crowd_code = 2 if crowd_level_str in ['HIGH', 'RED'] else (0 if crowd_level_str in ['LOW', 'GREEN'] else 1)
        local_incidents = int(data.get('localIncidents', 0))
        hour = int(data.get('hour', 14))
        is_night = 1 if (hour >= 21 or hour <= 5) else 0
        emergency_dist_km = float(data.get('emergencyDistKm', 2.5))

        if safety_model:
            input_df = pd.DataFrame([{
                'crowd_level': crowd_code,
                'local_incidents': local_incidents,
                'hour': hour,
                'is_night': is_night,
                'emergency_dist_km': emergency_dist_km
            }])
            pred_score = float(safety_model.predict(input_df)[0])
            pred_score = round(max(20.0, min(99.0, pred_score)), 1)
        else:
            base = 95 - (local_incidents * 7) - (is_night * 12) - (14 if crowd_code == 2 else 0)
            pred_score = round(max(20.0, min(99.0, base)), 1)

        tier = 'OPTIMAL'
        if pred_score < 50: tier = 'HAZARDOUS'
        elif pred_score < 70: tier = 'CAUTION'
        elif pred_score < 85: tier = 'MODERATE'

        return jsonify({
            'success': True,
            'safetyScore': pred_score,
            'safetyTier': tier,
            'breakdown': {
                'crowdSafety': 75 if crowd_code == 2 else 92,
                'incidentRisk': max(40, 100 - local_incidents * 12),
                'timeLightingScore': 68 if is_night else 94,
                'emergencyProximityScore': max(50, round(100 - emergency_dist_km * 4))
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 3. SMART RECOMMENDATIONS (Cosine Similarity + Multi-Factor)
@app.route('/recommend/smart', methods=['POST'])
def recommend_smart():
    try:
        data = request.json or {}
        user_age = int(data.get('age', 28))
        user_interests = [i.lower() for i in data.get('interests', ['heritage', 'nature', 'photography'])]
        user_budget = data.get('budgetTier', 'moderate').lower()
        user_lat = data.get('latitude', None)
        user_lon = data.get('longitude', None)
        travel_history = set(data.get('travelHistory', []))
        destinations = data.get('destinations', [])

        if not destinations:
            return jsonify({'success': True, 'recommendations': []})

        ranked = []
        user_interest_str = " ".join(user_interests)

        # Build TF-IDF document matrix for destination categories and tags
        doc_texts = []
        for d in destinations:
            cats = d.get('category', '')
            tags = " ".join(d.get('tags', []))
            desc = d.get('description', '')[:100]
            doc_texts.append(f"{cats} {tags} {desc}".lower())

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([user_interest_str] + doc_texts)
        cos_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]

        for i, dest in enumerate(destinations):
            dest_id = str(dest.get('_id', dest.get('id', i)))
            content_sim = float(cos_similarities[i]) # 0.0 to 1.0

            # Factor: Budget alignment
            dest_budget = (dest.get('budgetTier') or 'moderate').lower()
            budget_score = 1.0 if dest_budget == user_budget else 0.65

            # Factor: Travel history penalty (prefer new places)
            history_penalty = 0.5 if dest_id in travel_history else 1.0

            # Factor: Age suitability
            age_suitability = 0.95
            dest_tags = [t.lower() for t in dest.get('tags', [])]
            if user_age < 30 and any(t in dest_tags for t in ['adventure', 'nightlife', 'trekking', 'water sports']):
                age_suitability = 1.0
            elif user_age >= 55 and any(t in dest_tags for t in ['spiritual', 'heritage', 'peaceful', 'gardens']):
                age_suitability = 1.0

            # Distance bonus if user location provided
            dist_bonus = 0.8
            distance_km = None
            if user_lat is not None and user_lon is not None and 'location' in dest and 'coordinates' in dest['location']:
                d_lon, d_lat = dest['location']['coordinates']
                distance_km = round(haversine_km(float(user_lat), float(user_lon), float(d_lat), float(d_lon)), 1)
                if distance_km < 150: dist_bonus = 1.0
                elif distance_km < 500: dist_bonus = 0.9
                else: dist_bonus = 0.75

            # Aggregate final ML score (0 to 100)
            composite_score = (
                (content_sim * 45) +
                (budget_score * 20) +
                (age_suitability * 20) +
                (dist_bonus * 15)
            ) * history_penalty

            composite_score = round(max(10.0, min(99.0, composite_score)), 1)

            reasons = []
            if content_sim > 0.2:
                reasons.append(f"Matches your passion for {user_interests[0]}")
            if budget_score == 1.0:
                reasons.append(f"Fits your {user_budget.capitalize()} budget preference")
            if distance_km and distance_km < 300:
                reasons.append(f"Convenient travel distance ({distance_km} km away)")
            if not reasons:
                reasons.append("Trending top pick among travelers like you")

            ranked.append({
                'destination': dest,
                'matchScore': composite_score,
                'matchReasons': reasons,
                'distanceKm': distance_km
            })

        ranked.sort(key=lambda x: x['matchScore'], reverse=True)
        return jsonify({'success': True, 'recommendations': ranked})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 4. SIMILAR TOURIST RECOMMENDATIONS (Collaborative Filtering)
@app.route('/recommend/similar-tourists', methods=['POST'])
def recommend_similar_tourists():
    try:
        data = request.json or {}
        user_interests = set([i.lower() for i in data.get('interests', [])])
        destinations = data.get('destinations', [])

        recommendations = []
        for dest in destinations:
            tags = set([t.lower() for t in dest.get('tags', [])])
            overlap = len(user_interests.intersection(tags))
            rating = float(dest.get('averageRating', 4.5))
            reviews_count = int(dest.get('totalReviews', 10))

            # Collaborative score
            collab_score = min(99, round(overlap * 20 + rating * 10 + min(reviews_count, 50) * 0.2))
            recommendations.append({
                'destination': dest,
                'communityEndorsementScore': collab_score,
                'similarVisitorsCount': max(120, reviews_count * 8),
                'reason': f"Loved by tourists with shared interest in {list(user_interests)[:2]}"
            })

        recommendations.sort(key=lambda x: x['communityEndorsementScore'], reverse=True)
        return jsonify({'success': True, 'recommendations': recommendations})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 5. WEATHER-BASED RECOMMENDATIONS
@app.route('/recommend/weather', methods=['POST'])
def recommend_weather():
    try:
        data = request.json or {}
        weather = str(data.get('weather', 'sunny')).lower() # sunny, rainy, cold, foggy
        destinations = data.get('destinations', [])

        weather_affinity = {
            'sunny': ['beach', 'monument', 'outdoor', 'heritage', 'island', 'lake', 'desert'],
            'rainy': ['waterfall', 'monsoon', 'tea gardens', 'lush valley', 'indoor museum', 'ayurveda'],
            'cold': ['snow', 'skiing', 'hot springs', 'forts', 'palace', 'trekking'],
            'foggy': ['hill station', 'coffee plantation', 'mountain retreat', 'spiritual']
        }

        target_keywords = weather_affinity.get(weather, weather_affinity['sunny'])
        scored = []

        for dest in destinations:
            text = f"{dest.get('category', '')} {' '.join(dest.get('tags', []))} {dest.get('description', '')}".lower()
            match_count = sum(1 for kw in target_keywords if kw in text)
            weather_score = round(min(98, 60 + match_count * 12 + float(dest.get('averageRating', 4.0)) * 6), 1)

            scored.append({
                'destination': dest,
                'weatherCondition': weather.capitalize(),
                'weatherSuitabilityScore': weather_score,
                'weatherTip': f"Ideal to experience right now during {weather.capitalize()} conditions!"
            })

        scored.sort(key=lambda x: x['weatherSuitabilityScore'], reverse=True)
        return jsonify({'success': True, 'weather': weather, 'recommendations': scored})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"[YatraLok ML Service] Listening on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
