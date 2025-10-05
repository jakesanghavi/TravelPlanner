import { motion } from "framer-motion";
import Input from "../overrides/Input";
import Textarea from "../overrides/TextArea";
import Button from "../overrides/Button";
import Select from "../overrides/Select"
import "../index.css"
import { continents, countries } from "../useful_imports";

export default function PlaceForm({
  form,
  onFormChange,
  onFormSubmit,
  onFileChange,
  toDisplay,
  errors,
}) {
  const binary = ["Yes", "No"]
  return (
    <motion.form
      onSubmit={onFormSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 max-w-2xl mx-auto space-y-6 max-h-[90vh] overflow-y-scroll"
    >
      <input type="text" name="fakeuser" style={{ display: 'none' }} />
      <input type="password" name="fakepass" style={{ display: 'none' }} />
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#43a4ff] to-blue-600 bg-clip-text text-transparent">
        Add / Update Place
      </h2>

      {/* Continent */}
      <Select
        id="continent"
        value={form.continent}
        onChange={(e) => onFormChange("continent", e.target.value)}
        required
        className="bg-white border border-slate-300 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] rounded-md transition-all duration-300 px-3 py-2"
      >
        <option value="">Select Continent</option>
        {continents().map((continent) => (
          <option key={continent} value={continent}>
            {continent}
          </option>
        ))}
      </Select>
      {/* {errors?.continent && (
        <p className="text-red-400 text-sm">{errors.continent}</p>
      )} */}

      {/* Country */}
      <Select
        id="country"
        value={form.country}
        onChange={(e) => onFormChange("country", e.target.value)}
        required
        className="bg-white border border-slate-300 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] rounded-md transition-all duration-300 px-3 py-2"
      >
        <option value="">Select Country</option>
        {countries().map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </Select>
      {errors?.country && (
        <p className="text-red-400 text-sm">{errors.country}</p>
      )}

      {/* City */}
      <Input
        id="city-search"
        placeholder="City"
        value={form.city}
        onChange={(e) => onFormChange("city", e.target.value)}
        required
        autoComplete="new-field"
        data-lpignore="true"
        className="bg-white border border-slate-300 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] rounded-md transition-all duration-300 px-3 py-2"
      />
      {errors?.city && <p className="text-red-400 text-sm">{errors.city}</p>}

      {/* Name */}
      <Input
        id="name-search"
        placeholder="Place Name"
        value={form.name}
        onChange={(e) => onFormChange("name", e.target.value)}
        required
        autoComplete="new-field"
        data-lpignore="true"
        className="bg-white border border-slate-300 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] rounded-md transition-all duration-300 px-3 py-2"
      />
      {errors?.name && <p className="text-red-400 text-sm">{errors.name}</p>}

      {/* Latitude / Longitude */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="lat"
          type="number"
          step="any"
          placeholder="Latitude"
          value={form.lat}
          onChange={(e) => onFormChange("lat", e.target.value)}
          required
          autoComplete="off"
          data-lpignore="true"
          className="bg-white border border-slate-300 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] rounded-md transition-all duration-300 px-3 py-2"
        />
        <Input
          id="lng"
          type="number"
          step="any"
          placeholder="Longitude"
          value={form.lng}
          onChange={(e) => onFormChange("lng", e.target.value)}
          required
          autoComplete="off"
          data-lpignore="true"
          className="bg-white border border-slate-300 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] rounded-md transition-all duration-300 px-3 py-2"
        />
      </div>

      <Select
        id="visited"
        value={form.visited}
        onChange={(e) => onFormChange("visited", e.target.value)}
        required
        className="bg-white border border-slate-300 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] rounded-md transition-all duration-300 px-3 py-2"
      >
        <option value="">Visited Before?</option>
        {binary.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
      {errors?.visited && <p className="text-red-400 text-sm">{errors.visited}</p>}

      {/* File Upload */}
      <div>
        <label htmlFor="imageFile" className="cursor-pointer block">
          {toDisplay ? (
            <img
              src={URL.createObjectURL(toDisplay)}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-xl border border-slate-600 mb-3"
            />
          ) : (
            <div className="border-2 border-dashed border-slate-600/50 rounded-xl p-6 text-center text-slate-400 hover:border-blue-400 transition">
              Click to upload an image
            </div>
          )}
        </label>

        <input
          type="file"
          id="imageFile"
          name="image"
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Notes */}
      <Textarea
        id="notes"
        placeholder="Notes (optional)"
        rows={4}
        value={form.notes}
        onChange={(e) => onFormChange("notes", e.target.value)}
        className="bg-white border border-slate-300 text-green-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] transition-all duration-300"
      />

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#43a4ff] to-blue-600 hover:from-blue-500 hover:to-blue-700 py-3 text-lg font-medium text-white rounded-md shadow-md transition-all duration-300 transform hover:scale-105"
      >
        Save Place
      </Button>
    </motion.form>
  );
}
