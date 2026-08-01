// CLI Database Inspector for SmartTrip
const http = require('http');

console.log('\n==================================================');
console.log('   SmartTrip MongoDB Database Live Inspector');
console.log('==================================================\n');

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8080${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function inspectDb() {
  try {
    const trips = await fetchJson('/api/v1/trips/all');
    console.log(`📦 SAVED TRIPS COLLECTION (Total Documents: ${trips.length}):\n`);

    if (trips.length === 0) {
      console.log('   (No trips currently saved in database)');
    } else {
      trips.forEach((t, i) => {
        console.log(`--- [Trip #${i + 1}] ID: ${t.id} ---`);
        console.log(`📍 Destination : ${t.destination}`);
        console.log(`👤 User ID     : ${t.userId}`);
        console.log(`🗓️  Duration    : ${t.durationDays} Days (${t.numberOfTravelers || 1} Travelers)`);
        console.log(`💰 Est. Cost   : ₹${t.estimatedCost ? t.estimatedCost.toLocaleString('en-IN') : 0} INR`);
        console.log(`📌 Places (${t.selectedPlaces ? t.selectedPlaces.length : 0}):`);
        if (t.selectedPlaces && t.selectedPlaces.length > 0) {
          t.selectedPlaces.forEach(p => {
            console.log(`   - ${p.name} [${p.category}] (${p.priceLevel || 'N/A'})`);
          });
        }
        console.log('');
      });
    }

    const places = await fetchJson('/api/v1/places/nearby?destination=Jaipur');
    console.log(`\n==================================================`);
    console.log(`🏛️  JAIPUR PLACES COLLECTION (Sample Documents: ${places.length}):\n`);
    places.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.category}) - ${p.rating}★ | ${p.imageUrl.substring(0, 45)}...`);
    });
    console.log('\n==================================================\n');

  } catch (err) {
    console.error('❌ Unable to connect to Spring Boot MongoDB server on http://localhost:8080.');
    console.error('   Please verify that backend server is running (`.\\mvnw.cmd spring-boot:run`).\n');
  }
}

inspectDb();
