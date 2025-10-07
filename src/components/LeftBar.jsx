import PlacesTreeView from "../components/PlacesTreeView";
import Login from "../components/Login"
import L from "leaflet";
import "../index.css";
import { FaPlane, FaFilter } from "react-icons/fa";
import { LuLassoSelect } from "react-icons/lu";
import { MdAddLocationAlt } from "react-icons/md";
import SlidingToggle from "./SlidingToggle";
import { sliderStyles } from "../useful_imports";

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

function LeftBar({
    setSelectedPlaceForView,
    setIsViewModalOpen,
    places,
    handleLoginSuccess,
    getUserID,
    loggedInUser,
    onDrawCircleClick,
    onAddPlaceClick,
    onPlanFlightClick,
    filterPlaces,
    setIsFiltersModalOpen
}) {
    const onSelectPlaceFromTree = (placeData) => {
        setSelectedPlaceForView(placeData);
        setIsViewModalOpen(true);
    };

    const openFiltersModal = () => {
        setIsFiltersModalOpen(true);
    }

    return (
        <div className="w-60 bg-white backdrop-blur-sm p-4 overflow-y-auto border-r border-slate-200 text-black">

            <div style={{ marginBottom: '0.25rem' }}>
                <style>{sliderStyles}</style>
                <SlidingToggle></SlidingToggle>
            </div>
            <div>
                <Login onLoginSuccess={handleLoginSuccess} uid={getUserID} openLoginModal={openLoginModal} />
                <div id="signIn">
                    {!loggedInUser?.email ? (
                        <button onClick={openLoginModal} className="text-white">Sign In to Start Planning!</button>
                    ) : (
                        <span>{loggedInUser.username}</span>
                    )}
                </div>
                <PlacesTreeView data={places} onSelectPlace={onSelectPlaceFromTree} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <button
                    onClick={openFiltersModal}
                    style={{ padding: "8px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                    <FaFilter size={20} style={{ marginRight: "6px" }} /> Filter Pins
                </button>
                <button
                    onClick={onDrawCircleClick}
                    style={{ padding: "8px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                    <LuLassoSelect size={20} style={{ marginRight: "6px" }} /> Draw Circle
                </button>
                <button
                    onClick={onAddPlaceClick}
                    style={{ padding: "8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                    <MdAddLocationAlt size={20} style={{ marginRight: "6px" }} /> Add Place
                </button>
                <button
                    onClick={onPlanFlightClick}
                    style={{ padding: "8px", backgroundColor: "#0ea5e9", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                    <FaPlane size={20} style={{ marginRight: "6px" }} /> Plan Flight
                </button>
            </div>

        </div>
    );
}


export default LeftBar;
