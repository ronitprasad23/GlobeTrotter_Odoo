const STORAGE_KEY = 'globetrotter_trips';

const defaultTrips = [
  {
    id: '1',
    name: 'Summer in Europe',
    start_date: '2026-06-15',
    end_date: '2026-06-30',
    description: 'Exploring France, Switzerland, and Italy with friends.',
    budget: 120000,
    isPublic: true,
    stops: [
      { id: '101', city: 'Paris', country: 'France', start_date: '2026-06-15', end_date: '2026-06-20', activities: ['Louvre Museum Tour', 'Eiffel Tower at Night'] },
      { id: '102', city: 'Interlaken', country: 'Switzerland', start_date: '2026-06-21', end_date: '2026-06-25', activities: ['Paragliding', 'Jungfraujoch Train Trip'] },
      { id: '103', city: 'Rome', country: 'Italy', start_date: '2026-06-26', end_date: '2026-06-30', activities: ['Colosseum Tour', 'Vatican City Visit'] }
    ],
    expenses: [
      { id: '201', title: 'Flights', amount: 45000, category: 'Transport' },
      { id: '202', title: 'Hotel Paris', amount: 25000, category: 'Lodging' },
      { id: '203', title: 'Swiss Pass', amount: 15000, category: 'Transport' },
      { id: '204', title: 'Louvre Tickets', amount: 3000, category: 'Activities' },
      { id: '205', title: 'Italian Dining', amount: 8000, category: 'Food' }
    ]
  },
  {
    id: '2',
    name: 'Goa Weekend Getaway',
    start_date: '2026-09-10',
    end_date: '2026-09-13',
    description: 'Quick beach retreat with cousins.',
    budget: 25000,
    isPublic: false,
    stops: [
      { id: '104', city: 'Goa', country: 'India', start_date: '2026-09-10', end_date: '2026-09-13', activities: ['Anjuna Beach Sunset', 'Baga Water Sports'] }
    ],
    expenses: [
      { id: '206', title: 'Train Tickets', amount: 4000, category: 'Transport' },
      { id: '207', title: 'Beach Resort', amount: 12000, category: 'Lodging' },
      { id: '208', title: 'Shack Dinners', amount: 3000, category: 'Food' }
    ]
  }
];

export function getTrips() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTrips));
    return defaultTrips;
  }
  return JSON.parse(data);
}

export function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function getTrip(id) {
  const trips = getTrips();
  return trips.find(t => t.id === id);
}

export function addTrip(name, start_date, end_date, description, budget = 50000) {
  const trips = getTrips();
  const newTrip = {
    id: Date.now().toString(),
    name,
    start_date,
    end_date,
    description,
    budget: Number(budget),
    isPublic: false,
    stops: [],
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
