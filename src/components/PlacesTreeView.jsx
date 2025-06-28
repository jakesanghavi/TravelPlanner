import React, { useState, useMemo } from "react";
import TreeNode from './TreeNode';


const PlacesTreeView = ({ data }) => {
  const [search, setSearch] = useState("");

  const filterData = (node, path = "") => {
    if (typeof node !== "object") return null;

    const entries = Object.entries(node).map(([key, value]) => {
      const newPath = `${path}/${key}`;
      if (
        key.toLowerCase().includes(search.toLowerCase()) ||
        newPath.toLowerCase().includes(search.toLowerCase())
      ) {
        return [key, value];
      }

      const filtered = filterData(value, newPath);
      return filtered ? [key, filtered] : null;
    });

    const filteredEntries = entries.filter(Boolean);
    return filteredEntries.length ? Object.fromEntries(filteredEntries) : null;
  };

  const filteredData = useMemo(() => {
    return search ? filterData(data) : data;
  }, [data, search]);

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search place, city, country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
      />
      <TreeNode data={filteredData}/>
    </div>
  );
};

export default PlacesTreeView;
