"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, notes, projects, quotations } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { applyAcceptance } from "@/lib/quotations";
import { releaseMilestones } from "@/lib/billing";
import { stagesFor, type ProjectType } from "@/lib/crm";

async function loadOwnedSentQuote(id: string, companyId: string | null) {
  const [quote] = await db
    .select()
    .from(quotations)
    .where(eq(quotations.id, id))
    .limit(1);
  if (!quote || quote.companyId !== companyId || quote.status !== "sent") {
    return null;
  }
  return quote;
}

export async function acceptQuotation(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("quotationId") ?? "");
  const quote = await loadOwnedSentQuote(id, user.companyId);
  if (!quote) return;

  await applyAcceptance(id, user.name ?? "Client");
  revalidatePath("/portal/quotations");
  revalidatePath("/portal");
}

export async function declineQuotation(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("quotationId") ?? "");
  const quote = await loadOwnedSentQuote(id, user.companyId);
  if (!quote) return;

  await db.update(quotations).set({ status: "declined" }).where(eq(quotations.id, id));
  revalidatePath("/portal/quotations");
}

/* --------------------------- Stage sign-off ------------------------------- */

async function loadOwnedAwaitingProject(id: string, companyId: string | null) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  if (!project || project.companyId !== companyId || !project.awaitingApproval) {
    return null;
  }
  return project;
}

export async function approveStage(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("projectId") ?? "");
  const project = await loadOwnedAwaitingProject(id, user.companyId);
  if (!project) return;

  const stages = stagesFor(project.type as ProjectType);
  const approvedStage = stages[project.stageIndex] ?? "current";
  const newIndex = Math.min(project.stageIndex + 1, stages.length - 1);

  await db
    .update(projects)
    .set({ awaitingApproval: false, stageIndex: newIndex })
    .where(eq(projects.id, id));
  await releaseMilestones(id, newIndex);
  await db.insert(notes).values({
    body: `✓ ${user.name ?? "Client"} approved the ${approvedStage} stage.`,
    companyId: project.companyId,
    projectId: id,
    authorId: user.id,
    authorName: user.name ?? "Client",
    visibleToClient: true,
  });

  revalidatePath(`/portal/projects/${id}`);
  revalidatePath("/portal");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/admin/projects");
}

export async function requestStageChanges(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("projectId") ?? "");
  const project = await loadOwnedAwaitingProject(id, user.companyId);
  if (!project) return;

  const stage = stagesFor(project.type as ProjectType)[project.stageIndex] ?? "current";
  await db.update(projects).set({ awaitingApproval: false }).where(eq(projects.id, id));
  await db.insert(messages).values({
    projectId: id,
    companyId: project.companyId,
    authorId: user.id,
    authorName: user.name ?? "Client",
    authorRole: "client",
    body: `I'd like some changes before signing off on the ${stage} stage — details to follow.`,
  });

  revalidatePath(`/portal/projects/${id}`);
  revalidatePath(`/admin/projects/${id}`);
}
