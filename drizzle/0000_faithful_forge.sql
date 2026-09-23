CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'visible' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comments_post_created` ON `comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_user_created` ON `comments` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `likes` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`post_id`, `user_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`kind` text NOT NULL,
	`category` text NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`media_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_posts_status_created` ON `posts` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `views` (
	`post_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`day` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`post_id`, `visitor_id`, `day`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_views_day` ON `views` (`day`);--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`preview_until` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`visitor_id` text NOT NULL,
	`day` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`visitor_id`, `day`)
);
--> statement-breakpoint
CREATE INDEX `idx_visits_day` ON `visits` (`day`);