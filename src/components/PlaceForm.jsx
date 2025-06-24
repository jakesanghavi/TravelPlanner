// frontend/src/components/PlaceForm.jsx
const PlaceForm = ({ form, onFormChange, onFormSubmit }) => {
  return (
    <form onSubmit={onFormSubmit} className="space-y-3 flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-center">Add/Update Place</h2>
      <input
        placeholder="Continent"
        value={form.continent}
        onChange={(e) => onFormChange("continent", e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        placeholder="Country"
        value={form.country}
        onChange={(e) => onFormChange("country", e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        placeholder="City"
        value={form.city}
        onChange={(e) => onFormChange("city", e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        placeholder="Latitude"
        value={form.lat}
        onChange={(e) => onFormChange("lat", e.target.value)}
        className="border p-2 rounded w-full"
        type="number"
        step="any"
        required
      />
      <input
        placeholder="Longitude"
        value={form.lng}
        onChange={(e) => onFormChange("lng", e.target.value)}
        className="border p-2 rounded w-full"
        type="number"
        step="any"
        required
      />
      <input
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => onFormChange("notes", e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 w-full mt-4"
      >
        Add / Update Place
      </button>
    </form>
  );
};

export default PlaceForm;