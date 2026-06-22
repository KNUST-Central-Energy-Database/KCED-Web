type IconProps = { className?: string; size?: number };

/** Shared wrapper for stroked (line) icons. */
function Stroke({
  className,
  size = 18,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function IssueIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16.5v.01" />
    </Stroke>
  );
}

export function DescriptionIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </Stroke>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </Stroke>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </Stroke>
  );
}

export function JurisdictionIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </Stroke>
  );
}

export function LocationIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M20 10c0 4.5-6 11.5-8 11.5S4 14.5 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Stroke>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
      <circle cx="12" cy="7" r="4" />
    </Stroke>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M8 3c.5 0 2.5 4.5 2.5 5c0 1-1.5 2-2 3c-.5 1 .5 2 1.5 3c.39.39 2 2 3 1.5c1-.5 2-2 3-2c.5 0 5 2 5 2.5c0 2-1.5 3.5-3 4c-1.5.5-2.5.5-4.5 0c-2-.5-3.5-1-6-3.5c-2.5-2.5-3-4-3.5-6c-.5-2-.5-3 0-4.5C5 4.5 6.5 3 8 3Z" />
    </Stroke>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Stroke>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Stroke>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="m6 9 6 6 6-6" />
    </Stroke>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 13l4 4L19 7" />
    </Stroke>
  );
}
