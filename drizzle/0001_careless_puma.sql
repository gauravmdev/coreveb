CREATE TABLE `quotation_item` (
	`id` text PRIMARY KEY NOT NULL,
	`quotation_id` text NOT NULL,
	`description` text NOT NULL,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`quotation_id`) REFERENCES `quotation`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quotation` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`deal_id` text,
	`number` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`project_type` text DEFAULT 'web' NOT NULL,
	`tax_rate` real DEFAULT 0 NOT NULL,
	`terms` text,
	`valid_until` integer,
	`created_project_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deal`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE set null
);
