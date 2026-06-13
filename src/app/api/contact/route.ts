import { NextResponse } from "next/server";
import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { site } from "@/lib/site";

type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  service?: string;
  budget?: string;
  message?: string;
};

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Best-effort email notification. No-op unless RESEND_API_KEY is configured. */
async function notifyByEmail(lead: {
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  budget: string | null;
  message: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const to = process.env.CONTACT_NOTIFY_EMAIL ?? site.email;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Coreveb <onboarding@resend.dev>";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: lead.email,
        subject: `New enquiry — ${lead.name}`,
        text: [
          `Name: ${lead.name}`,
          `Email: ${lead.email}`,
          `Company: ${lead.company ?? "—"}`,
          `Service: ${lead.service ?? "—"}`,
          `Budget: ${lead.budget ?? "—"}`,
          "",
          lead.message,
        ].join("\n"),
      }),
    });
  } catch (err) {
    // Don't fail the submission if email delivery hiccups.
    console.error("[contact] email notify failed", err);
  }
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and project details are required." },
      { status: 422 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 422 },
    );
  }

  const lead = {
    name,
    email,
    company: body.company?.trim() || null,
    service: body.service?.trim() || null,
    budget: body.budget?.trim() || null,
    message,
  };

  try {
    await db.insert(contactSubmissions).values(lead);
  } catch (err) {
    console.error("[contact] failed to save submission", err);
    return NextResponse.json(
      { error: "Something went wrong. Please email us directly." },
      { status: 500 },
    );
  }

  // Fire-and-forget email; never blocks the success response.
  void notifyByEmail(lead);

  return NextResponse.json({ ok: true });
}
