const STORAGE_KEY = 'globetrotter_trips';

export const MASTER_CITIES = [
  { id: '10', name: 'Paris', country: 'France', region: 'Europe', cost_index: 3.5, popularity: 95, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80' },
  { id: '20', name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 4.0, popularity: 98, image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80' },
  { id: '30', name: 'Goa', country: 'India', region: 'Asia', cost_index: 1.5, popularity: 90, image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&auto=format&fit=crop&q=80' },
  { id: '40', name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 3.0, popularity: 92, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=80' },
  { id: '50', name: 'Mumbai', country: 'India', region: 'Asia', cost_index: 2.0, popularity: 85, image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&auto=format&fit=crop&q=80' }
];

export const MASTER_ACTIVITIES = [
  // Paris
  { id: '501', city_id: '10', name: 'Eiffel Tower Climb', description: 'Experience panoramic view of Paris', activity_type: 'Sightseeing', duration_minutes: 120, estimated_cost: 2500, image_url: '' },
  { id: '502', city_id: '10', name: 'Louvre Museum Tour', description: 'See the famous Mona Lisa and masterpieces', activity_type: 'Culture', duration_minutes: 180, estimated_cost: 1800, image_url: '' },
  { id: '503', city_id: '10', name: 'Seine River Cruise', description: 'Enjoy boat cruise along River Seine', activity_type: 'Leisure', duration_minutes: 60, estimated_cost: 1200, image_url: '' },
  
  // Tokyo
  { id: '504', city_id: '20', name: 'Shibuya Crossing Walk', description: 'Cross the busiest intersection in the world', activity_type: 'Sightseeing', duration_minutes: 30, estimated_cost: 0, image_url: '' },
  { id: '505', city_id: '20', name: 'Senso-ji Temple Visit', description: 'Explore ancient Buddhist temple', activity_type: 'Culture', duration_minutes: 90, estimated_cost: 0, image_url: '' },
  
  // Goa
  { id: '506', city_id: '30', name: 'Anjuna Beach Sunset', description: 'Watch the beautiful beach sunset', activity_type: 'Beach', duration_minutes: 120, estimated_cost: 0, image_url: '' },
  { id: '507', city_id: '30', name: 'Fort Aguada Exploration', description: 'Historic Portuguese fort & lighthouse', activity_type: 'Sightseeing', duration_minutes: 90, estimated_cost: 200, image_url: '' },
  
  // Rome
  { id: '508', city_id: '40', name: 'Colosseum Guided Tour', description: 'Learn about gladiators in ancient Rome', activity_type: 'History', duration_minutes: 150, estimated_cost: 3200, image_url: '' }
];

const defaultTrips = [
  {
    id: '1',
    name: 'Summer in Europe',
    start_date: '2026-06-15',
    end_date: '2026-06-25',
    description: 'Exploring France and Italy with friends.',
    budget: 120000,
    cover_image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80',
    isPublic: true,
    stops: [
      { id: '101', city_id: '10', start_date: '2026-06-15', end_date: '2026-06-20', stop_order: 1 },
      { id: '102', city_id: '40', start_date: '2026-06-21', end_date: '2026-06-25', stop_order: 2 }
    ],
    itinerary_items: [
      { id: '801', trip_stop_id: '101', activity_id: '501', date: '2026-06-16', start_time: '10:00', end_time: '12:00', sort_order: 1 },
      { id: '802', trip_stop_id: '101', activity_id: '502', date: '2026-06-17', start_time: '13:00', end_time: '16:00', sort_order: 2 },
      { id: '803', trip_stop_id: '102', activity_id: '508', date: '2026-06-22', start_time: '09:00', end_time: '11:30', sort_order: 1 }
    ],
    expenses: [
      { id: '201', title: 'Flights', amount: 45000, category: 'Transport' },
      { id: '202', title: 'Hotel Paris', amount: 25000, category: 'Lodging' },
      { id: '204', title: 'Louvre Tickets', amount: 3000, category: 'Activities' }
    ]
  },
  {
    id: '2',
    name: 'Goa Weekend Getaway',
    start_date: '2026-09-10',
    end_date: '2026-09-13',
    description: 'Quick beach retreat with cousins.',
    budget: 25000,
    cover_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    isPublic: false,
    stops: [
      { id: '104', city_id: '30', start_date: '2026-09-10', end_date: '2026-09-13', stop_order: 1 }
    ],
    itinerary_items: [
      { id: '804', trip_stop_id: '104', activity_id: '506', date: '2026-09-11', start_time: '17:00', end_time: '19:00', sort_order: 1 }
    ],
    expenses: [
      { id: '206', title: 'Train Tickets', amount: 4000, category: 'Transport' },
      { id: '207', title: 'Beach Resort', amount: 12000, category: 'Lodging' }
    ]
  }
];

export function getTrips() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTrips));
    return defaultTrips;
  }
  
  const parsed = JSON.parse(data);
  let updated = false;
  
  const upgraded = parsed.map(t => {
    let changed = false;
    
    // Set default cover
    if (!t.cover_image) {
      changed = true;
      if (t.id === '1') t.cover_image = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80';
      else if (t.id === '2') t.cover_image = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80';
      else t.cover_image = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80';
    }
    
    // Set default stops structure
    if (t.stops && t.stops.length > 0 && typeof t.stops[0].city_id === 'undefined') {
      changed = true;
      t.stops = t.stops.map((s, idx) => {
        let matchedCity = MASTER_CITIES.find(c => c.name.toLowerCase() === s.city.toLowerCase());
        return {
          id: s.id,
          city_id: matchedCity ? matchedCity.id : '10', // default to Paris
          start_date: s.start_date,
          end_date: s.end_date,
          stop_order: idx + 1
        };
      });
    }

    // Set default itinerary items
    if (typeof t.itinerary_items === 'undefined') {
      changed = true;
      t.itinerary_items = [];
    }

    if (changed) {
      updated = true;
    }
    return t;
  });
  
  if (updated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
    return upgraded;
  }
  
  return parsed;
}

export function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function getTrip(id) {
  const trips = getTrips();
  return trips.find(t => t.id === id);
}

export function addTrip(name, start_date, end_date, description, budget = 50000, cover_image = '') {
  const trips = getTrips();
  const newTrip = {
    id: Date.now().toString(),
    name,
    start_date,
    end_date,
    description,
    budget: Number(budget),
    cover_image: cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80',
    isPublic: false,
    stops: [],
    itinerary_items: [],
    expenses: []
  };
  trips.push(newTrip);
  saveTrips(trips);
  return newTrip;
}

export function updateTrip(id, updatedFields) {
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === id);
  if (index !== -1) {
    trips[index] = { ...trips[index], ...updatedFields };
    saveTrips(trips);
    return trips[index];
  }
  return null;
}

export function deleteTrip(id) {
  const trips = getTrips();
  const filtered = trips.filter(t => t.id !== id);
  saveTrips(filtered);
}
