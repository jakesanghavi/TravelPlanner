// frontend/src/App.jsx
import { useEffect, useState } from "react";
import { getPlaces, addOrUpdatePlace } from "./api";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css"; // Ensure html, body, #root have height: 100%

// Fix Leaflet's marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const emojiIcon = L.icon({
  iconUrl: '/pin.png',  // emoji-style image
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function App() {
  const [places, setPlaces] = useState({});
  const [form, setForm] = useState({
    continent: "",
    country: "",
    city: "",
    lat: "",
    lng: "",
    notes: "",
  });


  useEffect(() => {
    getPlaces()
      .then((res) => {
        setPlaces(res.data);
        console.log("Fetched places successfully:", res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch places:", err);
      })
      .finally(() => {
        console.log("Fetch attempt completed.");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Latitude and Longitude must be valid numbers.");
      return;
    }

    try {
      await addOrUpdatePlace({
        continent: form.continent,
        country: form.country,
        city: form.city,
        lat: lat,
        lng: lng,
        notes: form.notes || "",
      });

      const res = await getPlaces();
      setPlaces(res.data);

      setForm({
        continent: "",
        country: "",
        city: "",
        lat: "",
        lng: "",
        notes: "",
      });
    } catch (err) {
      alert("Failed to submit data.");
      console.error(err);
    }
  };


  const extractMarkers = () => {
    const markers = [];
    for (const continent in places) {
      for (const country in places[continent]) {
        for (const city in places[continent][country]) {
          const data = places[continent][country][city];
          if (data?.lat && (data?.lng || data?.long)) {
            markers.push({
              position: [data.lat, data.lng ?? data.long],
              city,
              country,
              continent,
              description: data.notes || "",
            });
          }
        }
      }
    }
    return markers;
  };

  const markers = extractMarkers();

  return (
    <div className="app-root">
      <MapContainer
        center={[51.1657, 10.4515]} // Germany default
        zoom={5}
        style={{ height: "100vh", width: "100vw", position: "absolute", top: 0, left: 0, zIndex: 0 }}
      >
        {/* Globe-like green and blue */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
        />
        {/* Simpler white and blue
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
        /> */}
        {markers.map((m, idx) => (
          <div key={idx}>
            <Marker position={m.position} icon={emojiIcon}>
              <Popup>
                <strong>{m.city}</strong><br />
                {m.country}, {m.continent}
                {m.description && <><br />{m.description}</>}
              </Popup>
            </Marker>
            {/* <Circle
              center={m.position}
              radius={1000} // 1km radius;
              pathOptions={{ color: "blue", fillColor: "#30f", fillOpacity: 0.2 }}
            /> */}
          </div>
        ))}
      </MapContainer>

      <div
        className="overlay-form"
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(255,255,255,0.9)",
          maxWidth: "400px",
          margin: "20px",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-2 flex flex-col">
          <input
            placeholder="Continent"
            value={form.continent}
            onChange={(e) => setForm({ ...form, continent: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Latitude"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
            className="border p-2 rounded"
            type="number"
            step="any"
            required
          />
          <input
            placeholder="Longitude"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
            className="border p-2 rounded"
            type="number"
            step="any"
            required
          />
          <input
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add / Update Place
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
