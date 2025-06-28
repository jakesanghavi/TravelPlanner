import { useEffect, useState } from "react";
import { getPlaces, addOrUpdatePlace } from "./api"; // Keep addOrUpdatePlace
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

// Custom icon from teh assets folder
const emojiIcon = L.icon({
  iconUrl: '/pin.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function App() {
  const [places, setPlaces] = useState({});
  // Stored image for the palace
  // init as blank and append to form and parse w multer on backend side
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPlaceForView, setSelectedPlaceForView] = useState(null);
  const [errors, setErrors] = useState({});
  // Set form to blank at first
  const [form, setForm] = useState({
    continent: "",
    country: "",
    city: "",
    name: "",
    lat: "",
    lng: "",
    notes: ""
  });

  // Make sure the place is valid
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

    // Optional: If no file and no URL, warn the user
    if (!file)
      errors.image = 'Please upload an image';

    setErrors(errors);

    // If ever has more than 1 user then actually use this to show the errors
    return Object.keys(errors).length === 0;
  };

  // Get all palces from the DB
  // called on load and on update to refresh
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

  // Get placs on app mount
  useEffect(() => {
    fetchPlaces();
  }, []);

  // Update form as its changed
  const handleFormChange = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  // Passed to the form and stores the image file
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  // Process all validation for the form and then put it up
  // for submission
  const handleSubmit = async (e) => {

    const valid = validateForm();
    if (!valid) {
      return
    }

    e.preventDefault();

    // Convert str to float
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Latitude and Longitude must be valid numbers.");
      return;
    }

    // create formdata object and stack our form and image inot it
    const formData = new FormData();
    formData.append('image', file);
    formData.append("continent", form.continent)
    formData.append("country", form.country);
    formData.append("city", form.city);
    formData.append("name", form.name);
    formData.append("lat", lat);
    formData.append("lng", lng);
    formData.append("notes", form.notes || "");

    try {
      // Call to backend to upload
      await addOrUpdatePlace(formData);

      // re-blank form
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

      // get places again and then close the upload modal
      fetchPlaces();
      setIsModalOpen(false);
    } catch (err) {
      alert("Failed to submit data.");
      console.error(err);
    }
  };

  // Get all markers
  // below structure may change based on db schema updates
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

  // Get teh markers whenever refreshed
  const markers = extractMarkers();

  // Modal for each individual place
  // would like to make this open on hover eventually
  const openViewDetailsModal = (markerData) => {
    console.log(markerData)
    setSelectedPlaceForView(markerData); // Set the data for the view modal
    setIsViewModalOpen(true); // Open the view modal
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
        <PlacesTreeView data={places} />
      </div>

      {/* Right Panel - 85% */}
      <div style={{ width: "85%", position: "relative" }}>
        {/* Fullscreen Leaflet map inside right panel */}
        <MapContainer
          center={[51.1657, 10.4515]}
          zoom={5}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
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