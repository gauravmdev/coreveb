CREATE TABLE "proposal_section" (
	"id" text PRIMARY KEY NOT NULL,
	"quotation_id" text NOT NULL,
	"heading" text NOT NULL,
	"body" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "quotation" ADD COLUMN "tax_label" text DEFAULT 'GST' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposal_section" ADD CONSTRAINT "proposal_section_quotation_id_quotation_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotation"("id") ON DELETE cascade ON UPDATE no action;