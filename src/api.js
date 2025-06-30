import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL,
});

export const getPlaces = async (user) => {
  const response = await fetch(`${baseURL}/places`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user })
  });
  const data = await response.json()
  return data
};

// Idk how to use axios with params but change ths when i learn
export const addOrUpdatePlace = async (formData) => {
  try {
    const response = await fetch(`${baseURL}/upload-place`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log('Received data:', data);
  }

  catch (error) {
    // console.error('Error:', error);
    alert("Location upload failed. Please try again later.")
  }
}