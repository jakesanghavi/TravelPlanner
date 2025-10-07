import { useEffect, useState } from "react";
import L from "leaflet";
import { getPlaces } from "../api";
import AddPlaceMapView from "../components/AddPlaceMapView";
import "../index.css";
import LeftBar from "../components/LeftBar";
import { validateForm } from "../helpful_functions";
import { addOrUpdatePlace } from "../api";
import TopBar from "../components/TopBar"

// Fix Leaflet's marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function HomePage({ getUserID, handleLoginSuccess, loggedInUser, setLoggedInUser }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
    const [selectedPlaceForView, setSelectedPlaceForView] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [places, setPlaces] = useState({});

    const [filters, setFilters] = useState({
        visitedFilter: { visited: true, notVisited: true },
        continents: [],
        temperature: { min: -5, max: 120 },
    });

    useEffect(() => {
        if (loggedInUser) {
            fetchPlaces();
        }
    }, [loggedInUser]);

    const fetchPlaces = () => {
        getPlaces(loggedInUser.username)
            .then((res) => {
                setPlaces(res);
            })
            .catch((err) => {
                console.error("Failed to fetch places:", err);
            });
    };

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

        fetchData();
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

    return (
        <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
            
            <TopBar/>

            {/* Main Content */}
            <div style={{ display: "flex", flex: 1 }}>
                <LeftBar
                    setSelectedPlaceForView={setSelectedPlaceForView}
                    setIsViewModalOpen={setIsViewModalOpen}
                    places={places}
                    handleLoginSuccess={handleLoginSuccess}
                    getUserID={getUserID}
                    loggedInUser={loggedInUser}
                    onAddPlaceClick={() => {
                        setIsModalOpen(true);
                        setForm({
                            continent: "",
                            country: "",
                            city: "",
                            name: "",
                            lat: "",
                            lng: "",
                            visited: "",
                            notes: "",
                        });
                        setFile(null);
                    }}
                    onDrawCircleClick={() => {
                        if (!window.map) return;

                        let polyline;
                        let polygon;
                        const latlngs = [];
                        let drawing = false;
                        window.map.getContainer().style.cursor = 'crosshair';

                        const onMouseDown = (e) => {
                            drawing = true;
                            latlngs.length = 0;
                            latlngs.push(e.latlng);

                            // disable map interactions while drawing
                            window.map.dragging.disable();
                            window.map.doubleClickZoom.disable();

                            document.body.style.userSelect = 'none';

                            polyline = L.polyline(latlngs, { color: '#43a4ff' }).addTo(window.map);
                        };

                        const onMouseMove = (e) => {
                            if (!drawing) return;
                            latlngs.push(e.latlng);
                            polyline.setLatLngs(latlngs);
                        };

                        const onMouseUp = () => {
                            drawing = false;

                            if (polyline) {
                                window.map.removeLayer(polyline);
                            }

                            // Circle up polygon
                            polygon = L.polygon(latlngs, { color: '#43a4ff', fillOpacity: 0.4 }).addTo(window.map);

                            // Store polys so we can check if any lat/long is within
                            window.drawnPolygons = window.drawnPolygons || [];
                            window.drawnPolygons.push(polygon);

                            // re-enable map interactions
                            window.map.dragging.enable();
                            window.map.doubleClickZoom.enable();

                            window.map.getContainer().style.cursor = '';

                            document.body.style.userSelect = '';

                            // cleanup listeners
                            window.map.off('mousedown', onMouseDown);
                            window.map.off('mousemove', onMouseMove);
                            window.map.off('mouseup', onMouseUp);
                        };

                        window.map.on('mousedown', onMouseDown);
                        window.map.on('mousemove', onMouseMove);
                        window.map.on('mouseup', onMouseUp);
                    }}
                    onPlanFlightClick={() => {
                        setIsFlightModalOpen(true);
                    }}
                    setIsFiltersModalOpen={setIsFiltersModalOpen}
                />
                <AddPlaceMapView
                    loggedInUser={loggedInUser}
                    places={places}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    isFlightModalOpen={isFlightModalOpen}
                    setIsFlightModalOpen={setIsFlightModalOpen}
                    selectedPlaceForView={selectedPlaceForView}
                    setSelectedPlaceForView={setSelectedPlaceForView}
                    isViewModalOpen={isViewModalOpen}
                    setIsViewModalOpen={setIsViewModalOpen}
                    handleFormChange={handleFormChange}
                    handleSubmit={handleSubmit}
                    handleFileChange={handleFileChange}
                    file={file}
                    form={form}
                    filters={filters}
                    setFilters={setFilters}
                    isFiltersModalOpen={isFiltersModalOpen}
                    setIsFiltersModalOpen={setIsFiltersModalOpen}
                />
            </div>
        </div>
    );

}

export default HomePage;
