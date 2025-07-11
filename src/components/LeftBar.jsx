import PlacesTreeView from "../components/PlacesTreeView";
import Login from "../components/Login"
import L from "leaflet";
import "../index.css";

// Fix Leaflet's marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const openLoginModal = (email) => {
    document.getElementById('sign-in-modal').style.display = 'block';
    document.getElementById('signUpEmail').value = email;
};

function LeftBar({setIsModalOpen, setIsFlightModalOpen, setSelectedPlaceForView, setIsViewModalOpen, places, handleLoginSuccess, getUserID, loggedInUser, setForm, setFile}) {

    const onSelectPlaceFromTree = (placeData) => {
        setSelectedPlaceForView(placeData);
        setIsViewModalOpen(true);
    };

    return (
        <div style={{ width: "15%", backgroundColor: "#f8f9fa", padding: "10px", overflowY: "auto", color: "black" }}>
            <Login onLoginSuccess={handleLoginSuccess} uid={getUserID} openLoginModal={openLoginModal} />
            <div id="signIn">
                {!loggedInUser?.email ? (
                    <button onClick={openLoginModal}>Sign In to Start Planning!</button>
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
    );
}

export default LeftBar;
