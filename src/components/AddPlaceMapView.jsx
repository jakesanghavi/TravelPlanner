import { useState, useEffect, useRef } from "react";
import { emojiIcon, extractMarkers } from '../helpful_functions'
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../index.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import Modal from "../components/Modal";
import PlaceForm from "../components/PlaceForm";
import ViewDetailsModal from "../components/ViewDetailsModal";
import FlightSearchForm from "../components/FlightSearchForm";
import FloatingActionMenu from "../components/FloatingActionMenu";


function MapController({ position, zoom }) {
    const map = useMap();

    useEffect(() => {
        window.map = map;
    }, [map]);

    useEffect(() => {
        if (position) {
            map.setView(position, zoom, { animate: true });
        }
    }, [position, zoom, map]);

    return null;
}

function AddPlaceMapView({ places, isModalOpen, setIsModalOpen, isFlightModalOpen, setIsFlightModalOpen, selectedPlaceForView, setSelectedPlaceForView, isViewModalOpen, setIsViewModalOpen, handleFormChange, handleSubmit, handleFileChange, file, form, loggedInUser }) {
    const [errors, setErrors] = useState({});

    const markers = extractMarkers(places);

    const openViewDetailsModal = (markerData) => {
        setSelectedPlaceForView(markerData);
        setIsViewModalOpen(true);
    };

    const southWest = [-90, -180];
    const northEast = [90, 180];
    const bounds = [southWest, northEast];

    return (

        <div style={{ height: "100%", width: "100%" }}>
            {/* Right Panel - 85% */}
            <div style={{ height: "100%", width: "100%" }}>
                <MapContainer
                    center={[40, 10.4515]}
                    zoom={2.3000001}
                    zoomSnap={0.75}
                    zoomDelta={2}
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                    minZoom={2.30000001}
                    maxBounds={bounds}
                    maxBoundsViscosity={1.0}
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
                                    <strong>{m.name}</strong><br />
                                    {m.city}, {m.country}, {m.continent}
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
                    {loggedInUser?.email && (
                        <FloatingActionMenu
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
                        />
                    )}

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

export default AddPlaceMapView;