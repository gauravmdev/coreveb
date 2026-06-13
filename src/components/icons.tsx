import type { SVGProps } from "react";

export type IconName =
  | "code"
  | "device"
  | "spark"
  | "ai"
  | "chat"
  | "search"
  | "bot"
  | "doc"
  | "chart"
  | "shield"
  | "send"
  | "grid"
  | "users"
  | "folder"
  | "receipt"
  | "target"
  | "logout"
  | "sun"
  | "moon";

const paths: Record<IconName, React.ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17.5 14.3A5.5 5.5 0 0 1 20.5 19" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  ),
  receipt: (
    <>
      <path d="M5 3h14v18l-2.5-1.6L14 21l-2-1.6L10 21l-2.5-1.6L5 21Z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 12h10" />
      <path d="m13 8 4 4-4 4" />
    </>
  ),
  send: (
    <>
      <path d="M4 12 20 4l-5 16-4-7-7-1Z" />
      <path d="m11 13 4-4" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  bot: (
    <>
      <rect x="4" y="8" width="16" height="11" rx="2.5" />
      <path d="M12 3v3" />
      <circle cx="12" cy="4" r="1" />
      <path d="M9 13h.01M15 13h.01" />
      <path d="M1.5 13v2M22.5 13v2" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 13h8M8 17h6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="m7 14 3-4 3 3 4-6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  ai: (
    <>
      <path d="M12 3a4 4 0 0 0-4 4 4 4 0 0 0 0 8 4 4 0 0 0 8 0 4 4 0 0 0 0-8 4 4 0 0 0-4-4Z" />
      <path d="M12 7v10" />
      <path d="M8 11h8" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  code: (
    <>
      <path d="m8 16-4-4 4-4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13 5-2 14" />
    </>
  ),
  device: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="m5 5 2.5 2.5" />
      <path d="m16.5 16.5 2.5 2.5" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m5 19 2.5-2.5" />
      <path d="m16.5 7.5 2.5-2.5" />
    </>
  ),
};

export function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
