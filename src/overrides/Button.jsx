import React from 'react';
import { clsx } from 'clsx'; // Import clsx

// Custom button class for stylization unification
const buttonVariants = {
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-full font-medium transition-all duration-300',

  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border bg-background hover:bg-accent border-slate-600 text-slate-300 hover:border-blue-400 hover:text-blue-400',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  },

  size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
  },
};

const Button = ({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  children,
  ...props
}) => {
  const allClasses = clsx(
    buttonVariants.base,
    buttonVariants.variant[variant],
    buttonVariants.size[size],
    className
  );

  const Comp = asChild ? React.Fragment : 'button';

  if (asChild) {
    return React.cloneElement(children, {
      className: clsx(children.props.className, allClasses),
      ...props,
    });
  }

  return (
    <Comp className={allClasses} {...props}>
      {children}
    </Comp>
  );
};

export default Button;