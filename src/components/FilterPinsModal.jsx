import { useEffect, useState } from "react";
import Modal from './Modal';
import '../component_styles/modal.css';
import { continents, countries } from "../useful_imports";

const FilterPinsModal = ({ isOpen, onClose, filters, setFilters }) => {
    const [tempRange, setTempRange] = useState(filters?.temperature || { min: -5, max: 120 });

    const handleVisitedChange = (name, checked) => {
        setFilters((prev) => ({
            ...prev,
            visitedFilter: {
                ...prev.visitedFilter,
                [name]: checked,
            },
        }));
    };

    const handleContinentChange = (continent, checked) => {
        setFilters((prev) => {
            const newContinents = checked
                ? [...(prev.continent || []), continent]
                : (prev.continent || []).filter((c) => c !== continent);
            return { ...prev, continent: newContinents };
        });
    };

    const handleTempChange = (field, value) => {
        setTempRange((prev) => ({ ...prev, [field]: value }));
        setFilters((prev) => ({ ...prev, temperature: { ...tempRange, [field]: value } }));
    };

    const continentsConst = continents();

    useEffect(() => {
        if (!filters.continent || filters.continent.length === 0) {
            setFilters(prev => ({ ...prev, continent: continentsConst }));
        }
    }, [continentsConst]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="text-black">
            <h2 className="text-xl font-bold mb-4 text-center text-black">Filters</h2>

            <div className="space-y-4 text-black">
                <div>
                    <h3 className="font-medium mb-2 text-black">Visited</h3>
                    <label className="mr-4 text-black">
                        <input
                            type="checkbox"
                            checked={filters?.visitedFilter?.visited ?? true}
                            onChange={(e) => handleVisitedChange("visited", e.target.checked)}
                        />{" "}
                        Visited
                    </label>
                    <label className="text-black">
                        <input
                            type="checkbox"
                            checked={filters?.visitedFilter?.notVisited ?? true}
                            onChange={(e) => handleVisitedChange("notVisited", e.target.checked)}
                        />{" "}
                        Not Visited
                    </label>
                </div>

                {continentsConst?.length > 0 && (
                    <div>
                        <h3 className="font-medium mb-2 text-black">Continents</h3>
                        <div className="flex flex-wrap gap-2 text-black">
                            {continentsConst.map((c) => (
                                <label key={c} className="mr-2 text-black">
                                    <input
                                        type="checkbox"
                                        checked={filters.continent?.includes(c)}
                                        onChange={(e) => handleContinentChange(c, e.target.checked)}
                                    />{" "}
                                    {c}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="font-medium mb-2 text-black">Temperature (°F)</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={tempRange.min}
                            onChange={(e) => handleTempChange("min", Number(e.target.value))}
                            className="border px-2 py-1 rounded w-16 text-black"
                        />
                        <span className="text-black">–</span>
                        <input
                            type="number"
                            value={tempRange.max}
                            onChange={(e) => handleTempChange("max", Number(e.target.value))}
                            className="border px-2 py-1 rounded w-16 text-black"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <button
                    onClick={onClose}
                    className="bg-gray-300 text-white py-2 px-4 rounded hover:bg-gray-400"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default FilterPinsModal;
