"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, projects, threadReads } from "@/db/schema";
import { currentUser } from "@/lib/session";

type AttachmentType = "quote" | "invoice" | "approval";

function defaultBodyFor(type: AttachmentType | null) {
  if (type === "quote") return "Here's your quote — review and accept below.";
  if (type === "invoice") return "Sharing an invoice for this project.";
  if (type === "approval") return "Requesting your sign-off on the current stage.";
  return "";
}

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

  // Attachments are admin-only.
  let attachmentType: AttachmentType | null = null;
  let attachmentId: string | null = null;
  if (user.role === "admin") {
    const t = String(formData.get("attachmentType") ?? "");
    if (t === "quote" || t === "invoice" || t === "approval") {
      attachmentType = t;
      attachmentId = String(formData.get("attachmentId") ?? "") || null;
    }
  }

  if (!projectId || (!body && !attachmentType)) return;

  const project = await loadAccessibleProject(projectId, user.role, user.companyId);
  if (!project) return;

  // A sign-off request flips the project into "awaiting approval".
  if (attachmentType === "approval") {
    attachmentId = projectId;
    await db
      .update(projects)
      .set({ awaitingApproval: true })
      .where(eq(projects.id, projectId));
  }

  await db.insert(messages).values({
    projectId,
    companyId: project.companyId,
    authorId: user.id,
    authorName: user.name ?? user.email ?? "User",
    authorRole: user.role,
    body: body || defaultBodyFor(attachmentType),
    attachmentType,
    attachmentId,
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
