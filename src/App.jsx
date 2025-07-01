import { useEffect, useState, useCallback } from "react";
import { getPlaces, addOrUpdatePlace } from "./api";
import { emojiIcon, validateForm, extractMarkers } from './helpful_functions'
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";
import Modal from "./components/Modal";
import PlaceForm from "./components/PlaceForm";
import ViewDetailsModal from "./components/ViewDetailsModal";
import PlacesTreeView from "./components/PlacesTreeView";
import Login from "./components/Login"
import FlightSearchForm from "./components/FlightSearchForm"


// Fix Leaflet's marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [selectedPlaceForView, setSelectedPlaceForView] = useState(null);
  const [errors, setErrors] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);

  const generateUserID = () => {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  };
  const getUserID = useCallback(() => {
    let userID = localStorage.getItem('userID');

    // If the user ID is not found in localStorage, generate a new one
    if (!userID) {
      userID = generateUserID();
      localStorage.setItem('userID', userID);
    }

    return userID;
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // get the userID for the user
        const userID = getUserID();

        // Check if this browser has been used before on the site
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/userID/' + userID);

        // If the browser has been used before...
        if (response.status === 200) {
          const data = await response.json();
          // Check if the user is registered too. If they are, log them in automatically
          if (data.email_address !== null) {
            const user = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/email/' + data.email_address);
            const user_resp = await user.json();
            setLoggedInUser({ email: user_resp.email_address, username: user_resp.username });

            // If they are registered, remove the google OAuth component when the site loads
            const element = document.getElementById('signInDiv')?.firstChild?.firstChild;
            if (element) {
              element.remove();
            }
          }
          // If the user is pseudo-registered (via cookies), fetch their data from a different route
          // and make their loggedInUser have a null email address. This could be helpful for deciding
          // when to make "sign in with google" show up
          else if (data.userID !== null) {
            const user = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/username/' + data.userID);
            const user_resp = await user.json();
            setLoggedInUser({ email: null, username: user_resp.username });

            // If they are registered, remove the google OAuth component when the site loads
            // We could maybe remove this for pseudo-users
            const element = document.getElementById('signInDiv')?.firstChild?.firstChild;
            if (element) {
              element.remove();
            }
          }
        }
        // If the browser has not been used before...
        else {
          setLoggedInUser({ email: null, username: getUserID() });
          // Create a new cookie user for the new browser window user
          await fetch(import.meta.env.VITE_BACKEND_URL + '/users/userID/post/' + userID, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userID": userID, "email_address": null })
          });

          // Post the cookie user with username of their cookie ID
          await fetch(import.meta.env.VITE_BACKEND_URL + '/users/' + userID, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "email_address": null, "username": userID })
          });
        }
      } catch (error) {
        console.error('An error occurred while fetching user data:', error);
      }
    };

    fetchData(); // Call the asynchronous function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({
    continent: "",
    country: "",
    city: "",
    name: "",
    lat: "",
    lng: "",
    notes: ""
  });

  const fetchPlaces = () => {
    getPlaces(loggedInUser.username)
      .then((res) => {
        setPlaces(res);
        console.log("Fetched places successfully:", res);
      })
      .catch((err) => {
        console.error("Failed to fetch places:", err);
      })
      .finally(() => {
        console.log("Fetch attempt completed.");
      });
  };

  useEffect(() => {
    if (loggedInUser) {
      fetchPlaces();
    }
  }, [loggedInUser]);


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

    if (!loggedInUser) {
      return
    }

    const valid = validateForm(form, file);
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
    formData.append("username", loggedInUser.username)
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

  const handleLoginSuccess = async (email, username) => {
    const element = document.getElementById('signInDiv')?.firstChild?.firstChild;
    if (element) {
      element.remove();
    }

    const userID = getUserID();
    // Update the loggedInUser state
    await fetch(import.meta.env.VITE_BACKEND_URL + '/users/userID/patch/' + userID, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "userID": userID, "email_address": email })
    });

    setLoggedInUser({ email: email, username: username });

    // const user = await fetch(ROUTE + '/api/users/email/' + email);
    // const user_resp = await user.json();
    // setLoggedInUser({ email: user_resp.email_address, username: user_resp.username });
  };

  const markers = extractMarkers(places);

  const openViewDetailsModal = (markerData) => {
    setSelectedPlaceForView(markerData);
    setIsViewModalOpen(true);
  };

  const onSelectPlaceFromTree = (placeData) => {
    setSelectedPlaceForView(placeData);
    setIsViewModalOpen(true);
  };

  const openLoginModal = (email) => {
    document.getElementById('sign-in-modal').style.display = 'block';
    document.getElementById('signUpEmail').value = email;
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Left Panel - 15% */}
      <div style={{ width: "15%", backgroundColor: "#f8f9fa", padding: "10px", overflowY: "auto", color: "black" }}>
        <Login onLoginSuccess={handleLoginSuccess} uid={getUserID} openLoginModal={openLoginModal} />
        <div id="signIn">
          {!loggedInUser?.email ? (
            <button onClick={openLoginModal}>Sign In</button>
          ) : (
            <span>{loggedInUser.username}</span>
          )}
        </div>
        {loggedInUser?.email && (
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
        )}
        <button
          onClick={() => {
            setIsFlightModalOpen(true);
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
          Plan Flight
        </button>
        <PlacesTreeView data={places} onSelectPlace={onSelectPlaceFromTree} />
      </div>

      {/* Right Panel - 85% */}
      <div style={{ width: "85%", position: "relative" }}>
        <MapContainer
          center={[40, 10.4515]}
          zoom={2.3000001}
          zoomSnap={0.75}
          zoomDelta={2}
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

      <Modal isOpen={isFlightModalOpen} onClose={() => setIsFlightModalOpen(false)}>
        <FlightSearchForm></FlightSearchForm>
      </Modal>
    </div>
  );
}

export default App;
