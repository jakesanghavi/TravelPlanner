import { useEffect, useState } from "react";
import { getPlaces, addOrUpdatePlace } from "./api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";
import Modal from "./components/Modal";
import PlaceForm from "./components/PlaceForm";
import ViewDetailsModal from "./components/ViewDetailsModal";
import PlacesTreeView from "./components/PlacesTreeView";

// Fix Leaflet's marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icon from the assets folder
const emojiIcon = L.icon({
  iconUrl: '/pin.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Helper component to control map view
function MapController({ position, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, zoom, { animate: true });
    }
  }, [position, zoom, map]);

  return null;
}

function App() {
  const [places, setPlaces] = useState({});
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPlaceForView, setSelectedPlaceForView] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    continent: "",
    country: "",
    city: "",
    name: "",
    lat: "",
    lng: "",
    notes: ""
  });

  const validateForm = () => {
    const errors = {};

    if (!form.continent || form.continent.trim().length < 1)
      errors.continent = 'Continent is required';

    if (!form.country || form.country.trim().length < 1)
      errors.country = 'Country is required';

    if (!form.city || form.city.trim().length < 1)
      errors.city = 'City is required';

    if (!form.name || form.name.trim().length < 1)
      errors.name = 'Place name is required';

    if (!form.lat || isNaN(parseFloat(form.lat)))
      errors.lat = 'Latitude must be a valid number';

    if (!form.lng || isNaN(parseFloat(form.lng)))
      errors.lng = 'Longitude must be a valid number';

    if (!file)
      errors.image = 'Please upload an image';

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

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

  const handleFormChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const valid = validateForm();
    if (!valid) {
      return;
    }

    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Latitude and Longitude must be valid numbers.");
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append("continent", form.continent);
    formData.append("country", form.country);
    formData.append("city", form.city);
    formData.append("name", form.name);
    formData.append("lat", lat);
    formData.append("lng", lng);
    formData.append("notes", form.notes || "");

    try {
      await addOrUpdatePlace(formData);

      setForm({
        continent: "",
        country: "",
        city: "",
        name: "",
        lat: "",
        lng: "",
        notes: "",
        imageFile: null,
      });
      setFile(null);

      fetchPlaces();
      setIsModalOpen(false);
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
          for (const name in places[continent][country][city]) {
            const data = places[continent][country][city][name];
            if (data?.lat && (data?.lng || data?.long)) {
              markers.push({
                position: [data.lat, data.lng ?? data.long],
                name: data.name,
                city,
                country,
                continent,
                description: data.notes || "",
              });
            }
          }
        }
      }
    }
    return markers;
  };

  const markers = extractMarkers();

  const openViewDetailsModal = (markerData) => {
    setSelectedPlaceForView(markerData);
    setIsViewModalOpen(true);
  };

  const onSelectPlaceFromTree = (placeData) => {
    setSelectedPlaceForView(placeData);
    setIsViewModalOpen(true);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Left Panel - 15% */}
      <div style={{ width: "15%", backgroundColor: "#f8f9fa", padding: "10px", overflowY: "auto", color: "black" }}>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setForm({
              continent: "",
              country: "",
              city: "",
              name: "",
              lat: "",
              lng: "",
              notes: "",
            });
            setFile(null);
          }}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
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
        <PlacesTreeView data={places} onSelectPlace={onSelectPlaceFromTree} />
      </div>

      {/* Right Panel - 85% */}
      <div style={{ width: "85%", position: "relative" }}>
        <MapContainer
          center={[40, 10.4515]}
          zoom={2.3000001}
          zoomSnap={0.75}
          zoomDelta={1}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          minZoom={2.30000001}
        >
          {/* globelike */}
          {/* <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
          /> */}
          {/* Black and white */}
          {/* <TileLayer
            url="https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            minZoom={0}
            maxZoom={20}
          /> */}
          {/* Forest gradient style */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community"
          />
          {markers.map((m, idx) => (
            <Marker key={idx} position={m.position} icon={emojiIcon}>
              <Popup>
                <div>
                  <strong>{m.city}</strong><br />
                  {m.country}, {m.continent}
                  {m.description && <><br />Notes: {m.description}</>}
                  <br />
                  <button
                    onClick={() => openViewDetailsModal(m)}
                    style={{
                      marginTop: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Control map view based on selected place from tree */}
          <MapController
            position={selectedPlaceForView ? selectedPlaceForView.position : null}
            zoom={6}
          />
        </MapContainer>
      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PlaceForm
          form={form}
          onFormChange={handleFormChange}
          onFormSubmit={handleSubmit}
          onFileChange={handleFileChange}
          toDisplay={file}
          errors={errors}
        />
      </Modal>

      <ViewDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        placeData={selectedPlaceForView}
      />
    </div>
  );
}

export default App;
