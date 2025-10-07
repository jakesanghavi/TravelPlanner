import React, { useState, useMemo } from 'react';

const SlidingToggle = ({ initialMode = false }) => {
    const [isPlanningMode, setIsPlanningMode] = useState(initialMode);

    // Style da slider
    const sliderTabStyle = useMemo(() => ({
        left: isPlanningMode ? '50%' : '0%',
        transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        background: 'linear-gradient(to left, #73c771, #367f36)',
    }), [isPlanningMode]);

    return (
        <div className="app-card">
            <div className="header">Mode</div>
            <div className="slider-controls">
                <div
                    className="slider-tab"
                    style={sliderTabStyle}
                ></div>
                <button
                    onClick={() => setIsPlanningMode(false)}
                    className={`slide-button ${isPlanningMode ? 'inactive-text' : 'active-text'}`}
                >
                    Explore
                </button>
                <button
                    onClick={() => setIsPlanningMode(true)}
                    className={`slide-button ${isPlanningMode ? 'active-text' : 'inactive-text'}`}
                >
                    Plan Trip
                </button>
            </div>
        </div>
    );
};
export default SlidingToggle;
