CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" varchar UNIQUE,
  "first_name" varchar,
  "last_name" varchar,
  "profile_image_url" varchar,
  "profession" text,
  "expertise" text,
  "company" text,
  "investment_interests" text[],
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "biography" text,
  "investment_goals" text[],
  "preferred_investment_range" text,
  "expertise_tags" text[],
  "risk_appetite" text,
  "persona_segments" text[],
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "feedback" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "project_id" text NOT NULL,
  "feedback_text" text NOT NULL,
  "expertise" text,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "page_interactions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "page_path" text NOT NULL,
  "section_id" text,
  "interaction_type" text NOT NULL,
  "duration" integer,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "interaction_events" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "event_type" text NOT NULL,
  "context" text,
  "payload" jsonb,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "feedback_transcripts" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "feedback_id" varchar REFERENCES "feedback"("id"),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "project_id" text NOT NULL,
  "transcript" text NOT NULL,
  "audio_url" text,
  "confidence" integer,
  "language" text DEFAULT 'en',
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tavakiev_sources" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" varchar NOT NULL,
  "heading" text NOT NULL,
  "summary" text,
  "body" text,
  "citation" text,
  "data" jsonb,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_reports" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "report_content" text NOT NULL,
  "recommended_projects" text[],
  "insights" jsonb,
  "email_sent" boolean DEFAULT false,
  "email_sent_at" timestamp,
  "created_at" timestamp DEFAULT now()
);
