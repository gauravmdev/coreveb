"use client";

import { ErrorState } from "@/components/app/error-state";

export default function PortalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState {...props} area="portal" />;
}
