import React, { useState } from "react";

function PlacesTreeView({ data, onSelectPlace }) {
  // Track expanded nodes by their unique keys (continent/country/city)
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (key) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // When user clicks a place name, call onSelectPlace with full place data
  const handleClickPlace = (placeData) => {
    if (onSelectPlace) {
      onSelectPlace(placeData);
    }
  };

  return (
    <div>
      {Object.entries(data).map(([continent, countries]) => {
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
      })}
    </div>
  );
}

export default PlacesTreeView;
