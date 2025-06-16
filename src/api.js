import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;
console.log("API baseURL:", baseURL);

const API = axios.create({
  baseURL,
});

export const getPlaces = () => API.get("/places");

export const addOrUpdatePlace = ({ continent, country, city, data }) =>
  API.post("/places", { continent, country, city, data });