const colombo = [6.9271, 79.8612];
      const map = L.map('map', {
        center: colombo,
        zoom: 13,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Custom icons
      const greenIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [16,16], iconAnchor: [8,8], className: ''
      });
      const redIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#f87171;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        iconSize: [16,16], iconAnchor: [8,8], className: ''
      });
      const driverIcon = L.divIcon({
        html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚕</div>`,
        iconSize: [28,28], iconAnchor: [14,14], className: ''
      });

      let pickupMarker = null, destMarker = null, routeLine = null;
      let pickupCoords = null, destCoords = null;
      let clickMode = 'dest'; // next click sets destination

      // ── City markers for all Sri Lanka cities (no visible dots — used only for search suggestions) ──
      const cityIcon = L.divIcon({
        html: `<div style="width:0px;height:0px;"></div>`,
        iconSize: [0,0], iconAnchor: [0,0], className: ''
      });

      const allCities = [
        // Western Province
        { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
        { name: 'Nugegoda', lat: 6.8721, lng: 79.8869 },
        { name: 'Dehiwala', lat: 6.8517, lng: 79.8651 },
        { name: 'Mount Lavinia', lat: 6.8394, lng: 79.8666 },
        { name: 'Moratuwa', lat: 6.7930, lng: 79.8810 },
        { name: 'Sri Jayawardenepura Kotte', lat: 6.8845, lng: 79.8994 },
        { name: 'Rajagiriya', lat: 6.9093, lng: 79.8914 },
        { name: 'Malabe', lat: 6.9106, lng: 79.9628 },
        { name: 'Battaramulla', lat: 6.8927, lng: 79.9168 },
        { name: 'Maharagama', lat: 6.8470, lng: 79.9261 },
        { name: 'Kottawa', lat: 6.8292, lng: 79.9701 },
        { name: 'Piliyandala', lat: 6.8016, lng: 79.9244 },
        { name: 'Homagama', lat: 6.8439, lng: 80.0019 },
        { name: 'Kaduwela', lat: 6.9395, lng: 79.9897 },
        { name: 'Kolonnawa', lat: 6.9219, lng: 79.9261 },
        { name: 'Kelaniya', lat: 7.0024, lng: 79.9205 },
        { name: 'Wattala', lat: 6.9878, lng: 79.8901 },
        { name: 'Hendala', lat: 6.9851, lng: 79.8934 },
        { name: 'Negombo', lat: 7.2083, lng: 79.8358 },
        { name: 'Katunayake', lat: 7.1688, lng: 79.8849 },
        { name: 'Ja-Ela', lat: 7.0740, lng: 79.8917 },
        { name: 'Kandana', lat: 7.0438, lng: 79.8992 },
        { name: 'Gampaha', lat: 7.0872, lng: 79.9992 },
        { name: 'Minuwangoda', lat: 7.1701, lng: 79.9519 },
        { name: 'Veyangoda', lat: 7.1497, lng: 80.1119 },
        { name: 'Nittambuwa', lat: 7.1481, lng: 80.1897 },
        { name: 'Divulapitiya', lat: 7.2217, lng: 80.0686 },
        { name: 'Mirigama', lat: 7.2438, lng: 80.1154 },
        { name: 'Panadura', lat: 6.7136, lng: 79.9021 },
        { name: 'Wadduwa', lat: 6.6558, lng: 79.9296 },
        { name: 'Horana', lat: 6.7160, lng: 80.0620 },
        { name: 'Bandaragama', lat: 6.7149, lng: 80.0022 },
        { name: 'Kalutara', lat: 6.5854, lng: 79.9607 },
        { name: 'Beruwala', lat: 6.4778, lng: 79.9833 },
        { name: 'Aluthgama', lat: 6.4344, lng: 79.9917 },
        { name: 'Matugama', lat: 6.5358, lng: 80.1130 },
        // Central Province
        { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
        { name: 'Peradeniya', lat: 7.2607, lng: 80.5956 },
        { name: 'Katugastota', lat: 7.3303, lng: 80.6219 },
        { name: 'Gampola', lat: 7.1644, lng: 80.5711 },
        { name: 'Nawalapitiya', lat: 7.0553, lng: 80.5344 },
        { name: 'Hatton', lat: 6.8908, lng: 80.5953 },
        { name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891 },
        { name: 'Matale', lat: 7.4675, lng: 80.6234 },
        { name: 'Dambulla', lat: 7.8731, lng: 80.6517 },
        { name: 'Sigiriya', lat: 7.9570, lng: 80.7600 },
        { name: 'Haputale', lat: 6.7675, lng: 80.9578 },
        { name: 'Bandarawela', lat: 6.8319, lng: 80.9908 },
        { name: 'Ella', lat: 6.8667, lng: 81.0467 },
        { name: 'Badulla', lat: 6.9934, lng: 81.0550 },
        { name: 'Mahiyangana', lat: 7.3244, lng: 81.0006 },
        { name: 'Welimada', lat: 6.9000, lng: 80.9167 },
        { name: 'Rikillagaskada', lat: 7.1700, lng: 80.6567 },
        { name: 'Kadugannawa', lat: 7.2544, lng: 80.5283 },
        { name: 'Wattegama', lat: 7.3522, lng: 80.7297 },
        { name: 'Akurana', lat: 7.3600, lng: 80.6342 },
        { name: 'Pilimathalawa', lat: 7.2678, lng: 80.5631 },
        // Southern Province
        { name: 'Galle', lat: 6.0535, lng: 80.2210 },
        { name: 'Unawatuna', lat: 6.0100, lng: 80.2492 },
        { name: 'Hikkaduwa', lat: 6.1395, lng: 80.1056 },
        { name: 'Ambalangoda', lat: 6.2356, lng: 80.0556 },
        { name: 'Bentota', lat: 6.4194, lng: 79.9961 },
        { name: 'Matara', lat: 5.9449, lng: 80.5353 },
        { name: 'Weligama', lat: 5.9742, lng: 80.4289 },
        { name: 'Mirissa', lat: 5.9472, lng: 80.4694 },
        { name: 'Tangalle', lat: 6.0244, lng: 80.7956 },
        { name: 'Hambantota', lat: 6.1249, lng: 81.1186 },
        { name: 'Tissamaharama', lat: 6.2858, lng: 81.2933 },
        { name: 'Kataragama', lat: 6.4142, lng: 81.3356 },
        { name: 'Deniyaya', lat: 6.3450, lng: 80.5733 },
        { name: 'Akuressa', lat: 6.1144, lng: 80.5058 },
        { name: 'Karapitiya', lat: 6.0472, lng: 80.2408 },
        { name: 'Baddegama', lat: 6.1878, lng: 80.2092 },
        { name: 'Elpitiya', lat: 6.2917, lng: 80.1653 },
        { name: 'Beliatta', lat: 6.0503, lng: 80.7189 },
        { name: 'Dickwella', lat: 5.9700, lng: 80.6906 },
        { name: 'Devinuwara', lat: 5.9281, lng: 80.5597 },
        // Northern Province
        { name: 'Jaffna', lat: 9.6615, lng: 80.0255 },
        { name: 'Nallur', lat: 9.6781, lng: 80.0186 },
        { name: 'Point Pedro', lat: 9.8194, lng: 80.2347 },
        { name: 'Chavakachcheri', lat: 9.6553, lng: 80.1608 },
        { name: 'Vavuniya', lat: 8.7514, lng: 80.4997 },
        { name: 'Mannar', lat: 8.9797, lng: 79.9044 },
        { name: 'Kilinochchi', lat: 9.3803, lng: 80.4044 },
        { name: 'Mullaitivu', lat: 9.2675, lng: 80.8131 },
        { name: 'Paranthan', lat: 9.4475, lng: 80.4203 },
        { name: 'Kayts', lat: 9.7003, lng: 79.8925 },
        { name: 'Delft', lat: 9.6833, lng: 79.6833 },
        { name: 'Karainagar', lat: 9.7500, lng: 79.9167 },
        { name: 'Velanai', lat: 9.7167, lng: 79.9000 },
        { name: 'Pallai', lat: 9.5131, lng: 80.3794 },
        { name: 'Elephant Pass', lat: 9.4656, lng: 80.3686 },
        { name: 'Pooneryn', lat: 9.2167, lng: 80.2333 },
        // Eastern Province
        { name: 'Trincomalee', lat: 8.5874, lng: 81.2152 },
        { name: 'Batticaloa', lat: 7.7310, lng: 81.6747 },
        { name: 'Ampara', lat: 7.2997, lng: 81.6747 },
        { name: 'Kalmunai', lat: 7.4153, lng: 81.8194 },
        { name: 'Akkaraipattu', lat: 7.2219, lng: 81.8439 },
        { name: 'Pottuvil', lat: 6.8736, lng: 81.8339 },
        { name: 'Arugam Bay', lat: 6.8403, lng: 81.8342 },
        { name: 'Kantale', lat: 8.3883, lng: 81.0206 },
        { name: 'Valaichchenai', lat: 7.9228, lng: 81.5461 },
        { name: 'Eravur', lat: 7.8178, lng: 81.6000 },
        { name: 'Kattankudy', lat: 7.6681, lng: 81.6944 },
        { name: 'Muttur', lat: 8.4667, lng: 81.2333 },
        { name: 'Oddamavadi', lat: 7.9572, lng: 81.5975 },
        { name: 'Chenkaladi', lat: 7.7894, lng: 81.6275 },
        { name: 'Paddiruppu', lat: 7.5775, lng: 81.7453 },
        { name: 'Sammanthurai', lat: 7.3667, lng: 81.8333 },
        { name: 'Nintavur', lat: 7.2667, lng: 81.8333 },
        // North Western Province
        { name: 'Kurunegala', lat: 7.4863, lng: 80.3647 },
        { name: 'Puttalam', lat: 8.0308, lng: 79.8283 },
        { name: 'Chilaw', lat: 7.5769, lng: 79.7958 },
        { name: 'Kuliyapitiya', lat: 7.4692, lng: 80.0419 },
        { name: 'Narammala', lat: 7.4022, lng: 80.2269 },
        { name: 'Maho', lat: 7.8922, lng: 80.3206 },
        { name: 'Wariyapola', lat: 7.5986, lng: 80.2664 },
        { name: 'Nikaweratiya', lat: 7.7397, lng: 80.1183 },
        { name: 'Marawila', lat: 7.5175, lng: 79.8656 },
        { name: 'Wennappuwa', lat: 7.3667, lng: 79.8500 },
        { name: 'Alawwa', lat: 7.4122, lng: 80.2364 },
        { name: 'Pannala', lat: 7.4058, lng: 80.1253 },
        { name: 'Bingiriya', lat: 7.6286, lng: 80.0736 },
        { name: 'Dankotuwa', lat: 7.3550, lng: 79.9497 },
        { name: 'Nattandiya', lat: 7.4167, lng: 79.8667 },
        { name: 'Mundel', lat: 8.0583, lng: 79.9483 },
        { name: 'Anamaduwa', lat: 8.0208, lng: 80.0242 },
        { name: 'Norochcholai', lat: 8.0333, lng: 79.8333 },
        // North Central Province
        { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
        { name: 'Polonnaruwa', lat: 7.9400, lng: 81.0000 },
        { name: 'Mihintale', lat: 8.3503, lng: 80.5100 },
        { name: 'Kekirawa', lat: 8.0292, lng: 80.5906 },
        { name: 'Medirigiriya', lat: 7.9989, lng: 81.0761 },
        { name: 'Habarana', lat: 8.0531, lng: 80.7486 },
        { name: 'Tambuttegama', lat: 8.5300, lng: 80.3697 },
        { name: 'Nochchiyagama', lat: 8.2500, lng: 80.3167 },
        { name: 'Kahatagasdigiliya', lat: 8.5472, lng: 80.6136 },
        { name: 'Medawachchiya', lat: 8.5422, lng: 80.5053 },
        { name: 'Padaviya', lat: 8.8439, lng: 80.7219 },
        { name: 'Horowpathana', lat: 8.8722, lng: 80.8678 },
        // Uva Province
        { name: 'Monaragala', lat: 6.8722, lng: 81.3497 },
        { name: 'Bibile', lat: 7.1619, lng: 81.2153 },
        { name: 'Wellawaya', lat: 6.7344, lng: 81.1000 },
        { name: 'Buttala', lat: 6.7369, lng: 81.2372 },
        { name: 'Siyambalanduwa', lat: 6.8833, lng: 81.5667 },
        { name: 'Moneragala', lat: 6.8722, lng: 81.3497 },
        { name: 'Okkampitiya', lat: 6.9897, lng: 81.3231 },
        // Sabaragamuwa Province
        { name: 'Ratnapura', lat: 6.6828, lng: 80.4017 },
        { name: 'Embilipitiya', lat: 6.3422, lng: 80.8450 },
        { name: 'Kegalle', lat: 7.2519, lng: 80.3464 },
        { name: 'Balangoda', lat: 6.6489, lng: 80.6936 },
        { name: 'Avissawella', lat: 6.9422, lng: 80.2131 },
        { name: 'Eheliyagoda', lat: 6.8403, lng: 80.2383 },
        { name: 'Ruwanwella', lat: 7.0492, lng: 80.2553 },
        { name: 'Mawanella', lat: 7.2533, lng: 80.4528 },
        { name: 'Warakapola', lat: 7.2578, lng: 80.2803 },
        { name: 'Dehiowita', lat: 6.9819, lng: 80.3236 },
        { name: 'Kuruwita', lat: 6.7597, lng: 80.3681 },
        { name: 'Pelmadulla', lat: 6.6475, lng: 80.5153 },
        { name: 'Rakwana', lat: 6.4500, lng: 80.6333 },
        { name: 'Godakawela', lat: 6.5381, lng: 80.7033 },
        { name: 'Nivitigala', lat: 6.5292, lng: 80.5253 },
        { name: 'Palmadulla', lat: 6.6547, lng: 80.5156 },
      ];

      // Add city dot markers to the map
      const cityMarkers = L.layerGroup();
      allCities.forEach(city => {
        const marker = L.marker([city.lat, city.lng], { icon: cityIcon })
          .bindPopup(`
            <div style="text-align:center;padding:4px 6px;">
              <b style="font-size:13px">${city.name}</b><br>
              <button onclick="window.setPickupFromMap(${city.lat}, ${city.lng}, '${city.name.replace(/'/g, "\\'")}')"
                style="margin:4px 2px 0;padding:4px 10px;background:#22c55e;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600">
                📍 Set Pickup
              </button>
              <button onclick="window.setDestFromMap(${city.lat}, ${city.lng}, '${city.name.replace(/'/g, "\\'")}')"
                style="margin:4px 2px 0;padding:4px 10px;background:#f87171;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600">
                🏁 Set Destination
              </button>
            </div>
          `, { maxWidth: 200 });
        cityMarkers.addLayer(marker);
      });
      // cityMarkers not added to map — dots removed as requested

      // Expose helpers so popup buttons work
      window.setPickupFromMap = (lat, lng, name) => { map.closePopup(); setPickupCoords(lat, lng, name); };
      window.setDestFromMap   = (lat, lng, name) => { map.closePopup(); setDestCoords(lat, lng, name); };

      // Fake nearby drivers
      const fakeDrivers = [
        { lat: 6.935, lng: 79.860 },
        { lat: 6.921, lng: 79.855 },
        { lat: 6.918, lng: 79.870 },
        { lat: 6.930, lng: 79.875 },
        { lat: 6.912, lng: 79.848 },
        { lat: 6.940, lng: 79.858 }
      ];
      fakeDrivers.forEach(d => L.marker([d.lat, d.lng], { icon: driverIcon }).addTo(map).bindPopup('GoRido Driver · Available'));

      // Start map centred on Sri Lanka, no default pickup
      map.setView([7.8731, 80.7718], 8);

      // Reverse-geocode a lat/lng to a human place name via Nominatim
      async function reverseGeocode(lat, lng) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            // Return a short readable label: town/city + state/district
            const a = data.address || {};
            const city = a.city || a.town || a.village || a.hamlet || a.county || '';
            const district = a.state_district || a.state || '';
            return city && district ? `${city}, ${district}` : data.display_name.split(',').slice(0,2).join(',').trim();
          }
        } catch(e) {}
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      // Map click handler — reverse geocode to real place name
      map.on('click', async function(e) {
        const { lat, lng } = e.latlng;
        const label = await reverseGeocode(lat, lng);
        if (clickMode === 'pickup') {
          setPickupCoords(lat, lng, label);
          clickMode = 'dest';
        } else {
          setDestCoords(lat, lng, label);
        }
      });

      function setPickupCoords(lat, lng, label) {
        pickupCoords = [lat, lng];
        document.getElementById('pickup-input').value = label;
        if (pickupMarker) map.removeLayer(pickupMarker);
        pickupMarker = L.marker([lat, lng], { icon: greenIcon })
          .addTo(map)
          .bindPopup(`<b>Pickup:</b> ${label}`);
        // Auto-pan map to pickup location
        if (!destCoords) {
          map.flyTo([lat, lng], 15, { animate: true, duration: 0.8 });
        }
        drawRoute();
      }

      function setDestCoords(lat, lng, label) {
        destCoords = [lat, lng];
        document.getElementById('dest-input').value = label;
        if (destMarker) map.removeLayer(destMarker);
        destMarker = L.marker([lat, lng], { icon: redIcon })
          .addTo(map)
          .bindPopup(`<b>Destination:</b> ${label}`)
          .openPopup();
        // Auto-pan map to destination if no pickup yet, else fit both
        if (!pickupCoords) {
          map.flyTo([lat, lng], 15, { animate: true, duration: 0.8 });
        }
        drawRoute();
        updateStep(2);
      }

      function drawRoute() {
        if (!pickupCoords || !destCoords) return;
        if (routeLine) map.removeLayer(routeLine);

        // Draw a curved-ish route line
        const mid1 = [(pickupCoords[0] + destCoords[0]) / 2 + 0.005, (pickupCoords[1] + destCoords[1]) / 2 - 0.005];
        routeLine = L.polyline([pickupCoords, mid1, destCoords], {
          color: '#facc15',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 6'
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        calcEstimate();
      }

      function calcEstimate() {
        if (!pickupCoords || !destCoords) return;
        const R = 6371;
        const dLat = (destCoords[0] - pickupCoords[0]) * Math.PI / 180;
        const dLon = (destCoords[1] - pickupCoords[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2)**2 + Math.cos(pickupCoords[0]*Math.PI/180) * Math.cos(destCoords[0]*Math.PI/180) * Math.sin(dLon/2)**2;
        const distKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
        const durationMin = Math.round(distKm * 3.5);
        const fare = Math.round(350 + distKm * 45);

        document.getElementById('est-distance').textContent = `${distKm} km`;
        document.getElementById('est-duration').textContent = `${durationMin} min`;
        document.getElementById('est-base').textContent = `₨ 350`;
        document.getElementById('est-total').textContent = `₨ ${fare.toLocaleString()}`;

        const card = document.getElementById('price-card');
        card.classList.remove('hidden');
        card.classList.add('slide-up');

        document.getElementById('modal-fare').textContent = `₨ ${fare.toLocaleString()}`;
      }

      // Saved places
      function setDestination(name, label, lat, lng) {
        setDestCoords(lat, lng, label);
      }

      // Location autocomplete — comprehensive Sri Lanka cities & towns
      const places = [
        // ── Western Province ──
        { name: 'Colombo Fort', lat: 6.9344, lng: 79.8428 },
        { name: 'Colombo 3 (Kollupitiya)', lat: 6.9108, lng: 79.8477 },
        { name: 'Colombo 4 (Bambalapitiya)', lat: 6.8981, lng: 79.8557 },
        { name: 'Colombo 5 (Havelock Town)', lat: 6.8897, lng: 79.8656 },
        { name: 'Colombo 6 (Wellawatte)', lat: 6.8788, lng: 79.8630 },
        { name: 'Colombo 7 (Cinnamon Gardens)', lat: 6.9083, lng: 79.8632 },
        { name: 'Colombo 8 (Borella)', lat: 6.9169, lng: 79.8769 },
        { name: 'Colombo 10 (Maradana)', lat: 6.9258, lng: 79.8672 },
        { name: 'Colombo 15 (Modara)', lat: 6.9594, lng: 79.8617 },
        { name: 'Pettah', lat: 6.9349, lng: 79.8508 },
        { name: 'Galle Face Green', lat: 6.9175, lng: 79.8463 },
        { name: 'Nugegoda', lat: 6.8721, lng: 79.8869 },
        { name: 'Dehiwala', lat: 6.8517, lng: 79.8651 },
        { name: 'Mount Lavinia', lat: 6.8394, lng: 79.8666 },
        { name: 'Rajagiriya', lat: 6.9093, lng: 79.8914 },
        { name: 'Malabe', lat: 6.9106, lng: 79.9628 },
        { name: 'Battaramulla', lat: 6.8927, lng: 79.9168 },
        { name: 'Kelaniya', lat: 7.0024, lng: 79.9205 },
        { name: 'Maharagama', lat: 6.8470, lng: 79.9261 },
        { name: 'Kottawa', lat: 6.8292, lng: 79.9701 },
        { name: 'Bandaragama', lat: 6.7149, lng: 80.0022 },
        { name: 'Panadura', lat: 6.7136, lng: 79.9021 },
        { name: 'Homagama', lat: 6.8439, lng: 80.0019 },
        { name: 'Moratuwa', lat: 6.7930, lng: 79.8810 },
        { name: 'Piliyandala', lat: 6.8016, lng: 79.9244 },
        { name: 'Sri Jayawardenepura Kotte', lat: 6.8845, lng: 79.8994 },
        { name: 'Kaduwela', lat: 6.9395, lng: 79.9897 },
        { name: 'Kolonnawa', lat: 6.9219, lng: 79.9261 },
        { name: 'Hendala', lat: 6.9851, lng: 79.8934 },
        { name: 'Wattala', lat: 6.9878, lng: 79.8901 },
        { name: 'Negombo', lat: 7.2083, lng: 79.8358 },
        { name: 'Katunayake', lat: 7.1688, lng: 79.8849 },
        { name: 'Bandaranaike International Airport', lat: 7.1803, lng: 79.8847 },
        { name: 'Ja-Ela', lat: 7.0740, lng: 79.8917 },
        { name: 'Kandana', lat: 7.0438, lng: 79.8992 },
        { name: 'Gampaha', lat: 7.0872, lng: 79.9992 },
        { name: 'Minuwangoda', lat: 7.1701, lng: 79.9519 },
        { name: 'Veyangoda', lat: 7.1497, lng: 80.1119 },
        { name: 'Nittambuwa', lat: 7.1481, lng: 80.1897 },
        { name: 'Divulapitiya', lat: 7.2217, lng: 80.0686 },
        { name: 'Mirigama', lat: 7.2438, lng: 80.1154 },
        { name: 'Horana', lat: 6.7160, lng: 80.0620 },
        { name: 'Kalutara', lat: 6.5854, lng: 79.9607 },
        { name: 'Beruwala', lat: 6.4778, lng: 79.9833 },
        { name: 'Aluthgama', lat: 6.4344, lng: 79.9917 },
        { name: 'Wadduwa', lat: 6.6558, lng: 79.9296 },
        { name: 'Matugama', lat: 6.5358, lng: 80.1130 },
        // ── Central Province ──
        { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
        { name: 'Peradeniya', lat: 7.2607, lng: 80.5956 },
        { name: 'Katugastota', lat: 7.3303, lng: 80.6219 },
        { name: 'Gampola', lat: 7.1644, lng: 80.5711 },
        { name: 'Nawalapitiya', lat: 7.0553, lng: 80.5344 },
        { name: 'Hatton', lat: 6.8908, lng: 80.5953 },
        { name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891 },
        { name: 'Matale', lat: 7.4675, lng: 80.6234 },
        { name: 'Dambulla', lat: 7.8731, lng: 80.6517 },
        { name: 'Sigiriya', lat: 7.9570, lng: 80.7600 },
        { name: 'Haputale', lat: 6.7675, lng: 80.9578 },
        { name: 'Bandarawela', lat: 6.8319, lng: 80.9908 },
        { name: 'Ella', lat: 6.8667, lng: 81.0467 },
        { name: 'Badulla', lat: 6.9934, lng: 81.0550 },
        { name: 'Mahiyangana', lat: 7.3244, lng: 81.0006 },
        { name: 'Welimada', lat: 6.9000, lng: 80.9167 },
        // ── Southern Province ──
        { name: 'Galle', lat: 6.0535, lng: 80.2210 },
        { name: 'Unawatuna', lat: 6.0100, lng: 80.2492 },
        { name: 'Hikkaduwa', lat: 6.1395, lng: 80.1056 },
        { name: 'Ambalangoda', lat: 6.2356, lng: 80.0556 },
        { name: 'Bentota', lat: 6.4194, lng: 79.9961 },
        { name: 'Matara', lat: 5.9449, lng: 80.5353 },
        { name: 'Weligama', lat: 5.9742, lng: 80.4289 },
        { name: 'Mirissa', lat: 5.9472, lng: 80.4694 },
        { name: 'Tangalle', lat: 6.0244, lng: 80.7956 },
        { name: 'Hambantota', lat: 6.1249, lng: 81.1186 },
        { name: 'Tissamaharama', lat: 6.2858, lng: 81.2933 },
        { name: 'Kataragama', lat: 6.4142, lng: 81.3356 },
        { name: 'Deniyaya', lat: 6.3450, lng: 80.5733 },
        { name: 'Akuressa', lat: 6.1144, lng: 80.5058 },
        // ── Northern Province ──
        { name: 'Jaffna', lat: 9.6615, lng: 80.0255 },
        { name: 'Nallur', lat: 9.6781, lng: 80.0186 },
        { name: 'Point Pedro', lat: 9.8194, lng: 80.2347 },
        { name: 'Chavakachcheri', lat: 9.6553, lng: 80.1608 },
        { name: 'Vavuniya', lat: 8.7514, lng: 80.4997 },
        { name: 'Mannar', lat: 8.9797, lng: 79.9044 },
        { name: 'Kilinochchi', lat: 9.3803, lng: 80.4044 },
        { name: 'Mullaitivu', lat: 9.2675, lng: 80.8131 },
        { name: 'Paranthan', lat: 9.4475, lng: 80.4203 },
        // ── Eastern Province ──
        { name: 'Trincomalee', lat: 8.5874, lng: 81.2152 },
        { name: 'Batticaloa', lat: 7.7310, lng: 81.6747 },
        { name: 'Ampara', lat: 7.2997, lng: 81.6747 },
        { name: 'Kalmunai', lat: 7.4153, lng: 81.8194 },
        { name: 'Akkaraipattu', lat: 7.2219, lng: 81.8439 },
        { name: 'Pottuvil', lat: 6.8736, lng: 81.8339 },
        { name: 'Arugam Bay', lat: 6.8403, lng: 81.8342 },
        { name: 'Kantale', lat: 8.3883, lng: 81.0206 },
        { name: 'Valaichchenai', lat: 7.9228, lng: 81.5461 },
        { name: 'Eravur', lat: 7.8178, lng: 81.6000 },
        // ── North Western Province ──
        { name: 'Kurunegala', lat: 7.4863, lng: 80.3647 },
        { name: 'Puttalam', lat: 8.0308, lng: 79.8283 },
        { name: 'Chilaw', lat: 7.5769, lng: 79.7958 },
        { name: 'Kuliyapitiya', lat: 7.4692, lng: 80.0419 },
        { name: 'Narammala', lat: 7.4022, lng: 80.2269 },
        { name: 'Maho', lat: 7.8922, lng: 80.3206 },
        { name: 'Wariyapola', lat: 7.5986, lng: 80.2664 },
        { name: 'Nikaweratiya', lat: 7.7397, lng: 80.1183 },
        { name: 'Marawila', lat: 7.5175, lng: 79.8656 },
        { name: 'Wennappuwa', lat: 7.3667, lng: 79.8500 },
        // ── North Central Province ──
        { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
        { name: 'Polonnaruwa', lat: 7.9400, lng: 81.0000 },
        { name: 'Mihintale', lat: 8.3503, lng: 80.5100 },
        { name: 'Kekirawa', lat: 8.0292, lng: 80.5906 },
        { name: 'Medirigiriya', lat: 7.9989, lng: 81.0761 },
        { name: 'Habarana', lat: 8.0531, lng: 80.7486 },
        { name: 'Tambuttegama', lat: 8.5300, lng: 80.3697 },
        // ── Uva Province ──
        { name: 'Monaragala', lat: 6.8722, lng: 81.3497 },
        { name: 'Bibile', lat: 7.1619, lng: 81.2153 },
        { name: 'Wellawaya', lat: 6.7344, lng: 81.1000 },
        { name: 'Medawachchiya', lat: 8.5422, lng: 80.5053 },
        // ── Sabaragamuwa Province ──
        { name: 'Ratnapura', lat: 6.6828, lng: 80.4017 },
        { name: 'Embilipitiya', lat: 6.3422, lng: 80.8450 },
        { name: 'Kegalle', lat: 7.2519, lng: 80.3464 },
        { name: 'Balangoda', lat: 6.6489, lng: 80.6936 },
        { name: 'Avissawella', lat: 6.9422, lng: 80.2131 },
        { name: 'Eheliyagoda', lat: 6.8403, lng: 80.2383 },
        { name: 'Ruwanwella', lat: 7.0492, lng: 80.2553 },
        { name: 'Mawanella', lat: 7.2533, lng: 80.4528 },
        { name: 'Warakapola', lat: 7.2578, lng: 80.2803 },
        // ── Landmarks & key spots ──
        { name: 'Temple of the Tooth Relic', lat: 7.2936, lng: 80.6413 },
        { name: 'Pinnawala Elephant Orphanage', lat: 7.3028, lng: 80.3817 },
        { name: 'Yala National Park', lat: 6.3750, lng: 81.5208 },
        { name: 'Udawalawe National Park', lat: 6.4742, lng: 80.8903 },
        { name: 'Wilpattu National Park', lat: 8.4572, lng: 80.0256 },
        { name: 'Minneriya National Park', lat: 8.0392, lng: 80.8942 },
        { name: 'Adam\'s Peak', lat: 6.8096, lng: 80.4994 },
        { name: 'Horton Plains', lat: 6.8028, lng: 80.8044 },
        { name: 'Colombo Harbour', lat: 6.9481, lng: 79.8428 },
        { name: 'University of Colombo', lat: 6.9022, lng: 79.8607 },
        { name: 'University of Peradeniya', lat: 7.2558, lng: 80.5964 },
        { name: 'Colombo Lotus Tower', lat: 6.9271, lng: 79.8617 },
        { name: 'University of Colombo', lat: 6.9022, lng: 79.8607 }
      ];

      // ── POI Suggestions Database — Sri Lanka Temples, Hospitals, Schools, Universities, Parks, Libraries, Pharmacies ──
      const poiPlaces = [
        // 🛕 TEMPLES
        { name: 'Kelaniya Raja Maha Vihara', type: 'temple', lat: 7.0028, lng: 79.9205 },
        { name: 'Gangaramaya Temple', type: 'temple', lat: 6.9175, lng: 79.8569 },
        { name: 'Isipathanaramaya Temple', type: 'temple', lat: 6.8828, lng: 79.8836 },
        { name: 'Asokaramaya Temple Borella', type: 'temple', lat: 6.9189, lng: 79.8744 },
        { name: 'Kathiresan Kovil Colombo', type: 'temple', lat: 6.9350, lng: 79.8506 },
        { name: 'Sri Muthumariamman Kovil', type: 'temple', lat: 6.9349, lng: 79.8530 },
        { name: 'Temple of the Tooth Relic Kandy', type: 'temple', lat: 7.2936, lng: 80.6413 },
        { name: 'Nallur Kandaswamy Kovil Jaffna', type: 'temple', lat: 9.6788, lng: 80.0178 },
        { name: 'Kataragama Devalaya', type: 'temple', lat: 6.4142, lng: 81.3356 },
        { name: 'Ruwanwelisaya Anuradhapura', type: 'temple', lat: 8.3497, lng: 80.3975 },
        { name: 'Jetavanaramaya Anuradhapura', type: 'temple', lat: 8.3533, lng: 80.4008 },
        { name: 'Mihintale Temple', type: 'temple', lat: 8.3503, lng: 80.5100 },
        { name: 'Bellanwila Raja Maha Vihara', type: 'temple', lat: 6.8425, lng: 79.9042 },
        { name: 'Alutnuwara Devalaya Mawanella', type: 'temple', lat: 7.2533, lng: 80.3942 },
        { name: 'Sri Pada (Adam\'s Peak) Temple', type: 'temple', lat: 6.8096, lng: 80.4994 },
        { name: 'Muthumariamman Temple Matara', type: 'temple', lat: 5.9449, lng: 80.5353 },
        { name: 'Thuparamaya Anuradhapura', type: 'temple', lat: 8.3489, lng: 80.3961 },
        { name: 'Dambulla Cave Temple', type: 'temple', lat: 7.8569, lng: 80.6486 },
        { name: 'Nagadeepa Purana Vihara Jaffna', type: 'temple', lat: 9.6567, lng: 79.7744 },
        { name: 'Koneswaram Temple Trincomalee', type: 'temple', lat: 8.5778, lng: 81.2339 },
        { name: 'Munneswaram Temple Chilaw', type: 'temple', lat: 7.5178, lng: 79.8944 },
        { name: 'Lankatilaka Vihara Kandy', type: 'temple', lat: 7.2742, lng: 80.5739 },
        { name: 'Embekke Devalaya Kandy', type: 'temple', lat: 7.2697, lng: 80.5661 },
        { name: 'Yapahuwa Temple', type: 'temple', lat: 7.8333, lng: 80.3333 },
        { name: 'Sri Maha Bodhi Anuradhapura', type: 'temple', lat: 8.3467, lng: 80.3956 },

        // 🏥 HOSPITALS
        { name: 'Asiri Hospital Colombo', type: 'hospital', lat: 6.8953, lng: 79.8598 },
        { name: 'Nawaloka Hospital Colombo', type: 'hospital', lat: 6.9194, lng: 79.8558 },
        { name: 'National Hospital of Sri Lanka', type: 'hospital', lat: 6.9225, lng: 79.8694 },
        { name: 'Lanka Hospitals Colombo', type: 'hospital', lat: 6.8878, lng: 79.8594 },
        { name: 'Durdans Hospital Colombo', type: 'hospital', lat: 6.9003, lng: 79.8581 },
        { name: 'Ninewells Hospital Colombo', type: 'hospital', lat: 6.8864, lng: 79.8653 },
        { name: 'Hemas Hospital Wattala', type: 'hospital', lat: 6.9878, lng: 79.8901 },
        { name: 'Hemas Hospital Thalawathugoda', type: 'hospital', lat: 6.8786, lng: 79.9394 },
        { name: 'Asiri Central Hospital Colombo', type: 'hospital', lat: 6.9108, lng: 79.8606 },
        { name: 'Colombo South Teaching Hospital', type: 'hospital', lat: 6.8164, lng: 79.8828 },
        { name: 'De Zoysa Maternity Hospital', type: 'hospital', lat: 6.9017, lng: 79.8625 },
        { name: 'Maharagama Cancer Hospital', type: 'hospital', lat: 6.8456, lng: 79.9275 },
        { name: 'Apeksha Hospital Maharagama', type: 'hospital', lat: 6.8450, lng: 79.9297 },
        { name: 'Kandy General Hospital', type: 'hospital', lat: 7.2989, lng: 80.6367 },
        { name: 'Kurunegala Teaching Hospital', type: 'hospital', lat: 7.4875, lng: 80.3669 },
        { name: 'Jaffna Teaching Hospital', type: 'hospital', lat: 9.6678, lng: 80.0219 },
        { name: 'Karapitiya Teaching Hospital Galle', type: 'hospital', lat: 6.0472, lng: 80.2408 },
        { name: 'Matara District General Hospital', type: 'hospital', lat: 5.9497, lng: 80.5403 },
        { name: 'Ratnapura District Hospital', type: 'hospital', lat: 6.6878, lng: 80.4003 },
        { name: 'Anuradhapura Teaching Hospital', type: 'hospital', lat: 8.3153, lng: 80.4031 },
        { name: 'Trincomalee District Hospital', type: 'hospital', lat: 8.5900, lng: 81.2131 },
        { name: 'Batticaloa Teaching Hospital', type: 'hospital', lat: 7.7281, lng: 81.6717 },
        { name: 'Hambantota District Hospital', type: 'hospital', lat: 6.1253, lng: 81.1194 },
        { name: 'Negombo District Hospital', type: 'hospital', lat: 7.2089, lng: 79.8372 },
        { name: 'Homagama District Hospital', type: 'hospital', lat: 6.8439, lng: 80.0019 },
        { name: 'Nuwara Eliya District Hospital', type: 'hospital', lat: 6.9508, lng: 80.7864 },
        { name: 'Badulla District Hospital', type: 'hospital', lat: 6.9944, lng: 81.0556 },
        { name: 'Avissawella District Hospital', type: 'hospital', lat: 6.9422, lng: 80.2131 },
        { name: 'Panadura District Hospital', type: 'hospital', lat: 6.7136, lng: 79.9021 },
        { name: 'Kalutara District Hospital', type: 'hospital', lat: 6.5864, lng: 79.9594 },
        { name: 'Sri Jayewardenepura General Hospital', type: 'hospital', lat: 6.8881, lng: 79.8939 },
        { name: 'Chest Hospital Welisara', type: 'hospital', lat: 7.0003, lng: 79.9014 },

        // 🏫 SCHOOLS
        { name: 'Royal College Colombo', type: 'school', lat: 6.9108, lng: 79.8700 },
        { name: 'S. Thomas\' College Mount Lavinia', type: 'school', lat: 6.8397, lng: 79.8664 },
        { name: 'Visakha Vidyalaya Colombo', type: 'school', lat: 6.9017, lng: 79.8728 },
        { name: 'Ananda College Colombo', type: 'school', lat: 6.9228, lng: 79.8733 },
        { name: 'Nalanda College Colombo', type: 'school', lat: 6.9197, lng: 79.8717 },
        { name: 'Thurstan College Colombo', type: 'school', lat: 6.9181, lng: 79.8644 },
        { name: 'Bishops College Colombo', type: 'school', lat: 6.9019, lng: 79.8600 },
        { name: 'Hindu College Colombo', type: 'school', lat: 6.9292, lng: 79.8597 },
        { name: 'De Mazenod College Kandana', type: 'school', lat: 7.0438, lng: 79.8992 },
        { name: 'Isipathana College Colombo', type: 'school', lat: 6.9019, lng: 79.8806 },
        { name: 'Dharmaraja College Kandy', type: 'school', lat: 7.2961, lng: 80.6392 },
        { name: 'Trinity College Kandy', type: 'school', lat: 7.2942, lng: 80.6372 },
        { name: 'Mahamaya Girls\' College Kandy', type: 'school', lat: 7.2911, lng: 80.6339 },
        { name: 'Richmond College Galle', type: 'school', lat: 6.0564, lng: 80.2181 },
        { name: 'Mahinda College Galle', type: 'school', lat: 6.0581, lng: 80.2200 },
        { name: 'Rahula College Matara', type: 'school', lat: 5.9467, lng: 80.5383 },
        { name: 'Jaffna Hindu College', type: 'school', lat: 9.6644, lng: 80.0239 },
        { name: 'Hartley College Point Pedro', type: 'school', lat: 9.8194, lng: 80.2347 },
        { name: 'Maliyadeva College Kurunegala', type: 'school', lat: 7.4892, lng: 80.3633 },
        { name: 'Zahira College Colombo', type: 'school', lat: 6.9261, lng: 79.8661 },
        { name: 'D.S. Senanayake College Colombo', type: 'school', lat: 6.9206, lng: 79.8831 },
        { name: 'Taxila Central College Horana', type: 'school', lat: 6.7161, lng: 80.0622 },
        { name: 'Bandaranayake College Gampaha', type: 'school', lat: 7.0872, lng: 79.9992 },
        { name: 'Prince of Wales\' College Moratuwa', type: 'school', lat: 6.7930, lng: 79.8810 },
        { name: 'St. Anthony\'s College Kandy', type: 'school', lat: 7.2900, lng: 80.6344 },
        { name: 'Kingswood College Kandy', type: 'school', lat: 7.2956, lng: 80.6428 },

        // 🎓 UNIVERSITIES
        { name: 'University of Colombo', type: 'university', lat: 6.9022, lng: 79.8607 },
        { name: 'University of Peradeniya', type: 'university', lat: 7.2558, lng: 80.5964 },
        { name: 'University of Moratuwa', type: 'university', lat: 6.7964, lng: 79.9008 },
        { name: 'University of Kelaniya', type: 'university', lat: 7.0019, lng: 79.9208 },
        { name: 'University of Sri Jayewardenepura', type: 'university', lat: 6.8717, lng: 79.8950 },
        { name: 'University of Ruhuna Matara', type: 'university', lat: 5.9453, lng: 80.5217 },
        { name: 'University of Jaffna', type: 'university', lat: 9.6703, lng: 80.0167 },
        { name: 'University of Rajarata Anuradhapura', type: 'university', lat: 8.3281, lng: 80.4011 },
        { name: 'University of Sabaragamuwa Belihuloya', type: 'university', lat: 6.7611, lng: 80.7461 },
        { name: 'University of Wayamba Kuliyapitiya', type: 'university', lat: 7.4692, lng: 80.0419 },
        { name: 'Eastern University Batticaloa', type: 'university', lat: 7.7311, lng: 81.6750 },
        { name: 'South Eastern University Oluvil', type: 'university', lat: 7.2122, lng: 81.8708 },
        { name: 'SLIIT Malabe', type: 'university', lat: 6.9147, lng: 79.9731 },
        { name: 'NSBM Green University Homagama', type: 'university', lat: 6.8281, lng: 80.0406 },
        { name: 'IIT Sri Lanka Colombo', type: 'university', lat: 6.9053, lng: 79.8619 },
        { name: 'APIIT Sri Lanka Colombo', type: 'university', lat: 6.8994, lng: 79.8606 },
        { name: 'Colombo International Nautical Engineering College', type: 'university', lat: 6.9600, lng: 79.8517 },
        { name: 'Open University of Sri Lanka Nawala', type: 'university', lat: 6.8897, lng: 79.8983 },
        { name: 'Postgraduate Institute of Medicine Colombo', type: 'university', lat: 6.9100, lng: 79.8708 },
        { name: 'Buddhist and Pali University Homagama', type: 'university', lat: 6.8403, lng: 80.0047 },
        { name: 'Uva Wellassa University Badulla', type: 'university', lat: 6.9808, lng: 81.0742 },
        { name: 'General Sir John Kotelawala Defence University', type: 'university', lat: 6.8244, lng: 80.0239 },
        { name: 'Sri Lanka Institute of Information Technology (SLIIT)', type: 'university', lat: 6.9147, lng: 79.9731 },

        // 🛝 PARKS
        { name: 'Viharamahadevi Park Colombo', type: 'park', lat: 6.9178, lng: 79.8594 },
        { name: 'Diyatha Uyana Park Sri Jayewardenepura', type: 'park', lat: 6.8906, lng: 79.9131 },
        { name: 'Dehiwala Zoological Gardens', type: 'park', lat: 6.8556, lng: 79.8719 },
        { name: 'Peradeniya Royal Botanical Gardens', type: 'park', lat: 7.2689, lng: 80.5944 },
        { name: 'Independence Square Colombo', type: 'park', lat: 6.9061, lng: 79.8661 },
        { name: 'Beira Lake Park Colombo', type: 'park', lat: 6.9175, lng: 79.8575 },
        { name: 'Galle Face Green Colombo', type: 'park', lat: 6.9175, lng: 79.8463 },
        { name: 'Hakgala Botanical Gardens Nuwara Eliya', type: 'park', lat: 6.9192, lng: 80.8339 },
        { name: 'Hikkaduwa Marine National Park', type: 'park', lat: 6.1394, lng: 80.0994 },
        { name: 'Yala National Park', type: 'park', lat: 6.3750, lng: 81.5208 },
        { name: 'Udawalawe National Park', type: 'park', lat: 6.4742, lng: 80.8903 },
        { name: 'Wilpattu National Park', type: 'park', lat: 8.4572, lng: 80.0256 },
        { name: 'Minneriya National Park', type: 'park', lat: 8.0392, lng: 80.8942 },
        { name: 'Pinnawala Elephant Orphanage', type: 'park', lat: 7.3028, lng: 80.3817 },
        { name: 'Horton Plains National Park', type: 'park', lat: 6.8028, lng: 80.8044 },
        { name: 'Bundala National Park', type: 'park', lat: 6.1583, lng: 81.1417 },
        { name: 'Madhu Road Sanctuary', type: 'park', lat: 8.9667, lng: 80.1500 },
        { name: 'Sinharaja Forest Reserve', type: 'park', lat: 6.4167, lng: 80.4833 },
        { name: 'Udawattakele Forest Reserve Kandy', type: 'park', lat: 7.2983, lng: 80.6358 },
        { name: 'Colombo Racecourse Park', type: 'park', lat: 6.9092, lng: 79.8667 },
        { name: 'Town Hall Gardens Colombo', type: 'park', lat: 6.9197, lng: 79.8617 },
        { name: 'Diyasaru Park Colombo', type: 'park', lat: 6.9300, lng: 79.9050 },

        // 📚 LIBRARIES
        { name: 'National Library of Sri Lanka Colombo', type: 'library', lat: 6.9058, lng: 79.8669 },
        { name: 'Colombo Public Library', type: 'library', lat: 6.9192, lng: 79.8583 },
        { name: 'British Council Library Colombo', type: 'library', lat: 6.9003, lng: 79.8567 },
        { name: 'Kandy Municipal Library', type: 'library', lat: 7.2939, lng: 80.6378 },
        { name: 'Jaffna Public Library', type: 'library', lat: 9.6656, lng: 80.0214 },
        { name: 'Galle Municipal Library', type: 'library', lat: 6.0536, lng: 80.2206 },
        { name: 'University of Colombo Library', type: 'library', lat: 6.9028, lng: 79.8611 },
        { name: 'University of Peradeniya Library', type: 'library', lat: 7.2556, lng: 80.5961 },
        { name: 'SLIIT Library Malabe', type: 'library', lat: 6.9150, lng: 79.9733 },
        { name: 'Nugegoda Public Library', type: 'library', lat: 6.8728, lng: 79.8872 },
        { name: 'Matara Municipal Library', type: 'library', lat: 5.9453, lng: 80.5358 },
        { name: 'Kurunegala Public Library', type: 'library', lat: 7.4869, lng: 80.3653 },
        { name: 'Anuradhapura Public Library', type: 'library', lat: 8.3119, lng: 80.4039 },
        { name: 'Negombo Public Library', type: 'library', lat: 7.2089, lng: 79.8383 },
        { name: 'Ratnapura Public Library', type: 'library', lat: 6.6831, lng: 80.4022 },

        // 💊 PHARMACIES
        { name: 'Osu Sala National Pharmacy Colombo', type: 'pharmacy', lat: 6.9228, lng: 79.8706 },
        { name: 'Cargills Pharmacy Colombo 3', type: 'pharmacy', lat: 6.9108, lng: 79.8477 },
        { name: 'Pharmacare Pharmacy Nugegoda', type: 'pharmacy', lat: 6.8728, lng: 79.8869 },
        { name: 'State Pharmaceuticals Borella', type: 'pharmacy', lat: 6.9169, lng: 79.8769 },
        { name: 'Hetath Osu Pharmacy Maharagama', type: 'pharmacy', lat: 6.8470, lng: 79.9261 },
        { name: 'National Pharmacy Kandy', type: 'pharmacy', lat: 7.2942, lng: 80.6367 },
        { name: 'Osu Sala Galle', type: 'pharmacy', lat: 6.0539, lng: 80.2200 },
        { name: 'Damro Pharmacy Matara', type: 'pharmacy', lat: 5.9453, lng: 80.5358 },
        { name: 'MedPharma Pharmacy Negombo', type: 'pharmacy', lat: 7.2086, lng: 79.8358 },
        { name: 'State Pharmaceutical Kurunegala', type: 'pharmacy', lat: 7.4869, lng: 80.3656 },
        { name: 'Hetath Osu Pharmacy Malabe', type: 'pharmacy', lat: 6.9106, lng: 79.9628 },
        { name: 'National Pharmacy Jaffna', type: 'pharmacy', lat: 9.6667, lng: 80.0217 },
        { name: 'Osu Sala Anuradhapura', type: 'pharmacy', lat: 8.3122, lng: 80.4033 },
        { name: 'Pharmacy 1 Battaramulla', type: 'pharmacy', lat: 6.8927, lng: 79.9168 },
        { name: 'Wellcome Pharmacy Wattala', type: 'pharmacy', lat: 6.9878, lng: 79.8901 },
        { name: 'Healix Pharmacy Rajagiriya', type: 'pharmacy', lat: 6.9094, lng: 79.8914 },
        { name: 'Medical Needs Pharmacy Moratuwa', type: 'pharmacy', lat: 6.7933, lng: 79.8811 },
        { name: 'CeyMed Pharmacy Gampaha', type: 'pharmacy', lat: 7.0875, lng: 79.9994 },
      ];

      // Emoji map for POI types
      const poiEmojiMap = {
        temple: '🛕', hospital: '🏥', school: '🏫',
        university: '🎓', park: '🛝', library: '📚', pharmacy: '💊', city: '📍'
      };

      // Combined search pool: POI places + city/landmark places
      const allSearchPlaces = [
        ...poiPlaces,
        ...places.map(p => ({ ...p, type: 'city' }))
      ];

      function getPoiEmoji(type) {
        return poiEmojiMap[type] || '📍';
      }

      function handlePickupInput(val) {
        showSmartSuggestions('pickup', val);
      }
      function handleDestInput(val) {
        showSmartSuggestions('dest', val);
      }

      function showSmartSuggestions(id, val) {
        const box = document.getElementById(`${id}-suggestions`);
        if (!val || val.length < 2) { box.classList.add('hidden'); return; }

        const q = val.toLowerCase();

        // Score each place: exact start = 3pts, word start = 2pts, contains = 1pt
        const scored = allSearchPlaces.map(p => {
          const n = p.name.toLowerCase();
          let score = 0;
          if (n.startsWith(q)) score = 3;
          else if (n.split(/\s+/).some(w => w.startsWith(q))) score = 2;
          else if (n.includes(q)) score = 1;
          return { ...p, score };
        }).filter(p => p.score > 0);

        // Sort by score desc, then alphabetically
        scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

        // Deduplicate by name
        const seen = new Set();
        const unique = scored.filter(p => {
          const k = p.name.toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k); return true;
        });

        if (!unique.length) { box.classList.add('hidden'); return; }

        box.innerHTML = unique.slice(0, 8).map(p => {
          const emoji = getPoiEmoji(p.type);
          const safeName = p.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          return `<div class="suggestion-item" onclick="selectSuggestion('${id}', '${safeName}', ${p.lat}, ${p.lng})">
            <span style="font-size:14px">${emoji}</span>
            <span>${p.name}</span>
          </div>`;
        }).join('');
        box.classList.remove('hidden');
      }

      function selectSuggestion(id, name, lat, lng) {
        document.getElementById(`${id}-suggestions`).classList.add('hidden');
        if (id === 'pickup') setPickupCoords(lat, lng, name);
        else setDestCoords(lat, lng, name);
      }

      function showSuggestions(id) { /* focus handler placeholder */ }

      // Close suggestions on outside click
      document.addEventListener('click', (e) => {
        ['pickup-suggestions','dest-suggestions'].forEach(id => {
          const el = document.getElementById(id);
          if (!el.contains(e.target) && e.target.id !== `${id.split('-')[0]}-input`) {
            el.classList.add('hidden');
          }
        });
      });

      // Locate Me
      function locateMe() {
        if (!navigator.geolocation) return alert('Geolocation not supported.');
        navigator.geolocation.getCurrentPosition(
          pos => setPickupCoords(pos.coords.latitude, pos.coords.longitude, 'My Location'),
          () => alert('Could not get your location. Using default.')
        );
      }

      // Hire status management
      let hireStarted = false;
      let hireStartTime = null;

      function updateHireStatus() {
        const dot = document.getElementById('status-dot');
        const label = document.getElementById('status-label');
        const badge = document.getElementById('status-badge');
        const dateRow = document.getElementById('status-date-row');
        const dateVal = document.getElementById('status-date-value');
        const notStartedNote = document.getElementById('status-not-started-note');

        if (hireStarted) {
          dot.className = 'w-3 h-3 rounded-full bg-green-500 status-pulse';
          label.textContent = 'Hire Started';
          badge.className = 'text-xs font-bold px-3 py-1.5 rounded-full bg-green-500 text-white';
          badge.textContent = 'ACTIVE';
          dateRow.classList.remove('hidden');
          dateVal.textContent = hireStartTime ? hireStartTime.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
          notStartedNote.classList.add('hidden');
        } else {
          const scheduledEl = document.getElementById('scheduled-datetime');
          const isScheduled = scheduledEl && scheduledEl.value;
          if (isScheduled) {
            const dt = new Date(scheduledEl.value);
            dot.className = 'w-3 h-3 rounded-full bg-blue-400';
            label.textContent = 'Scheduled';
            badge.className = 'text-xs font-bold px-3 py-1.5 rounded-full bg-blue-500 text-white';
            badge.textContent = 'SCHEDULED';
            dateRow.classList.remove('hidden');
            dateRow.className = 'flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
            dateRow.querySelector('.text-xs').textContent = 'Scheduled For';
            dateRow.querySelector('.text-xs').className = 'text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase';
            dateVal.className = 'text-sm font-bold text-blue-700 dark:text-blue-300';
            dateVal.textContent = dt.toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' });
            notStartedNote.classList.add('hidden');
          } else {
            dot.className = 'w-3 h-3 rounded-full bg-zinc-400';
            label.textContent = 'Not Started';
            badge.className = 'text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500';
            badge.textContent = 'PENDING';
            dateRow.classList.add('hidden');
            notStartedNote.classList.remove('hidden');
          }
        }
      }

      // Current time display
      function updateCurrentTime() {
        const now = new Date();
        document.getElementById('current-time-display').textContent = now.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
      }
      updateCurrentTime();
      setInterval(updateCurrentTime, 1000);

      // Schedule
      function setSchedule(mode) {
        const nowBtn = document.getElementById('now-btn');
        const laterBtn = document.getElementById('later-btn');
        const schedTime = document.getElementById('schedule-time');
        const reqDisplay = document.getElementById('request-time-display');
        if (mode === 'now') {
          nowBtn.className = 'py-3 rounded-xl bg-yellow-400 text-zinc-950 font-semibold text-sm';
          laterBtn.className = 'py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold';
          schedTime.classList.add('hidden');
          reqDisplay.innerHTML = 'Now · <span id="current-time-display"></span>';
          updateCurrentTime();
          updateHireStatus();
        } else {
          laterBtn.className = 'py-3 rounded-xl bg-yellow-400 text-zinc-950 font-semibold text-sm';
          nowBtn.className = 'py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold';
          schedTime.classList.remove('hidden');
          reqDisplay.innerHTML = 'Scheduled — pick a date &amp; time below';
          updateHireStatus();
        }
      }

      // Step indicator
      function updateStep(n) {
        const dots = ['step1dot','step2dot','step3dot'];
        dots.forEach((id, i) => {
          const d = document.getElementById(id);
          if (i < n - 1) { d.className = 'step-dot done'; d.textContent = '✓'; }
          else if (i === n - 1) { d.className = 'step-dot active'; d.textContent = i + 1; }
          else { d.className = 'step-dot idle'; d.textContent = i + 1; }
        });
      }

      function closeModal() {
        document.getElementById('confirm-modal').classList.add('hidden');
        document.getElementById('confirm-modal').classList.remove('flex');
      }

      // ══════════════════════════════════════════════
      // POI LAYER SYSTEM — Overpass API (POST, multi-mirror)
      // ══════════════════════════════════════════════
      const poiConfig = {
        temple:     { emoji: '🛕', color: '#f59e0b', label: 'Temple / Religious',
                      query: `node["amenity"="place_of_worship"];way["amenity"="place_of_worship"];` },
        hospital:   { emoji: '🏥', color: '#ef4444', label: 'Hospital / Clinic / Doctor',
                      query: `node["amenity"~"^(hospital|clinic|doctors)$"];way["amenity"~"^(hospital|clinic|doctors)$"];` },
        school:     { emoji: '🏫', color: '#3b82f6', label: 'School / Kindergarten / College',
                      query: `node["amenity"~"^(school|kindergarten|college)$"];way["amenity"~"^(school|kindergarten|college)$"];` },
        university: { emoji: '🎓', color: '#8b5cf6', label: 'University',
                      query: `node["amenity"="university"];way["amenity"="university"];` },
        park:       { emoji: '🛝', color: '#22c55e', label: 'Park / Playground',
                      query: `node["leisure"~"^(park|playground)$"];way["leisure"~"^(park|playground)$"];` },
        library:    { emoji: '📚', color: '#06b6d4', label: 'Library',
                      query: `node["amenity"="library"];way["amenity"="library"];` },
        pharmacy:   { emoji: '💊', color: '#ec4899', label: 'Pharmacy',
                      query: `node["amenity"="pharmacy"];way["amenity"="pharmacy"];` },
      };

      // Overpass mirrors — tried in order until one works
      const OVERPASS_MIRRORS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
      ];

      const poiLayers = {};
      const poiActive = {};
      const poiCache  = {};
      const poiFetching = {};

      function getBbox() {
        const b = map.getBounds();
        // Overpass format: south,west,north,east
        return [
          b.getSouth().toFixed(5),
          b.getWest().toFixed(5),
          b.getNorth().toFixed(5),
          b.getEast().toFixed(5)
        ].join(',');
      }

      function buildOverpassQuery(key, bbox) {
        const parts = poiConfig[key].query
          .trim()
          .split(';')
          .filter(p => p.trim())
          .map(p => `${p.trim()}(${bbox});`)
          .join('');
        return `[out:json][timeout:25];\n(\n${parts}\n);\nout center 80;`;
      }

      async function fetchFromOverpass(query) {
        const body = 'data=' + encodeURIComponent(query);
        const errors = [];
        for (const mirror of OVERPASS_MIRRORS) {
          try {
            const res = await fetch(mirror, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return json.elements || [];
          } catch (e) {
            errors.push(`${mirror}: ${e.message}`);
          }
        }
        throw new Error('All Overpass mirrors failed:\n' + errors.join('\n'));
      }

      function makePOIIcon(emoji, color) {
        return L.divIcon({
          html: `<div style="width:32px;height:32px;background:${color};border:2.5px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,0.5);cursor:pointer;">${emoji}</div>`,
          iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16], className: ''
        });
      }

      function buildPOILayer(key, elements) {
        const cfg   = poiConfig[key];
        const group = L.layerGroup();
        let count = 0;
        elements.forEach(el => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (!lat || !lng) return;
          const rawName = el.tags?.name || el.tags?.['name:en'] || '';
          const name    = rawName || cfg.label;
          const safeName = name.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
          L.marker([lat, lng], { icon: makePOIIcon(cfg.emoji, cfg.color) })
            .bindPopup(`
              <div style="font-family:Poppins,sans-serif;text-align:center;padding:6px 4px;min-width:170px;">
                <div style="font-size:26px;line-height:1;margin-bottom:4px">${cfg.emoji}</div>
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px">${name}</div>
                <div style="font-size:10px;color:#64748b;margin-bottom:8px">${cfg.label}</div>
                <div style="display:flex;gap:6px;justify-content:center;">
                  <button onclick="window.setPickupFromMap(${lat},${lng},'${safeName}')"
                    style="flex:1;padding:5px 0;background:#22c55e;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:11px;font-weight:700;">
                    📍 Pickup
                  </button>
                  <button onclick="window.setDestFromMap(${lat},${lng},'${safeName}')"
                    style="flex:1;padding:5px 0;background:#f87171;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:11px;font-weight:700;">
                    🏁 Drop-off
                  </button>
                </div>
              </div>
            `, { maxWidth: 230 })
            .addTo(group);
          count++;
        });
        console.log(`[POI] ${key}: rendered ${count} markers`);
        return group;
      }

      function setPoiBtnState(key, active) {
        const btn = document.getElementById(`poi-btn-${key}`);
        if (!btn) return;
        const color = poiConfig[key].color;
        if (active) {
          btn.style.background  = color + '33';
          btn.style.borderColor = color;
          btn.style.color       = color;
          btn.style.fontWeight  = '700';
        } else {
          btn.style.background  = '';
          btn.style.borderColor = '';
          btn.style.color       = '';
          btn.style.fontWeight  = '';
        }
      }

      async function togglePOI(key) {
        if (poiFetching[key]) return;   // prevent double-click during fetch

        if (poiActive[key]) {
          if (poiLayers[key]) map.removeLayer(poiLayers[key]);
          poiActive[key] = false;
          setPoiBtnState(key, false);
          return;
        }

        const bbox = getBbox();

        // Use cached layer if bbox hasn't changed
        if (poiLayers[key] && poiCache[key] === bbox) {
          poiLayers[key].addTo(map);
          poiActive[key] = true;
          setPoiBtnState(key, true);
          return;
        }

        // Fetch fresh data
        poiFetching[key] = true;
        const loadEl = document.getElementById('poi-loading');
        const btn    = document.getElementById(`poi-btn-${key}`);
        if (loadEl) loadEl.classList.remove('hidden');
        if (btn) btn.textContent = '⏳ ' + btn.textContent.replace(/^⏳\s*/, '');

        try {
          const query    = buildOverpassQuery(key, bbox);
          const elements = await fetchFromOverpass(query);

          if (poiLayers[key]) map.removeLayer(poiLayers[key]);
          poiLayers[key] = buildPOILayer(key, elements);
          poiCache[key]  = bbox;

          poiLayers[key].addTo(map);
          poiActive[key] = true;
          setPoiBtnState(key, true);

          if (elements.length === 0) {
            const n = document.createElement('div');
            n.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fbbf24;padding:8px 16px;border-radius:12px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.5)';
            n.textContent = `No ${poiConfig[key].label} found in this area. Try zooming in.`;
            document.body.appendChild(n);
            setTimeout(() => n.remove(), 3500);
          }
        } catch(e) {
          console.error('[POI] fetch error:', e);
          const n = document.createElement('div');
          n.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#7f1d1d;color:#fca5a5;padding:8px 16px;border-radius:12px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.5)';
          n.textContent = 'Could not load places — check your internet connection.';
          document.body.appendChild(n);
          setTimeout(() => n.remove(), 4000);
        } finally {
          poiFetching[key] = false;
          const cfg = poiConfig[key];
          if (btn) btn.innerHTML = `${cfg.emoji} ${key.charAt(0).toUpperCase()+key.slice(1)}`;
          if (loadEl) loadEl.classList.add('hidden');
        }
      }

      // Refresh active layers when map pans/zooms significantly
      map.on('moveend', () => {
        const newBbox = getBbox();
        Object.keys(poiActive).forEach(key => {
          if (poiActive[key] && poiCache[key] !== newBbox && !poiFetching[key]) {
            (async () => {
              try {
                const query    = buildOverpassQuery(key, newBbox);
                const elements = await fetchFromOverpass(query);
                if (poiLayers[key]) map.removeLayer(poiLayers[key]);
                poiLayers[key] = buildPOILayer(key, elements);
                poiCache[key]  = newBbox;
                if (poiActive[key]) poiLayers[key].addTo(map);
              } catch(e) { /* silent — user can re-toggle */ }
            })();
          }
        });
      });

      // ── Rental Duration Logic ──
      let durationType = 'hours';
      let selectedHours = null;
      let selectedDays = 1;

      function setDurationType(type) {
        durationType = type;
        const hoursPanel = document.getElementById('duration-hours-panel');
        const daysPanel  = document.getElementById('duration-days-panel');
        const hoursBtn   = document.getElementById('duration-hours-btn');
        const daysBtn    = document.getElementById('duration-days-btn');

        if (type === 'hours') {
          hoursPanel.classList.remove('hidden');
          daysPanel.classList.add('hidden');
          hoursBtn.className = 'py-3 rounded-xl bg-yellow-400 text-zinc-950 font-semibold text-sm transition-all';
          daysBtn.className  = 'py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold transition-all';
        } else {
          daysPanel.classList.remove('hidden');
          hoursPanel.classList.add('hidden');
          daysBtn.className  = 'py-3 rounded-xl bg-yellow-400 text-zinc-950 font-semibold text-sm transition-all';
          hoursBtn.className = 'py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold transition-all';
          updateDaysSummary();
        }
        updateSummaryPanel();
      }

      function selectHours(btn, hrs) {
        selectedHours = hrs;
        document.querySelectorAll('.hour-btn').forEach(b => {
          b.className = 'hour-btn py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold hover:border-yellow-400 transition-all';
        });
        btn.className = 'hour-btn py-2.5 rounded-xl bg-yellow-400 border border-yellow-400 text-zinc-950 text-sm font-bold transition-all';
        const summaryEl = document.getElementById('hours-summary');
        const summaryText = document.getElementById('hours-summary-text');
        summaryEl.classList.remove('hidden');
        summaryText.textContent = `Renting for ${hrs} hour${hrs > 1 ? 's' : ''} today`;
        updateSummaryPanel();
      }

      function selectTodayOnly(btn) {
        selectedHours = 'today';
        document.querySelectorAll('.hour-btn').forEach(b => {
          b.className = 'hour-btn py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold hover:border-yellow-400 transition-all';
        });
        btn.className = 'hour-btn py-2.5 rounded-xl bg-yellow-400 border border-yellow-400 text-zinc-950 text-xs font-bold transition-all';
        const summaryEl = document.getElementById('hours-summary');
        const summaryText = document.getElementById('hours-summary-text');
        summaryEl.classList.remove('hidden');
        summaryText.textContent = 'Renting for the full day (Today Only)';
        updateSummaryPanel();
      }

      function changeDays(delta) {
        selectedDays = Math.max(1, Math.min(30, selectedDays + delta));
        document.getElementById('days-count').textContent = selectedDays;
        updateDaysSummary();
        updateSummaryPanel();
      }

      function updateDaysSummary() {
        const rangeEl = document.getElementById('days-range-text');
        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() + selectedDays - 1);
        const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        rangeEl.textContent = selectedDays === 1
          ? `${selectedDays} day (${fmt(today)})`
          : `${selectedDays} days (${fmt(today)} – ${fmt(end)})`;
      }

      function updateSummaryPanel() {
        const routeEl    = document.getElementById('summary-route');
        const durationEl = document.getElementById('summary-duration');
        const estimateEl = document.getElementById('summary-estimate');
        const badgeEl    = document.getElementById('rental-status-badge');

        // Route
        const pickup = document.getElementById('pickup-input').value.trim();
        const dest   = document.getElementById('dest-input').value.trim();
        if (pickup && dest) {
          const p = pickup.length > 12 ? pickup.slice(0,12)+'…' : pickup;
          const d = dest.length > 12 ? dest.slice(0,12)+'…' : dest;
          routeEl.textContent = `${p} → ${d}`;
        } else {
          routeEl.textContent = 'Not set';
        }

        // Duration
        if (durationType === 'hours') {
          if (selectedHours === 'today') durationEl.textContent = 'Today only';
          else if (selectedHours) durationEl.textContent = `${selectedHours} hr${selectedHours > 1 ? 's' : ''}`;
          else durationEl.textContent = 'Not set';
        } else {
          durationEl.textContent = `${selectedDays} day${selectedDays > 1 ? 's' : ''}`;
        }

        // Estimate from price card if available
        const total = document.getElementById('est-total').textContent;
        estimateEl.textContent = (total && total !== '—') ? total : '—';

        // Badge
        const ready = (pickup && dest && (selectedHours || durationType === 'days'));
        if (ready) {
          badgeEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500 status-pulse inline-block"></span> Ready';
          badgeEl.className = 'flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full';
        } else {
          badgeEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 status-pulse inline-block"></span> Pending Setup';
          badgeEl.className = 'flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full';
        }
      }

      // Hook into existing input changes
      document.getElementById('pickup-input').addEventListener('input', updateSummaryPanel);
      document.getElementById('dest-input').addEventListener('input', updateSummaryPanel);

      // Mobile sidebar
      function toggleMobileSidebar() {
        const sb = document.getElementById('mob-sidebar');
        const ov = document.getElementById('mob-overlay');
        const open = !sb.classList.contains('-translate-x-full');
        if (open) {
          sb.classList.add('-translate-x-full');
          ov.classList.add('hidden');
        } else {
          sb.classList.remove('-translate-x-full');
          ov.classList.remove('hidden');
        }
      }

function loadRoute(fromCityName, toCityName) {
  const _allSources = [...allCities, ...places, ...poiPlaces];

  function _findCity(name) {
    if (!name) return null;
    const q = name.trim().toLowerCase();
    let found = _allSources.find(c => c.name.toLowerCase() === q);
    if (!found) found = _allSources.find(c => c.name.toLowerCase().includes(q));
    return found || null;
  }

  const fromCity = _findCity(fromCityName);
  const toCity = _findCity(toCityName);

  if (!fromCity) {
    console.warn(`loadRoute: could not find city "${fromCityName}"`);
    return;
  }
  if (!toCity) {
    console.warn(`loadRoute: could not find city "${toCityName}"`);
    return;
  }

  setPickupCoords(fromCity.lat, fromCity.lng, fromCity.name);
  setDestCoords(toCity.lat, toCity.lng, toCity.name);
}

window.loadRoute = loadRoute;