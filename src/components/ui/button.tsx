import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 group",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-hover hover:shadow-brand/35 border border-brand/30",
        uiverse:
          "bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-hover hover:shadow-brand/35 border border-brand/30",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-brand-subtle hover:text-brand hover:border-brand/40",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-brand-subtle hover:text-brand",
        link: "text-brand underline-offset-4 hover:underline hover:text-brand-hover",
      },
      size: {
        default: "h-11 px-6 py-2.5 min-h-[44px]",
        sm: "h-9 rounded-md px-3.5 text-xs min-h-[36px]",
        lg: "h-13 rounded-md px-8 text-base min-h-[48px]",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const UiverseDecoration = () => (
  <>
    {/* Corner fold top-right */}
    <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-brand-active rounded group-hover:-mr-4 group-hover:-mt-4 pointer-events-none z-10">
      <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
    </span>
    {/* Corner fold bottom-left */}
    <span className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-brand-active rounded group-hover:-ml-4 group-hover:-mb-4 pointer-events-none z-10">
      <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white" />
    </span>
    {/* Slide-in fill background */}
    <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-brand-hover rounded-md group-hover:translate-x-0 pointer-events-none z-0" />
  </>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size, asChild = false, children, ...props }, ref) => {
    const isUiverseStyle = variant === "default" || variant === "uiverse" || !variant;

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ children?: React.ReactNode }>;
      const innerContent = isUiverseStyle ? (
        <>
          <UiverseDecoration />
          <span className="relative z-20 flex items-center justify-center gap-2 text-white transition-colors duration-200 ease-in-out">
            {child.props.children}
          </span>
        </>
      ) : (
        child.props.children
      );

      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
          {React.cloneElement(child, child.props, innerContent)}
        </Slot>
      );
    }

    if (isUiverseStyle) {
      return (
        <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
          <UiverseDecoration />
          <span className="relative z-20 flex items-center justify-center gap-2 text-white transition-colors duration-200 ease-in-out">
            {children}
          </span>
        </button>
      );
    }

    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
