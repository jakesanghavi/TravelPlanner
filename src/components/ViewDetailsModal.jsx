// frontend/src/components/ViewDetailsModal.jsx
import React from 'react';
import Modal from './Modal'; // Re-use the existing Modal wrapper
import './modal.css'; // We'll create this CSS file next


const ViewDetailsModal = ({ isOpen, onClose, placeData }) => {
  if (!placeData) return null; // Don't render if no data is provided

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4 text-center">Place Details</h2>
      <div className="uneditable-place-data space-y-2">
        <p><strong>Continent:</strong> {placeData.continent}</p>
        <p><strong>Country:</strong> {placeData.country}</p>
        <p><strong>City:</strong> {placeData.city}</p>
        <p><strong>Latitude:</strong> {placeData.position[0]}</p>
        <p><strong>Longitude:</strong> {placeData.position[1]}</p>
        {placeData.description && <p><strong>Notes:</strong> {placeData.description}</p>}
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ViewDetailsModal;