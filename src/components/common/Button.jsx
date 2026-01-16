import clsx from 'clsx';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) {
    const baseStyles = 'btn';

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
