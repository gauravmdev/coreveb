"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, projects } from "@/db/schema";
import { currentUser } from "@/lib/session";

/**
 * Posts a message to a project thread. Works for both clients and admins:
 * admins can post on any project, clients only on their own company's.
 */
export async function postProjectMessage(formData: FormData) {
  const user = await currentUser();
  if (!user) return;

  const projectId = String(formData.get("projectId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!projectId || !body) return;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) return;
  if (user.role !== "admin" && project.companyId !== user.companyId) return;

  await db.insert(messages).values({
    projectId,
    companyId: project.companyId,
    authorId: user.id,
    authorName: user.name ?? user.email ?? "User",
    authorRole: user.role,
    body,
  });

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
}
