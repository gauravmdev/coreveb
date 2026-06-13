"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, projects, threadReads } from "@/db/schema";
import { currentUser } from "@/lib/session";

async function loadAccessibleProject(
  projectId: string,
  role: string,
  companyId: string | null,
) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) return null;
  if (role !== "admin" && project.companyId !== companyId) return null;
  return project;
}

async function upsertRead(userId: string, projectId: string) {
  await db
    .insert(threadReads)
    .values({ userId, projectId, lastReadAt: new Date() })
    .onConflictDoUpdate({
      target: [threadReads.userId, threadReads.projectId],
      set: { lastReadAt: new Date() },
    });
}

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

  const project = await loadAccessibleProject(projectId, user.role, user.companyId);
  if (!project) return;

  await db.insert(messages).values({
    projectId,
    companyId: project.companyId,
    authorId: user.id,
    authorName: user.name ?? user.email ?? "User",
    authorRole: user.role,
    body,
  });
  // Sender is caught up on their own message.
  await upsertRead(user.id, projectId);

  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/portal/messages/${projectId}`);
  revalidatePath(`/admin/messages/${projectId}`);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

/** Marks a project's thread as read for the current user (clears unread). */
export async function markThreadRead(projectId: string) {
  const user = await currentUser();
  if (!user) return;
  const project = await loadAccessibleProject(projectId, user.role, user.companyId);
  if (!project) return;
  await upsertRead(user.id, projectId);
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}
