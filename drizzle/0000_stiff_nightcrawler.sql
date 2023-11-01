DO $$ BEGIN
 CREATE TYPE "Badges" AS ENUM('SHINEX_ADMIN', 'SHINEX_STAFF', 'APPEAL_STAFF', 'REPORT_STAFF', 'MEMBER', 'EARLYSUPPORTER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "NotificationType" AS ENUM('VOUCH.RECEIVED', 'VOUCH.APPROVED', 'VOUCH.DENIED', 'VOUCH.PROOF_REQUEST');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ProfileStatus" AS ENUM('DEAL_WITH_CAUTION', 'BLACKLISTED_AND_DEAL_WITH_CAUTION', 'SCAMMER', 'BLOCKED', 'BLACKLISTED', 'GOOD');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "Role" AS ENUM('USER', 'REPORT_STAFF', 'MODERATOR', 'ADMIN', 'OWNER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "VouchStatus" AS ENUM('DENIED', 'DENIED_FOR_PROOF', 'APPROVED', 'APPROVED_WITH_PROOF', 'PENDING_PROOF_RECEIVER', 'PENDING_PROOF_VOUCHER', 'UNCHECKED', 'DELETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "license" (
	"id" serial PRIMARY KEY NOT NULL,
	"client" text NOT NULL,
	"key" text NOT NULL,
	"secret" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"vouchId" integer NOT NULL,
	"client" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notificationSettings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"vouchReceived" boolean DEFAULT true NOT NULL,
	"vouchApproved" boolean DEFAULT true NOT NULL,
	"vouchDenied" boolean DEFAULT true NOT NULL,
	"vouchProofRequest" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notificationSettings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"username" text NOT NULL,
	"customAvatar" text,
	"role" "Role" DEFAULT 'USER' NOT NULL,
	"profileStatus" "ProfileStatus" DEFAULT 'GOOD' NOT NULL,
	"warning" json DEFAULT '{}'::json NOT NULL,
	"mark" json DEFAULT '{}'::json NOT NULL,
	"color" integer,
	"shop" text DEFAULT 'Set your shop',
	"forum" text DEFAULT 'Set your forum',
	"products" text DEFAULT 'Set your products',
	"banner" text DEFAULT '',
	"positiveVouches" integer DEFAULT 0 NOT NULL,
	"importedVouches" integer DEFAULT 0 NOT NULL,
	"latestComments" text DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"badges" text,
	"alternative" text DEFAULT '' NOT NULL,
	CONSTRAINT "Profile_id_unique" UNIQUE("id"),
	CONSTRAINT "Profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Vouch" (
	"id" serial PRIMARY KEY NOT NULL,
	"vouchStatus" "VouchStatus" DEFAULT 'UNCHECKED' NOT NULL,
	"voucherId" text NOT NULL,
	"voucherName" text NOT NULL,
	"receiverId" text NOT NULL,
	"receiverName" text NOT NULL,
	"comment" text NOT NULL,
	"serverId" text NOT NULL,
	"serverName" text NOT NULL,
	"customData" json,
	"deniedReason" text,
	"activities" json[],
	"client" text DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "userId" ON "Profile" ("userId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notificationSettings" ADD CONSTRAINT "notificationSettings_userId_Profile_userId_fk" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
