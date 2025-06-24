// frontend/src/App.jsx
import { useEffect, useState } from "react";
import { getPlaces, addOrUpdatePlace } from "./api"; // Keep addOrUpdatePlace
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";
import Modal from "./components/AddPlaceModal";
import PlaceForm from "./components/PlaceForm"; // Import the PlaceForm component

// Fix Leaflet's marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const emojiIcon = L.icon({
  iconUrl: '/pin.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function App() {
  const [places, setPlaces] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ // Form state managed here
    continent: "",
    country: "",
    city: "",
    lat: "",
    lng: "",
    notes: "",
  });

  const fetchPlaces = () => {
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
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Handler for changes in the form inputs
  const handleFormChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

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

      // After successful submission, reset the form
      setForm({
        continent: "",
        country: "",
        city: "",
        lat: "",
        lng: "",
        notes: "",
      });

      fetchPlaces(); // Re-fetch places to update the map
      setIsModalOpen(false); // Close the modal
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
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
        />
        {markers.map((m, idx) => (
          <div key={idx}>
            <Marker position={m.position} icon={emojiIcon}>
              <Popup>
                <strong>{m.city}</strong><br />
                {m.country}, {m.continent}
                {m.description && <><br />{m.description}</>}
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      <button
        onClick={() => {
          setIsModalOpen(true);
          // Optionally reset form when opening if it might contain old data
          setForm({
            continent: "",
            country: "",
            city: "",
            lat: "",
            lng: "",
            notes: "",
          });
        }}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1,
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        Add Place
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PlaceForm
          form={form}           // Pass the form state
          onFormChange={handleFormChange} // Pass the change handler
          onFormSubmit={handleSubmit}     // Pass the submit handler
        />
      </Modal>
    </div>
  );
}

export default App;