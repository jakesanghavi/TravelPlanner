import L from "leaflet";

export const emojiIcon = L.icon({
  iconUrl: '/pin.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export const validateForm = (form, file) => {
    const errors = {};

    if (!form.continent || form.continent.trim().length < 1)
      errors.continent = 'Continent is required';

    if (!form.country || form.country.trim().length < 1)
      errors.country = 'Country is required';

    if (!form.city || form.city.trim().length < 1)
      errors.city = 'City is required';

    if (!form.name || form.name.trim().length < 1)
      errors.name = 'Place name is required';

    if (!form.lat || isNaN(parseFloat(form.lat)))
      errors.lat = 'Latitude must be a valid number';

    if (!form.lng || isNaN(parseFloat(form.lng)))
      errors.lng = 'Longitude must be a valid number';

    if (!file)
      errors.image = 'Please upload an image';

    return Object.keys(errors).length === 0;
  };

  export const extractMarkers = (places) => {
    const markers = [];
    for (const continent in places) {
      for (const country in places[continent]) {
        for (const city in places[continent][country]) {
          for (const name in places[continent][country][city]) {
            const data = places[continent][country][city][name];
            if (data?.lat && (data?.lng || data?.long)) {
              markers.push({
                position: [data.lat, data.lng ?? data.long],
                name: name,
                city,
                country,
                continent,
                imageUrl: data.imageUrl,
                description: data.notes || "",
              });
            }
          }
        }
      }
    }
    return markers;
  };