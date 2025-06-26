// Form to upload data
const PlaceForm = ({ form, onFormChange, onFormSubmit, onFileChange, toDisplay }) => {
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
        placeholder="Name"
        value={form.name}
        onChange={(e) => onFormChange("name", e.target.value)}
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

      <label htmlFor="imageFile" style={{ cursor: 'pointer' }}>
        {toDisplay ? (
          <img src={URL.createObjectURL(toDisplay)} alt="Uploaded preview" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }} />
        ) : (
          <div style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            <br />
            Click to upload
          </div>
        )}
        <input type="file" id="imageFile" name="image" onChange={onFileChange} accept="image/*" style={{ display: 'none' }} />
      </label>

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