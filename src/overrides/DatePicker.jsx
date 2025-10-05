import React, { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

// Utility: format to YYYY-MM-DD
const formatDate = (date) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const DatePicker = ({ value, onChange, placeholder, className }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const wrapperRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateClick = (day) => {
        const chosen = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(chosen);
        onChange?.({ target: { value: formatDate(chosen) } });
        setShowCalendar(false);
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const baseClasses =
        "flex h-10 w-full rounded-md border px-3 py-2 text-base text-black bg-white " +
        "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#43a4ff] focus:border-[#43a4ff] " +
        "disabled:cursor-not-allowed disabled:opacity-50";
    const combinedClasses = clsx(baseClasses, className);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input
                type="text"
                readOnly
                className={combinedClasses}
                value={selectedDate ? formatDate(selectedDate) : ""}
                placeholder={placeholder || "Select date"}
                onClick={() => setShowCalendar((prev) => !prev)}
            />

            {showCalendar && (
                <div className="absolute z-20 mt-2 w-[170%] max-w-md bg-white border border-slate-300 rounded-xl shadow-lg p-4 sm:max-w-sm">
                    {/* Month Header */}
                    <div className="flex justify-between items-center mb-3 text-slate-700">
                        <button
                            type="button"
                            className="p-1 rounded-full !bg-white !text-black hover:!bg-[#e5f2ff]"
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                                )
                            }
                        >
                            ‹
                        </button>
                        <span className="font-semibold">
                            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                        </span>
                        <button
                            type="button"
                            className="p-1 rounded-full !bg-white !text-black hover:!bg-[#e5f2ff]"
                            onClick={() =>
                                setCurrentMonth(
                                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                                )
                            }
                        >
                            ›
                        </button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 text-xs font-semibold text-slate-500 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="text-center">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-0.5 text-center w-full">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-6" />
                        ))}
                        {days.map((day) => {
                            const isSelected =
                                selectedDate &&
                                day === selectedDate.getDate() &&
                                currentMonth.getMonth() === selectedDate.getMonth() &&
                                currentMonth.getFullYear() === selectedDate.getFullYear();

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={clsx(
                                        "flex items-center justify-center rounded-full transition-colors " +
                                        "w-full aspect-square text-xs sm:text-sm md:text-base",
                                        isSelected
                                            ? "!bg-[#43a4ff] !text-white font-semibold"
                                            : "!bg-white !text-black hover:!bg-[#e5f2ff]"
                                    )}
                                    onClick={() => handleDateClick(day)}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default DatePicker;
