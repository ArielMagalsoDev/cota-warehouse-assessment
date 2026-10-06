// Inline line icons (24px grid, round caps) so the site needs no icon dependency.
type IconProps = { className?: string };

function Icon({ className = "", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const ArrowRight = ({ className = "" }: IconProps) => <Icon className={`icon-right ${className}`}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>;
export const ArrowLeft = ({ className = "" }: IconProps) => <Icon className={`icon-left ${className}`}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></Icon>;
export const ArrowUpRight = ({ className = "" }: IconProps) => <Icon className={`icon-up-right ${className}`}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></Icon>;
export const Refresh = ({ className = "" }: IconProps) => <Icon className={className}><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" /><path d="M4 3v5h5" /><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" /><path d="M20 21v-5h-5" /></Icon>;
export const Close = ({ className = "" }: IconProps) => <Icon className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>;
export const Plus = ({ className = "" }: IconProps) => <Icon className={className}><path d="M12 5v14" /><path d="M5 12h14" /></Icon>;
export const Route = ({ className = "" }: IconProps) => <Icon className={className}><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /></Icon>;
