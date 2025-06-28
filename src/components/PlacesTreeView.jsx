import React, { useState } from "react";

function PlacesTreeView({ data, onSelectPlace }) {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleNode = (key) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClickPlace = (placeData) => {
    if (onSelectPlace) {
      onSelectPlace(placeData);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Flattened search results (if search bar has input)
  const getSearchResults = () => {
    const results = [];
    for (const continent in data) {
      for (const country in data[continent]) {
        for (const city in data[continent][country]) {
          for (const name in data[continent][country][city]) {
            if (name.toLowerCase().includes(searchTerm)) {
              const placeData = data[continent][country][city][name];
              results.push({
                name,
                continent,
                country,
                city,
                description: placeData.notes || "",
                position: [placeData.lat, placeData.lng ?? placeData.long],
              });
            }
          }
        }
      }
    }
    return results;
  };

  const searchResults = searchTerm ? getSearchResults() : [];

  return (
    <div>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search places..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: "100%",
          padding: "6px 8px",
          marginBottom: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {/* If searching, show flat result list */}
      {searchTerm ? (
        <div>
          {searchResults.length === 0 ? (
            <div style={{ fontStyle: "italic" }}>No results found.</div>
          ) : (
            searchResults.map((place, idx) => (
              <div
                key={idx}
                onClick={() => handleClickPlace(place)}
                style={{
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                  padding: "4px 0",
                }}
              >
                {place.name}
              </div>
            ))
          )}
        </div>
      ) : (
        // Tree view if no search
        Object.entries(data).map(([continent, countries]) => {
          const continentKey = continent;
          const isContinentExpanded = !!expandedNodes[continentKey];

          return (
            <div key={continent}>
              <div
                style={{ cursor: "pointer", userSelect: "none", marginBottom: "4px" }}
                onClick={() => toggleNode(continentKey)}
              >
                <strong>
                  {isContinentExpanded ? "▼ " : "▶ "}
                  {continent}
                </strong>
              </div>
              {isContinentExpanded &&
                Object.entries(countries).map(([country, cities]) => {
                  const countryKey = `${continent}/${country}`;
                  const isCountryExpanded = !!expandedNodes[countryKey];

                  return (
                    <div key={country} style={{ paddingLeft: "10px", marginTop: "4px" }}>
                      <div
                        style={{ cursor: "pointer", userSelect: "none" }}
                        onClick={() => toggleNode(countryKey)}
                      >
                        <em>
                          {isCountryExpanded ? "▼ " : "▶ "}
                          {country}
                        </em>
                      </div>
                      {isCountryExpanded &&
                        Object.entries(cities).map(([city, places]) => {
                          const cityKey = `${continent}/${country}/${city}`;
                          const isCityExpanded = !!expandedNodes[cityKey];

                          return (
                            <div key={city} style={{ paddingLeft: "20px", marginTop: "2px" }}>
                              <div
                                style={{ cursor: "pointer", userSelect: "none" }}
                                onClick={() => toggleNode(cityKey)}
                              >
                                {isCityExpanded ? "▼ " : "▶ "}
                                {city}
                              </div>
                              {isCityExpanded &&
                                Object.entries(places).map(([name, placeData]) => (
                                  <div
                                    key={name}
                                    style={{
                                      paddingLeft: "30px",
                                      cursor: "pointer",
                                      color: "blue",
                                      textDecoration: "underline",
                                      marginTop: "2px",
                                    }}
                                    onClick={() =>
                                      handleClickPlace({
                                        position: [placeData.lat, placeData.lng ?? placeData.long],
                                        name: placeData.name,
                                        city,
                                        country,
                                        continent,
                                        description: placeData.notes || "",
                                      })
                                    }
                                  >
                                    {name}
                                  </div>
                                ))}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          );
        })
      )}
    </div>
  );
}

export default PlacesTreeView;
