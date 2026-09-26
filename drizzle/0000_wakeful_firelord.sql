CREATE TABLE "collections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "collections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"category" varchar(80) NOT NULL,
	"description" text NOT NULL,
	"finish" varchar(80) NOT NULL,
	"imageUrl" text NOT NULL,
	"isFeatured" integer DEFAULT 1 NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isVisible" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enquiries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"email" varchar(180) NOT NULL,
	"phone" varchar(60) NOT NULL,
	"projectType" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finishes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "finishes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"tagline" varchar(240) NOT NULL,
	"description" text NOT NULL,
	"badge" varchar(80) NOT NULL,
	"imageUrl" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isVisible" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(140) NOT NULL,
	"location" varchar(120) NOT NULL,
	"year" varchar(20) NOT NULL,
	"imageUrl" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isVisible" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"imageUrl" text NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"isVisible" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sectionVisibility" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sectionVisibility_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sectionKey" varchar(60) NOT NULL,
	"isVisible" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "sectionVisibility_sectionKey_unique" UNIQUE("sectionKey")
);
--> statement-breakpoint
CREATE TABLE "siteContent" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "siteContent_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"brandName" varchar(140) NOT NULL,
	"tagline" varchar(240) NOT NULL,
	"heroEyebrow" varchar(160) NOT NULL,
	"heroTitle" varchar(240) NOT NULL,
	"heroCopy" text NOT NULL,
	"aboutTitle" varchar(180) NOT NULL,
	"aboutCopy" text NOT NULL,
	"phone" varchar(60) NOT NULL,
	"whatsapp" varchar(60) NOT NULL,
	"email" varchar(180) NOT NULL,
	"address" text NOT NULL,
	"hours" varchar(160) NOT NULL,
	"heroImage" text NOT NULL,
	"heroImage2" text DEFAULT '/images/hero-quarry.jpg',
	"aboutImage" text NOT NULL,
	"logoImage" text NOT NULL,
	"heroSubtext" text DEFAULT 'Premium Indian granite products manufactured and prepared for international markets.',
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" varchar(16) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
