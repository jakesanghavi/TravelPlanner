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

function LeftBar({
    setSelectedPlaceForView,
    setIsViewModalOpen,
    places,
    handleLoginSuccess,
    getUserID,
    loggedInUser,
}) {
    const onSelectPlaceFromTree = (placeData) => {
        setSelectedPlaceForView(placeData);
        setIsViewModalOpen(true);
    };

    return (
        <div className="w-60 bg-white/90 backdrop-blur-sm p-4 overflow-y-auto border-r border-slate-200 text-black">
            <Login
                onLoginSuccess={handleLoginSuccess}
                uid={getUserID}
                openLoginModal={openLoginModal}
            />

            <div id="signIn" className="my-4 text-center">
                {!loggedInUser?.email ? (
                    <button
                        onClick={openLoginModal}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all duration-300"
                    >
                        Sign In to Start Planning!
                    </button>
                ) : (
                    <span className="font-semibold text-slate-800">{loggedInUser.username}</span>
                )}
            </div>

            <PlacesTreeView data={places} onSelectPlace={onSelectPlaceFromTree} />
        </div>
    );
}


export default LeftBar;
