CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`link_id` text NOT NULL,
	`clicked_at` text NOT NULL,
	`day` text NOT NULL,
	`country` text DEFAULT 'XX' NOT NULL,
	`device` text NOT NULL,
	`browser` text NOT NULL,
	`referrer` text DEFAULT '' NOT NULL,
	`source` text NOT NULL,
	`channel` text DEFAULT '' NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`trigger` text NOT NULL,
	`bot` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_link_date_idx` ON `events` (`link_id`,`clicked_at`);--> statement-breakpoint
CREATE INDEX `events_date_idx` ON `events` (`clicked_at`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`destination` text NOT NULL,
	`channel` text DEFAULT '' NOT NULL,
	`medium` text DEFAULT '' NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `links_slug_unique` ON `links` (`slug`);--> statement-breakpoint
CREATE INDEX `links_owner_idx` ON `links` (`owner`);