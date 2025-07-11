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

function LeftBar({setSelectedPlaceForView, setIsViewModalOpen, places, handleLoginSuccess, getUserID, loggedInUser}) {

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
            <PlacesTreeView data={places} onSelectPlace={onSelectPlaceFromTree} />
        </div>
    );
}

export default LeftBar;
