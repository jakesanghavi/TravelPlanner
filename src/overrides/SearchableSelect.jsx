import React, { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

const SearchableSelect = ({ options, value, onChange, placeholder, className }) => {
    const [search, setSearch] = useState(value || "");
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Filter top 5 matches based on search
    const filteredOptions = options
        .filter(
            (opt) =>
                opt.name.toLowerCase().includes(search.toLowerCase()) ||
                opt.code.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 5);

    const baseClasses =
        "flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white text-black";

    const combinedClasses = clsx(baseClasses, className);

    const handleSelect = (opt) => {
        setSearch(`${opt.name} (${opt.code})`);
        onChange({ target: { name: "airport", value: opt.code } });
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input
                type="text"
                className={combinedClasses}
                value={search}
                placeholder={placeholder}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
            />
            {isOpen && filteredOptions.length > 0 && (
                <ul className="absolute z-10 w-full max-h-40 overflow-auto bg-white border border-slate-300 rounded-md mt-1 shadow-lg">
                    {filteredOptions.map((opt) => (
                        <li
                            key={opt.code}
                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-black"
                            onClick={() => handleSelect(opt)}
                        >
                            {opt.name} ({opt.code})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchableSelect;
