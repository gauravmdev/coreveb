import { getContactSettings } from "@/lib/queries";
import { Field, Panel, Submit, inputCls } from "@/components/app/form";
import { PageHeader } from "@/components/app/ui";
import { updateContactSettings } from "@/app/admin/actions";

export default async function AdminSettings() {
  const contact = await getContactSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Contact details shown on the website, footer, and the floating WhatsApp button."
      />

      <div className="max-w-lg">
        <Panel title="Contact details">
          <form action={updateContactSettings} className="space-y-4">
            <Field label="WhatsApp number">
              <input
                name="whatsapp"
                defaultValue={contact.whatsapp}
                className={inputCls}
                placeholder="917905784798"
                inputMode="numeric"
              />
            </Field>
            <p className="-mt-2 text-xs text-muted">
              Digits only, including country code (no +, spaces, or dashes). Used for
              the wa.me chat links.
            </p>
            <Field label="Display phone">
              <input
                name="phone"
                defaultValue={contact.phone}
                className={inputCls}
                placeholder="+91 79057 84798"
              />
            </Field>
            <Field label="Contact email">
              <input
                name="email"
                type="email"
                defaultValue={contact.email}
                className={inputCls}
                placeholder="hello@coreveb.com"
              />
            </Field>
            <Submit>Save settings</Submit>
          </form>
        </Panel>
      </div>
    </div>
  );
}
