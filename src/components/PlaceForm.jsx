import { motion } from "framer-motion";
import Input from "../overrides/Input";
import Textarea from "../overrides/TextArea";
import Button from "../overrides/Button";

export default function PlaceForm({
  form,
  onFormChange,
  onFormSubmit,
  onFileChange,
  toDisplay,
  errors,
}) {
  return (
    <motion.form
      onSubmit={onFormSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 max-w-2xl mx-auto space-y-6"
    >
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center">
        Add / Update Place
      </h2>

      {/* Continent */}
      <Input
        id="continent"
        placeholder="Continent"
        value={form.continent}
        onChange={(e) => onFormChange("continent", e.target.value)}
        required
        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
      />
      {errors?.continent && (
        <p className="text-red-400 text-sm">{errors.continent}</p>
      )}

      {/* Country */}
      <Input
        id="country"
        placeholder="Country"
        value={form.country}
        onChange={(e) => onFormChange("country", e.target.value)}
        required
        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
      />
      {errors?.country && (
        <p className="text-red-400 text-sm">{errors.country}</p>
      )}

      {/* City */}
      <Input
        id="city"
        placeholder="City"
        value={form.city}
        onChange={(e) => onFormChange("city", e.target.value)}
        required
        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
      />
      {errors?.city && <p className="text-red-400 text-sm">{errors.city}</p>}

      {/* Name */}
      <Input
        id="name"
        placeholder="Place Name"
        value={form.name}
        onChange={(e) => onFormChange("name", e.target.value)}
        required
        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
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
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
        />
        <Input
          id="lng"
          type="number"
          step="any"
          placeholder="Longitude"
          value={form.lng}
          onChange={(e) => onFormChange("lng", e.target.value)}
          required
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="imageFile"
          className="block cursor-pointer text-slate-300 mb-2"
        >
          Upload Image
        </label>
        {toDisplay ? (
          <img
            src={URL.createObjectURL(toDisplay)}
            alt="Preview"
            className="w-full max-h-64 object-cover rounded-xl border border-slate-600 mb-3"
          />
        ) : (
          <div className="border-2 border-dashed border-slate-600/50 rounded-xl p-6 text-center text-slate-400 hover:border-blue-400 transition">
            Click to upload
          </div>
        )}
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
        className="bg-slate-700/50 border-slate-600 text-green placeholder:text-slate-400 focus:border-purple-400 resize-none"
      />

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 text-lg font-medium transition-all duration-300 transform hover:scale-105"
      >
        Save Place
      </Button>
    </motion.form>
  );
}
