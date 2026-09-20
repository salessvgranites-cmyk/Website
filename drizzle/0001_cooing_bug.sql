CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`finish` varchar(80) NOT NULL,
	`imageUrl` text NOT NULL,
	`isFeatured` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(180) NOT NULL,
	`phone` varchar(60) NOT NULL,
	`projectType` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`status` varchar(30) NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(140) NOT NULL,
	`location` varchar(120) NOT NULL,
	`year` varchar(20) NOT NULL,
	`imageUrl` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	CONSTRAINT `gallery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandName` varchar(140) NOT NULL,
	`tagline` varchar(240) NOT NULL,
	`heroEyebrow` varchar(160) NOT NULL,
	`heroTitle` varchar(240) NOT NULL,
	`heroCopy` text NOT NULL,
	`aboutTitle` varchar(180) NOT NULL,
	`aboutCopy` text NOT NULL,
	`phone` varchar(60) NOT NULL,
	`whatsapp` varchar(60) NOT NULL,
	`email` varchar(180) NOT NULL,
	`address` text NOT NULL,
	`hours` varchar(160) NOT NULL,
	`heroImage` text NOT NULL,
	`aboutImage` text NOT NULL,
	`logoImage` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(16) NOT NULL DEFAULT 'user';