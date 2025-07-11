import React, { useState } from 'react';

const FloatingActionMenu = ({ onAddPlaceClick, onDrawCircleClick, onPlanFlightClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
            }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "#007bff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    fontSize: "30px",
                }}
            >
                +
            </div>

            {isOpen && (
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                        onClick={onDrawCircleClick}
                        style={{
                            backgroundColor: "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                    >
                        Draw Circle
                    </button>

                    <button
                        onClick={onAddPlaceClick}
                        style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                    >
                        Add Place
                    </button>

                    <button
                        onClick={onPlanFlightClick}
                        style={{
                            backgroundColor: "#0ea5e9", // a lighter blue
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                    >
                        Plan Flight
                    </button>
                </div>
            )}
        </div>
    );
};

export default FloatingActionMenu;
