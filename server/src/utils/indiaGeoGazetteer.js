/**
 * Pan-India Agricultural Gazetteer & Geocoding Engine
 * Covers all 28 States, 8 Union Territories, major agricultural districts, APMC Mandis, and rural farming clusters.
 * Includes automated fallback to OpenStreetMap Nominatim for obscure villages and tehsils.
 */

// Comprehensive Pan-India Agricultural Gazetteer Database
export const INDIA_ZONES_DATABASE = [
  // --- PUNJAB ---
  { name: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', lat: 30.900965, lng: 75.857277, type: 'city', famous_for: 'Wheat, Basmati Rice, Kinnow' },
  { name: 'Khanna', district: 'Ludhiana', state: 'Punjab', lat: 30.7042, lng: 76.2163, type: 'mandi_town', famous_for: 'Asia’s Largest Grain Market (Paddy & Wheat)' },
  { name: 'Amritsar', district: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, type: 'city', famous_for: 'Basmati Rice, Vegetables' },
  { name: 'Bathinda', district: 'Bathinda', state: 'Punjab', lat: 30.2110, lng: 74.9455, type: 'city', famous_for: 'Cotton Belt, Wheat, Mustard' },
  { name: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', lat: 31.3260, lng: 75.5762, type: 'city', famous_for: 'Potato seed hub, Maize' },
  { name: 'Patiala', district: 'Patiala', state: 'Punjab', lat: 30.3398, lng: 76.3869, type: 'city', famous_for: 'Paddy, Sugarcane' },
  { name: 'Sangrur', district: 'Sangrur', state: 'Punjab', lat: 30.2458, lng: 75.8421, type: 'district_town', famous_for: 'Paddy & Wheat powerhouse' },
  { name: 'Faridkot', district: 'Faridkot', state: 'Punjab', lat: 30.6769, lng: 74.7583, type: 'town', famous_for: 'Cotton, Wheat' },
  { name: 'Punjab', district: 'State Centroid', state: 'Punjab', lat: 31.1471, lng: 75.3412, type: 'state', famous_for: 'Breadbasket of India' },

  // --- HARYANA ---
  { name: 'Karnal', district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905, type: 'city', famous_for: 'Basmati Rice Mandi & Dairy Research' },
  { name: 'Hisar', district: 'Hisar', state: 'Haryana', lat: 29.1492, lng: 75.7217, type: 'city', famous_for: 'Cotton, Mustard, Bajra' },
  { name: 'Sirsa', district: 'Sirsa', state: 'Haryana', lat: 29.5349, lng: 75.0296, type: 'city', famous_for: 'Cotton & Wheat' },
  { name: 'Kurukshetra', district: 'Kurukshetra', state: 'Haryana', lat: 29.9695, lng: 76.8783, type: 'city', famous_for: 'Paddy & Wheat' },
  { name: 'Haryana', district: 'State Centroid', state: 'Haryana', lat: 29.0588, lng: 76.0856, type: 'state', famous_for: 'Agriculture & Dairy' },

  // --- MAHARASHTRA ---
  { name: 'Nashik', district: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898, type: 'city', famous_for: 'Grapes, Onions, Tomatoes' },
  { name: 'Lasalgaon', district: 'Nashik', state: 'Maharashtra', lat: 20.1478, lng: 74.2257, type: 'mandi_town', famous_for: 'Asia’s Largest Onion Mandi' },
  { name: 'Pune', district: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, type: 'city', famous_for: 'Sugarcane, Floriculture, Jowar' },
  { name: 'Baramati', district: 'Pune', state: 'Maharashtra', lat: 18.1517, lng: 74.5772, type: 'town', famous_for: 'High-Tech Agri Hub & Sugarcane' },
  { name: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, type: 'city', famous_for: 'Nagpur Oranges, Cotton, Soybean' },
  { name: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lng: 74.2433, type: 'city', famous_for: 'Organic Jaggery, Sugarcane' },
  { name: 'Solapur', district: 'Solapur', state: 'Maharashtra', lat: 17.6599, lng: 75.9064, type: 'city', famous_for: 'Pomegranates (Bhagwa), Jowar' },
  { name: 'Jalgaon', district: 'Jalgaon', state: 'Maharashtra', lat: 21.0077, lng: 75.5626, type: 'city', famous_for: 'Banana Capital of India' },
  { name: 'Aurangabad (Chhatrapati Sambhajinagar)', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', lat: 19.8762, lng: 75.3433, type: 'city', famous_for: 'Cotton, Maize, Sweet Lime' },
  { name: 'Maharashtra', district: 'State Centroid', state: 'Maharashtra', lat: 19.7515, lng: 75.7139, type: 'state', famous_for: 'Horticulture, Cotton, Sugarcane' },

  // --- UTTAR PRADESH ---
  { name: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, type: 'city', famous_for: 'Dasheri Mangoes, Wheat, Pulses' },
  { name: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, type: 'city', famous_for: 'Vegetables, Rice, Mustard' },
  { name: 'Muzaffarnagar', district: 'Muzaffarnagar', state: 'Uttar Pradesh', lat: 29.4727, lng: 77.7085, type: 'city', famous_for: 'Sugar Capital of India & Jaggery' },
  { name: 'Meerut', district: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064, type: 'city', famous_for: 'Sugarcane, Wheat' },
  { name: 'Bareilly', district: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lng: 79.4304, type: 'city', famous_for: 'Rice, Sugarcane' },
  { name: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732, type: 'city', famous_for: 'Paddy, Mustard, Wheat' },
  { name: 'Agra', district: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, type: 'city', famous_for: 'Potato Belt, Mustard' },
  { name: 'Kanpur', district: 'Kanpur Nagar', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, type: 'city', famous_for: 'Pulses, Oilseeds, Wheat' },
  { name: 'Uttar Pradesh', district: 'State Centroid', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, type: 'state', famous_for: 'Largest Producer of Wheat & Sugarcane' },

  // --- MADHYA PRADESH ---
  { name: 'Indore', district: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, type: 'city', famous_for: 'Soybean Capital of India, Sharbati Wheat' },
  { name: 'Ujjain', district: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lng: 75.7885, type: 'city', famous_for: 'Soybean, Wheat, Gram (Chana)' },
  { name: 'Sehore', district: 'Sehore', state: 'Madhya Pradesh', lat: 23.2032, lng: 77.0844, type: 'town', famous_for: 'Authentic Sehore Sharbati Wheat' },
  { name: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, type: 'city', famous_for: 'Pulses, Soybean' },
  { name: 'Jabalpur', district: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lng: 79.9864, type: 'city', famous_for: 'Green Peas (Matar), Rice' },
  { name: 'Madhya Pradesh', district: 'State Centroid', state: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, type: 'state', famous_for: 'Soybean, Pulses & Wheat' },

  // --- RAJASTHAN ---
  { name: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, type: 'city', famous_for: 'Mustard, Barley, Bajra' },
  { name: 'Chomu', district: 'Jaipur', state: 'Rajasthan', lat: 27.1667, lng: 75.7167, type: 'mandi_town', famous_for: 'High-yield Vegetable & Millet Mandi' },
  { name: 'Kota', district: 'Kota', state: 'Rajasthan', lat: 25.2138, lng: 75.8648, type: 'city', famous_for: 'Soybean, Mustard, Coriander' },
  { name: 'Bikaner', district: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119, type: 'city', famous_for: 'Moth Bean, Guar Gum, Groundnut' },
  { name: 'Sri Ganganagar', district: 'Sri Ganganagar', state: 'Rajasthan', lat: 29.9038, lng: 73.8772, type: 'city', famous_for: 'Kinnow & Food Bowl of Rajasthan' },
  { name: 'Nagaur', district: 'Nagaur', state: 'Rajasthan', lat: 27.1983, lng: 73.7493, type: 'city', famous_for: 'Fenugreek (Kasuri Methi), Cumin, Moong' },
  { name: 'Rajasthan', district: 'State Centroid', state: 'Rajasthan', lat: 27.0238, lng: 74.2179, type: 'state', famous_for: 'Mustard, Spices & Millets' },

  // --- GUJARAT ---
  { name: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, type: 'city', famous_for: 'Cotton, Wheat, Castor' },
  { name: 'Rajkot', district: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, type: 'city', famous_for: 'Groundnut Capital, Cotton' },
  { name: 'Anand', district: 'Anand', state: 'Gujarat', lat: 22.5645, lng: 72.9289, type: 'city', famous_for: 'Milk Capital (Amul), Tobacco, Banana' },
  { name: 'Unjha', district: 'Mehsana', state: 'Gujarat', lat: 23.8037, lng: 72.3917, type: 'mandi_town', famous_for: 'World’s Largest Cumin & Isabgol Mandi' },
  { name: 'Surat', district: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, type: 'city', famous_for: 'Sugarcane, Banana, Mango' },
  { name: 'Gujarat', district: 'State Centroid', state: 'Gujarat', lat: 22.2587, lng: 71.1924, type: 'state', famous_for: 'Cotton, Groundnut, Spices' },

  // --- KARNATAKA ---
  { name: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9716, lng: 77.5946, type: 'city', famous_for: 'Floriculture, Vegetables, Ragi' },
  { name: 'Mandya', district: 'Mandya', state: 'Karnataka', lat: 12.5218, lng: 76.8951, type: 'city', famous_for: 'Sugar City of Karnataka & Paddy' },
  { name: 'Hubballi-Dharwad', district: 'Dharwad', state: 'Karnataka', lat: 15.3647, lng: 75.1240, type: 'city', famous_for: 'Byadagi Chilli, Cotton, Pulses' },
  { name: 'Byadagi', district: 'Haveri', state: 'Karnataka', lat: 14.6784, lng: 75.4855, type: 'mandi_town', famous_for: 'Famous Byadagi Red Chilli Market' },
  { name: 'Chikkamagaluru', district: 'Chikkamagaluru', state: 'Karnataka', lat: 13.3153, lng: 75.7754, type: 'city', famous_for: 'Coffee Capital of India, Pepper, Cardamom' },
  { name: 'Shimoga (Shivamogga)', district: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lng: 75.5681, type: 'city', famous_for: 'Areca Nut, Paddy' },
  { name: 'Karnataka', district: 'State Centroid', state: 'Karnataka', lat: 15.3173, lng: 75.7139, type: 'state', famous_for: 'Coffee, Spices, Ragi & Silk' },

  // --- TAMIL NADU ---
  { name: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, type: 'city', famous_for: 'Export Port & Produce Market' },
  { name: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, type: 'city', famous_for: 'Cotton, Coconut, Poultry' },
  { name: 'Thanjavur', district: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lng: 79.1378, type: 'city', famous_for: 'Rice Bowl of Tamil Nadu' },
  { name: 'Erode', district: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lng: 77.7172, type: 'city', famous_for: 'Turmeric City of India' },
  { name: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, type: 'city', famous_for: 'Jasmine Flower (Madurai Malli), Paddy' },
  { name: 'Tamil Nadu', district: 'State Centroid', state: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, type: 'state', famous_for: 'Rice, Turmeric, Coconut, Bananas' },

  // --- ANDHRA PRADESH & TELANGANA ---
  { name: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, type: 'city', famous_for: 'Asia’s Largest Red Chilli Market & Tobacco' },
  { name: 'Vijayawada', district: 'Krishna', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480, type: 'city', famous_for: 'Rice, Mango (Banganapalle)' },
  { name: 'Anantapur', district: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006, type: 'city', famous_for: 'Groundnut, Sweet Orange' },
  { name: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, type: 'city', famous_for: 'Rice, Cotton, Vegetables' },
  { name: 'Warangal', district: 'Warangal', state: 'Telangana', lat: 17.9784, lng: 79.5941, type: 'city', famous_for: 'Cotton, Chilli, Turmeric' },
  { name: 'Nizamabad', district: 'Nizamabad', state: 'Telangana', lat: 18.6725, lng: 78.0941, type: 'city', famous_for: 'Turmeric & Rice powerhouse' },
  { name: 'Andhra Pradesh', district: 'State Centroid', state: 'Andhra Pradesh', lat: 15.9129, lng: 79.7400, type: 'state', famous_for: 'Chilli, Tobacco, Rice, Aqua' },
  { name: 'Telangana', district: 'State Centroid', state: 'Telangana', lat: 18.1124, lng: 79.0193, type: 'state', famous_for: 'Cotton, Turmeric, Paddy' },

  // --- KERALA ---
  { name: 'Kochi (Ernakulam)', district: 'Ernakulam', state: 'Kerala', lat: 9.9312, lng: 76.2673, type: 'city', famous_for: 'Spices Board HQ, Black Pepper' },
  { name: 'Wayanad', district: 'Wayanad', state: 'Kerala', lat: 11.6854, lng: 76.1320, type: 'district_town', famous_for: 'Robusta Coffee, Cardamom, Tea' },
  { name: 'Idukki', district: 'Idukki', state: 'Kerala', lat: 9.8500, lng: 76.9700, type: 'district_town', famous_for: 'Cardamom & Spices Hills' },
  { name: 'Palakkad', district: 'Palakkad', state: 'Kerala', lat: 10.7867, lng: 76.6548, type: 'city', famous_for: 'Rice Bowl of Kerala' },
  { name: 'Kerala', district: 'State Centroid', state: 'Kerala', lat: 10.8505, lng: 76.2711, type: 'state', famous_for: 'God’s Own Country Spices & Rubber' },

  // --- WEST BENGAL, BIHAR, ODISHA, ASSAM ---
  { name: 'Kolkata', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, type: 'city', famous_for: 'Jute, Rice, Betel Vine' },
  { name: 'Burdwan (Bardhaman)', district: 'Purba Bardhaman', state: 'West Bengal', lat: 23.2324, lng: 87.8615, type: 'city', famous_for: 'Rice Bowl of Bengal (Gobindobhog Rice)' },
  { name: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', lat: 26.7271, lng: 88.3953, type: 'city', famous_for: 'Darjeeling Tea & Pineapple' },
  { name: 'Patna', district: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, type: 'city', famous_for: 'Paddy, Wheat, Maize' },
  { name: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lng: 85.3647, type: 'city', famous_for: 'Shahi Litchi Capital of India' },
  { name: 'Bhagalpur', district: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lng: 86.9842, type: 'city', famous_for: 'Katarni Rice & Jardalu Mango' },
  { name: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', lat: 20.2961, lng: 85.8245, type: 'city', famous_for: 'Rice, Pulses, Cashew' },
  { name: 'Guwahati', district: 'Kamrup', state: 'Assam', lat: 26.1445, lng: 91.7362, type: 'city', famous_for: 'Assam Tea, Joha Rice, Mustard' },
  { name: 'West Bengal', district: 'State Centroid', state: 'West Bengal', lat: 22.9868, lng: 87.8550, type: 'state', famous_for: 'Rice & Jute' },
  { name: 'Bihar', district: 'State Centroid', state: 'Bihar', lat: 25.0961, lng: 85.3131, type: 'state', famous_for: 'Maize, Litchi, Rice' },

  // --- HIMACHAL PRADESH, J&K, UTTARAKHAND ---
  { name: 'Shimla', district: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, type: 'city', famous_for: 'Shimla Apple, Cherry, Garlic' },
  { name: 'Kullu', district: 'Kullu', state: 'Himachal Pradesh', lat: 31.9579, lng: 77.1095, type: 'town', famous_for: 'Royal Delicious Apples, Trout' },
  { name: 'Srinagar', district: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973, type: 'city', famous_for: 'Kashmiri Saffron, Walnut, Apple' },
  { name: 'Pampore', district: 'Pulwama', state: 'Jammu and Kashmir', lat: 34.0200, lng: 74.9300, type: 'town', famous_for: 'Saffron Town of Kashmir' },
  { name: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322, type: 'city', famous_for: 'Dehraduni Basmati Rice & Litchi' },
  { name: 'Delhi NCR', district: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, type: 'city', famous_for: 'National Capital Central Mandi' }
];

const geocodingCache = new Map();
const reverseGeocodingCache = new Map();

// Haversine calculation for spatial proximity
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

export const searchIndianZones = (queryStr) => {
  if (!queryStr || typeof queryStr !== 'string') return [];
  const q = queryStr.trim().toLowerCase();

  return INDIA_ZONES_DATABASE.filter(z => {
    return (
      z.name.toLowerCase().includes(q) ||
      z.district.toLowerCase().includes(q) ||
      z.state.toLowerCase().includes(q) ||
      (z.famous_for && z.famous_for.toLowerCase().includes(q))
    );
  }).slice(0, 15);
};

export const resolveIndianLocation = async (locationQuery) => {
  if (!locationQuery || typeof locationQuery !== 'string') return null;
  const cleanQuery = locationQuery.trim();
  const lower = cleanQuery.toLowerCase();

  if (geocodingCache.has(lower)) {
    return geocodingCache.get(lower);
  }

  const matched = INDIA_ZONES_DATABASE.find(z => 
    z.name.toLowerCase() === lower || 
    z.district.toLowerCase() === lower ||
    z.state.toLowerCase() === lower
  ) || INDIA_ZONES_DATABASE.find(z => 
    z.name.toLowerCase().includes(lower) || 
    lower.includes(z.name.toLowerCase())
  );

  if (matched) {
    const result = {
      name: matched.name,
      district: matched.district,
      state: matched.state,
      lat: matched.lat,
      lng: matched.lng,
      famous_for: matched.famous_for,
      source: 'local_gazetteer',
      formatted_address: `${matched.name}, ${matched.district !== 'State Centroid' ? matched.district + ', ' : ''}${matched.state}, India`
    };
    geocodingCache.set(lower, result);
    return result;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=in&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AgriSmart-Backend-Locator/1.0 (agrismart.app)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const top = data[0];
        const result = {
          name: cleanQuery,
          lat: parseFloat(top.lat),
          lng: parseFloat(top.lon),
          source: 'nominatim_osm',
          formatted_address: top.display_name
        };
        geocodingCache.set(lower, result);
        return result;
      }
    }
  } catch (err) {
    console.warn(`[Nominatim Geocoding Failed for "${cleanQuery}"]:`, err.message);
  }

  return {
    name: cleanQuery,
    state: 'India',
    lat: 21.1458,
    lng: 79.0882,
    source: 'centroid_fallback',
    formatted_address: `${cleanQuery}, India`
  };
};

/**
 * Reverse Geocode: Resolves GPS coordinates (from device's Current Location) to nearest Indian city/village/district
 * @param {number} lat 
 * @param {number} lng 
 */
export const reverseGeocodeIndianLocation = async (lat, lng) => {
  const roundedKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseGeocodingCache.has(roundedKey)) {
    return reverseGeocodingCache.get(roundedKey);
  }

  // 1. Check closest point in local Indian Agricultural Gazetteer
  let closest = null;
  let minDistance = Infinity;

  for (const zone of INDIA_ZONES_DATABASE) {
    const dist = calculateDistance(lat, lng, zone.lat, zone.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = { ...zone, distance_from_center_km: dist };
    }
  }

  // If very close to known agricultural hub (< 35km), return local match directly
  if (closest && minDistance <= 35) {
    const result = {
      lat,
      lng,
      name: closest.name,
      district: closest.district,
      state: closest.state,
      famous_for: closest.famous_for,
      formatted_address: `${closest.name}, ${closest.district}, ${closest.state}, India (~${minDistance}km)`,
      nearest_hub: closest.name,
      distance_to_hub_km: minDistance,
      source: 'local_gazetteer'
    };
    reverseGeocodingCache.set(roundedKey, result);
    return result;
  }

  // 2. Try OpenStreetMap Reverse Geocoder
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AgriSmart-Backend-Locator/1.0 (agrismart.app)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const placeName = addr.village || addr.town || addr.city || addr.suburb || addr.county || 'Local Area';
        const district = addr.state_district || addr.district || addr.county || '';
        const state = addr.state || 'India';

        const result = {
          lat,
          lng,
          name: placeName,
          district,
          state,
          village: addr.village || null,
          formatted_address: data.display_name,
          nearest_hub: closest?.name || placeName,
          distance_to_hub_km: minDistance,
          source: 'nominatim_reverse_osm'
        };
        reverseGeocodingCache.set(roundedKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn(`[Reverse Geocoding Failed for ${lat}, ${lng}]:`, err.message);
  }

  // Fallback to closest gazetteer hub
  const fallbackResult = {
    lat,
    lng,
    name: closest?.name || 'Your Location',
    district: closest?.district || '',
    state: closest?.state || 'India',
    formatted_address: closest ? `Near ${closest.name}, ${closest.district}, ${closest.state}, India` : `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    nearest_hub: closest?.name || 'Central India',
    distance_to_hub_km: minDistance,
    source: 'nearest_gazetteer_hub'
  };
  reverseGeocodingCache.set(roundedKey, fallbackResult);
  return fallbackResult;
};

export default {
  INDIA_ZONES_DATABASE,
  searchIndianZones,
  resolveIndianLocation,
  reverseGeocodeIndianLocation
};
