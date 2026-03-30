CREATE TABLE "constructor_standings" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"position" integer NOT NULL,
	"points" real NOT NULL,
	"wins" integer NOT NULL,
	"constructor_id" text NOT NULL,
	"constructor_name" text NOT NULL,
	"nationality" text
);
--> statement-breakpoint
CREATE TABLE "driver_standings" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"position" integer NOT NULL,
	"points" real NOT NULL,
	"wins" integer NOT NULL,
	"driver_id" text NOT NULL,
	"driver_code" text,
	"driver_number" text,
	"given_name" text NOT NULL,
	"family_name" text NOT NULL,
	"nationality" text,
	"constructor_id" text,
	"constructor_name" text
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_key" integer NOT NULL,
	"driver_number" integer NOT NULL,
	"broadcast_name" text,
	"full_name" text,
	"name_acronym" text,
	"team_name" text,
	"team_colour" text,
	"headshot_url" text
);
--> statement-breakpoint
CREATE TABLE "laps" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_key" integer NOT NULL,
	"driver_number" integer NOT NULL,
	"lap_number" integer NOT NULL,
	"lap_duration" real,
	"sector_1" real,
	"sector_2" real,
	"sector_3" real,
	"i1_speed" real,
	"i2_speed" real,
	"st_speed" real,
	"is_pit_out_lap" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pit_stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_key" integer NOT NULL,
	"driver_number" integer NOT NULL,
	"lap_number" integer NOT NULL,
	"pit_duration" real,
	"date" text
);
--> statement-breakpoint
CREATE TABLE "qualifying_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"round" integer NOT NULL,
	"position" integer,
	"driver_id" text NOT NULL,
	"driver_code" text,
	"given_name" text,
	"family_name" text,
	"constructor_id" text,
	"constructor_name" text,
	"q1" text,
	"q2" text,
	"q3" text
);
--> statement-breakpoint
CREATE TABLE "race_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"round" integer NOT NULL,
	"position" integer,
	"position_text" text,
	"points" real,
	"grid" integer,
	"laps" integer,
	"status" text,
	"time" text,
	"milliseconds" integer,
	"fastest_lap_rank" integer,
	"fastest_lap_lap" integer,
	"fastest_lap_time" text,
	"driver_id" text NOT NULL,
	"driver_code" text,
	"given_name" text,
	"family_name" text,
	"constructor_id" text,
	"constructor_name" text
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" text NOT NULL,
	"round" integer NOT NULL,
	"race_name" text NOT NULL,
	"circuit_id" text NOT NULL,
	"circuit_name" text NOT NULL,
	"locality" text,
	"country" text,
	"date" text NOT NULL,
	"time" text,
	"fp1_date" text,
	"fp1_time" text,
	"fp2_date" text,
	"fp2_time" text,
	"fp3_date" text,
	"fp3_time" text,
	"qualy_date" text,
	"qualy_time" text,
	"sprint_date" text,
	"sprint_time" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_key" integer PRIMARY KEY NOT NULL,
	"session_name" text NOT NULL,
	"session_type" text,
	"meeting_key" integer,
	"circuit_short_name" text,
	"country_name" text,
	"date_start" text,
	"date_end" text,
	"year" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stints" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_key" integer NOT NULL,
	"driver_number" integer NOT NULL,
	"stint_number" integer NOT NULL,
	"compound" text,
	"lap_start" integer,
	"lap_end" integer,
	"tyre_age_at_start" integer
);
--> statement-breakpoint
CREATE TABLE "sync_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity" text NOT NULL,
	"key" text NOT NULL,
	"synced_at" text NOT NULL
);
