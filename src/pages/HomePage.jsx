import { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import { getPlaces } from "../api";
import AddPlaceMapView from "../components/AddPlaceMapView";
import "../index.css";
import LeftBar from "../components/LeftBar";
import { validateForm } from "../helpful_functions";
import { addOrUpdatePlace } from "../api";

// Fix Leaflet's marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function HomePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
    const [selectedPlaceForView, setSelectedPlaceForView] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [file, setFile] = useState(null);


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
    const [places, setPlaces] = useState({});

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

    const [loggedInUser, setLoggedInUser] = useState(null);

    const [visitedFilter, setVisitedFilter] = useState({
        visited: true,
        notVisited: true,
    });

    // Function to update the filter state
    const handleVisitedFilterChange = (name, checked) => {
        setVisitedFilter((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

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
        <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
            <LeftBar setSelectedPlaceForView={setSelectedPlaceForView} setIsViewModalOpen={setIsViewModalOpen}
                places={places} handleLoginSuccess={handleLoginSuccess} getUserID={getUserID} loggedInUser={loggedInUser}
                visitedFilter={visitedFilter} onVisitedFilterChange={handleVisitedFilterChange}></LeftBar>
            <AddPlaceMapView loggedInUser={loggedInUser} places={places} isModalOpen={isModalOpen} 
            setIsModalOpen={setIsModalOpen} isFlightModalOpen={isFlightModalOpen} 
            setIsFlightModalOpen={setIsFlightModalOpen} selectedPlaceForView={selectedPlaceForView} 
            setSelectedPlaceForView={setSelectedPlaceForView} isViewModalOpen={isViewModalOpen} 
            setIsViewModalOpen={setIsViewModalOpen} handleFormChange={handleFormChange} 
            handleSubmit={handleSubmit} handleFileChange={handleFileChange} 
            file={file} form={form} visitedFilter={visitedFilter}></AddPlaceMapView>
        </div>
    );
}

export default HomePage;
