import type { SVGProps } from "react";

type IconName =
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
  | "send";

const paths: Record<IconName, React.ReactNode> = {
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
