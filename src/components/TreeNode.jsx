import React, { useState } from "react";

const folderIcon = (
  <span
    style={{ marginRight: 6, userSelect: "none", fontSize: "1.2em" }}
    role="img"
    aria-label="folder"
  >
    📁
  </span>
);

const TreeNode = ({ data, level = 0 }) => {
  const [expandedNodes, setExpandedNodes] = useState({});

  if (!data || typeof data !== "object") return null;

  const toggleNode = (key) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ul
      style={{
        listStyle: "none", // NO bullet points
        paddingLeft: level === 0 ? 0 : 12, // super small indent per level
        margin: 0,
        color: "black", // force black text color
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
      }}
    >
      {Object.entries(data).map(([key, value]) => {
        const hasChildren = typeof value === "object" && value !== null;
        const isExpanded = expandedNodes[key];

        return (
          <li
            key={key}
            style={{
              marginLeft: 0,
              paddingLeft: 0,
              userSelect: "none",
              cursor: hasChildren ? "pointer" : "default",
            }}
          >
            <div
              onClick={() => hasChildren && toggleNode(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 0",
              }}
            >
              {hasChildren && (
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    textAlign: "center",
                    userSelect: "none",
                    fontWeight: "bold",
                    color: "#555",
                  }}
                >
                  {isExpanded ? "▼" : "▶"}
                </span>
              )}
              {hasChildren && folderIcon}
              <span>{key}</span>
            </div>
            {hasChildren && isExpanded && (
              <TreeNode data={value} level={level + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default TreeNode;
