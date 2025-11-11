import { Chip, ChipProps } from "@mui/material";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends Omit<ChipProps, "variant" | "color"> {
    variant?: BadgeVariant;
}

const variantStyles: Record<
    NonNullable<BadgeProps["variant"]>,
    Partial<ChipProps>
> = {
    default: {
        color: "primary",
        variant: "filled",
    },
    secondary: {
        color: "secondary",
        variant: "filled",
    },
    destructive: {
        color: "error",
        variant: "filled",
    },
    outline: {
        color: "default",
        variant: "outlined",
    },
};

function Badge({ variant = "default", ...props }: BadgeProps) {
    const chipProps = variantStyles[variant] || variantStyles.default;
    return <Chip size="small" {...chipProps} {...props} />;
}

export { Badge };
