/**
 * googlePlaces.js
 * Real-time Google Maps JavaScript SDK v3 + Places API Service.
 * Features strict timeouts to prevent loading spinners from getting stuck!
 */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let _googleLoadPromise = null;

export function loadGoogleMaps() {
  if (_googleLoadPromise) return _googleLoadPromise;

  _googleLoadPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-sdk';

    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Maps SDK.'));

    document.head.appendChild(script);
  });

  return _googleLoadPromise;
}

export async function geocodeDestination(destination) {
  const google = await loadGoogleMaps();
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destination }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const loc = results[0].geometry.location;
        resolve({
          lat: loc.lat(),
          lng: loc.lng(),
          formattedAddress: results[0].formatted_address,
        });
      } else {
        reject(new Error(`Could not locate "${destination}".`));
      }
    });
  });
}

function resolveCategory(types = []) {
  if (types.includes('lodging') || types.includes('hotel')) return 'Hotel';
  if (types.includes('restaurant') || types.includes('food') || types.includes('cafe')) return 'Restaurant';
  if (types.includes('hospital') || types.includes('health') || types.includes('doctor')) return 'Hospital';
  if (types.includes('atm') || types.includes('bank')) return 'ATM';
  return 'Attraction';
}

function getServiceDiv() {
  let div = document.getElementById('google-places-service-div');
  if (!div) {
    div = document.createElement('div');
    div.id = 'google-places-service-div';
    div.style.display = 'none';
    document.body.appendChild(div);
  }
  return div;
}

/**
 * Performs a text / nearby search with a strict 2-second timeout guard.
 */
async function searchPlacesForQuery(google, location, destination, categoryLabel, googleType, queryKeyword) {
  return new Promise((resolve) => {
    let resolved = false;

    // Strict 2-second timeout guard
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve([]);
      }
    }, 2000);

    try {
      const service = new google.maps.places.PlacesService(getServiceDiv());

      service.nearbySearch({ location, radius: 12000, type: googleType }, (results, status) => {
        if (resolved) return;

        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          resolved = true;
          clearTimeout(timer);
          resolve(results.slice(0, 8).map((p) => formatPlace(p, categoryLabel)));
        } else {
          service.textSearch({
            location,
            radius: 15000,
            query: `${queryKeyword} in ${destination}`,
          }, (txtResults, txtStatus) => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);

            if (txtStatus === google.maps.places.PlacesServiceStatus.OK && txtResults && txtResults.length > 0) {
              resolve(txtResults.slice(0, 8).map((p) => formatPlace(p, categoryLabel)));
            } else {
              resolve([]);
            }
          });
        }
      });
    } catch {
      clearTimeout(timer);
      if (!resolved) {
        resolved = true;
        resolve([]);
      }
    }
  });
}

function formatPlace(p, categoryLabel) {
  const cat = categoryLabel || resolveCategory(p.types || []);
  let img = null;

  if (p.photos && p.photos.length > 0) {
    try {
      img = p.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
    } catch {
      img = null;
    }
  }

  return {
    id: p.place_id || 'place_' + Math.random().toString(36).substr(2, 9),
    placeId: p.place_id,
    name: p.name,
    category: cat,
    address: p.vicinity || p.formatted_address || 'Central Area',
    latitude: p.geometry?.location ? p.geometry.location.lat() : 0,
    longitude: p.geometry?.location ? p.geometry.location.lng() : 0,
    rating: p.rating ? Number(p.rating.toFixed(1)) : 4.5,
    userRatingsTotal: p.user_ratings_total || 120,
    priceLevel: p.price_level != null ? ['Free', '₹', '₹₹', '₹₹₹', '₹₹₹₹'][p.price_level] ?? '₹₹' : '₹₹',
    imageUrl: img,
    bookingLink: cat === 'Hotel' ? `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(p.name)}` : null,
    isEmergencyFacility: cat === 'Hospital',
    openNow: p.opening_hours ? p.opening_hours.open_now : null,
  };
}

export async function fetchNearbyPlaces(destination, categoryFilter = 'All') {
  if (!destination || !destination.trim()) return [];

  try {
    const google = await loadGoogleMaps();
    const locationInfo = await geocodeDestination(destination);
    const latLng = new google.maps.LatLng(locationInfo.lat, locationInfo.lng);

    const categories = [
      { label: 'Attraction', type: 'tourist_attraction', keyword: 'tourist attractions' },
      { label: 'Hotel',      type: 'lodging',            keyword: 'hotels' },
      { label: 'Restaurant', type: 'restaurant',         keyword: 'restaurants' },
      { label: 'Hospital',   type: 'hospital',           keyword: 'hospitals' },
      { label: 'ATM',        type: 'atm',                keyword: 'ATMs' },
    ];

    const targetCategories = categoryFilter === 'All'
      ? categories
      : categories.filter(c => c.label === categoryFilter);

    const results = await Promise.all(
      targetCategories.map(cat => searchPlacesForQuery(google, latLng, destination, cat.label, cat.type, cat.keyword))
    );

    return results.flat();
  } catch {
    return [];
  }
}
