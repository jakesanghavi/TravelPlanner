import React, { useState } from "react";
import { FaPlane } from "react-icons/fa";
import { LuLassoSelect } from "react-icons/lu";
import { MdAddLocationAlt } from "react-icons/md";

const FloatingActionMenu = ({ onAddPlaceClick, onDrawCircleClick, onPlanFlightClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Button size
    const FAB_SIZE = 60;

    // Distance of new buttons
    const RADIUS = 60;
    const TRANS_MS = 420;

    // Angles (roughyl calculated)
    const ANGLES = [-116, -45, 27];

    const actions = [
        { onClick: onDrawCircleClick, label: "Draw Circle", bg: "#f59e0b" },
        { onClick: onAddPlaceClick, label: "Add Place", bg: "#007bff" },
        { onClick: onPlanFlightClick, label: "Plan Flight", bg: "#0ea5e9" },
    ];

    const calcXY = (deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = Math.round(Math.cos(rad) * RADIUS);
        const y = Math.round(Math.sin(rad) * RADIUS);
        return { x, y };
    };

    // Wrap everything to keep hover active on new buttons
    const wrapperSize = RADIUS * 2 + FAB_SIZE;

    return (
        <div
            style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                width: wrapperSize,
                height: wrapperSize,
                zIndex: 1000,
            }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* positioning context */}
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div
                    role="button"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((s) => !s)}
                    style={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        width: FAB_SIZE,
                        height: FAB_SIZE,
                        borderRadius: "50%",
                        backgroundColor: "#007bff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        cursor: "pointer",
                        boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                        fontSize: 30,
                        userSelect: "none",
                    }}
                >
                    +
                </div>

                {actions.map((act, i) => {
                    const { x, y } = calcXY(ANGLES[i]);
                    const baseLeft = FAB_SIZE / 2;
                    const baseBottom = FAB_SIZE / 2;

                    const common = {
                        position: "absolute",
                        left: baseLeft,
                        bottom: baseBottom,
                        transformOrigin: "center center",
                        transition: `transform ${TRANS_MS}ms cubic-bezier(.2,.9,.3,1), opacity ${TRANS_MS}ms ease`,
                        opacity: isOpen ? 1 : 0,
                        pointerEvents: isOpen ? "auto" : "none",
                        zIndex: 1010,
                    };

                    const openTransform = `translate(${x}px, ${y}px) scale(1)`;
                    const closedTransform = `translate(0px, 0px) scale(0.7)`;

                    return (
                        <button
                            key={i}
                            onClick={act.onClick}
                            style={{
                                ...common,
                                transform: isOpen ? openTransform : closedTransform,
                                backgroundColor: act.bg,
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: "30%",
                                height: "30%",
                                cursor: "pointer",
                                boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {/* Manually setting sizes but good to change later */}
                            {i === 0 && <LuLassoSelect size={28} />}
                            {i === 1 && <MdAddLocationAlt size={28} />}
                            {i === 2 && <FaPlane size={28} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FloatingActionMenu;
