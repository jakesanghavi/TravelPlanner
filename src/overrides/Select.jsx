import React from 'react';
import { clsx } from 'clsx';

// Custom Select component for stylized dropdowns
const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  const baseClasses =
    "flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white text-black";

  const combinedClasses = clsx(baseClasses, className);

  return (
    <select
      className={combinedClasses}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;
