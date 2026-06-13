"use client";

import { ErrorState } from "@/components/app/error-state";

export default function AdminError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState {...props} area="admin" />;
}
