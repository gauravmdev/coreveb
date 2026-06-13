"use client";

import { useEffect } from "react";
import { markThreadRead } from "@/app/message-actions";

export function MarkRead({ projectId }: { projectId: string }) {
  useEffect(() => {
    markThreadRead(projectId);
  }, [projectId]);
  return null;
}
