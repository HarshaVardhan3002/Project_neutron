-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  tokens_used integer DEFAULT 0,
  model_used text DEFAULT 'gemini-pro'::text,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ai_chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.ai_chat_sessions(id)
);
CREATE TABLE public.ai_chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  context_type text DEFAULT 'general'::text,
  context_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT ai_chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT ai_chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.ai_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_attempt_id uuid UNIQUE,
  model_name text,
  model_version text,
  prompt_snapshot text,
  score_breakdown jsonb,
  suggestions jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT ai_feedback_test_attempt_id_fkey FOREIGN KEY (test_attempt_id) REFERENCES public.test_attempts(id)
);
CREATE TABLE public.ai_test_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_attempt_id uuid NOT NULL,
  user_id uuid NOT NULL,
  analysis_type text DEFAULT 'performance'::text,
  analysis_content jsonb NOT NULL,
  suggestions jsonb DEFAULT '[]'::jsonb,
  model_used text DEFAULT 'gemini-pro'::text,
  tokens_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT ai_test_analysis_pkey PRIMARY KEY (id),
  CONSTRAINT ai_test_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT ai_test_analysis_test_attempt_id_fkey FOREIGN KEY (test_attempt_id) REFERENCES public.test_attempts(id)
);
CREATE TABLE public.ai_usage (
  id bigint NOT NULL DEFAULT nextval('ai_usage_id_seq'::regclass),
  user_id uuid,
  model text,
  tokens_used bigint,
  cost_cents bigint,
  recorded_at timestamp with time zone DEFAULT now(),
  metadata jsonb,
  CONSTRAINT ai_usage_pkey PRIMARY KEY (id),
  CONSTRAINT ai_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_id uuid,
  lesson_id uuid,
  due_at timestamp with time zone,
  points numeric,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assignments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tutor_id uuid,
  user_id uuid,
  course_id uuid,
  lesson_id uuid,
  status USER-DEFINED DEFAULT 'requested'::booking_status,
  scheduled_for timestamp with time zone,
  duration_minutes integer,
  price_cents bigint,
  payment_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT bookings_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT bookings_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutors(id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT bookings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid,
  related_type text,
  related_id uuid,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  title text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT calendar_events_pkey PRIMARY KEY (id),
  CONSTRAINT calendar_events_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid,
  title text NOT NULL,
  short_description text,
  full_description text,
  test_type text,
  difficulty text,
  thumbnail_s3_key text,
  language text DEFAULT 'en'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.embeddings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_type text,
  item_id uuid,
  vector text,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT embeddings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  plan USER-DEFINED DEFAULT 'trial'::plan_tier,
  status USER-DEFINED DEFAULT 'active'::enrollment_status,
  started_at timestamp with time zone DEFAULT now(),
  ends_at timestamp with time zone,
  trial_ends_at timestamp with time zone,
  progress_percent numeric DEFAULT 0,
  last_accessed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  s3_key text NOT NULL,
  owner_user_id uuid,
  kind USER-DEFINED,
  filename text,
  mime_type text,
  size_bytes bigint,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid,
  invoice_number text UNIQUE,
  issued_at timestamp with time zone DEFAULT now(),
  pdf_s3_key text,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  title text NOT NULL,
  kind USER-DEFINED NOT NULL,
  description text,
  content_s3_key text,
  duration_seconds integer,
  order_index integer DEFAULT 0,
  extra jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.live_class_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid,
  title text,
  presenter_user_id uuid,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  meeting_url text,
  recording_s3_key text,
  capacity integer,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT live_class_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT live_class_sessions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT live_class_sessions_presenter_user_id_fkey FOREIGN KEY (presenter_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.module_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL,
  course_id uuid NOT NULL,
  completed boolean DEFAULT false,
  completion_score numeric,
  last_attempt_at timestamp with time zone,
  attempts_count integer DEFAULT 0,
  unlocked_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT module_progress_pkey PRIMARY KEY (id),
  CONSTRAINT module_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT module_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT module_progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  unlock_condition jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text,
  body text,
  type text,
  payload jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  amount_cents bigint NOT NULL,
  currency character DEFAULT 'INR'::bpchar,
  method USER-DEFINED,
  provider_payment_id text,
  status USER-DEFINED DEFAULT 'pending'::payment_status,
  description text,
  receipt_s3_key text,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text,
  first_name text,
  last_name text,
  phone text,
  role USER-DEFINED DEFAULT 'student'::user_role,
  locale text DEFAULT 'en'::text,
  timezone text DEFAULT 'Asia/Kolkata'::text,
  bio text,
  avatar_s3_key text,
  country text,
  date_of_birth date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.question_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  option_text text,
  is_correct boolean DEFAULT false,
  order_index integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT question_options_pkey PRIMARY KEY (id),
  CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.question_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer jsonb,
  is_correct boolean,
  points_awarded numeric DEFAULT 0,
  grader_id uuid,
  graded_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT question_responses_pkey PRIMARY KEY (id),
  CONSTRAINT question_responses_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.test_attempts(id),
  CONSTRAINT question_responses_grader_id_fkey FOREIGN KEY (grader_id) REFERENCES public.profiles(id),
  CONSTRAINT question_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid,
  stem text NOT NULL,
  kind USER-DEFINED NOT NULL,
  points numeric DEFAULT 1,
  order_index integer DEFAULT 0,
  media_file_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT fk_questions_media_file FOREIGN KEY (media_file_id) REFERENCES public.files(id),
  CONSTRAINT questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.refunds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid,
  amount_cents bigint,
  reason text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT refunds_pkey PRIMARY KEY (id),
  CONSTRAINT refunds_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id)
);
CREATE TABLE public.speaking_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tutor_id uuid,
  lesson_id uuid,
  is_ai boolean DEFAULT true,
  audio_s3_key text,
  transcript_id uuid,
  ai_feedback_id uuid,
  human_feedback jsonb,
  status USER-DEFINED DEFAULT 'requested'::booking_status,
  scheduled_at timestamp with time zone,
  duration_seconds integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT speaking_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT speaking_sessions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT fk_speaking_sessions_transcript FOREIGN KEY (transcript_id) REFERENCES public.transcripts(id),
  CONSTRAINT speaking_sessions_ai_feedback_id_fkey FOREIGN KEY (ai_feedback_id) REFERENCES public.ai_feedback(id),
  CONSTRAINT speaking_sessions_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.profiles(id),
  CONSTRAINT speaking_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  user_id uuid,
  submitted_at timestamp with time zone DEFAULT now(),
  file_id uuid,
  text_submission text,
  grade numeric,
  grader_id uuid,
  feedback text,
  graded_at timestamp with time zone,
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT submissions_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.files(id),
  CONSTRAINT submissions_grader_id_fkey FOREIGN KEY (grader_id) REFERENCES public.profiles(id),
  CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id)
);
CREATE TABLE public.system_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level text NOT NULL,
  message text NOT NULL,
  user_id uuid,
  action text,
  resource_type text,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT system_logs_pkey PRIMARY KEY (id),
  CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.system_settings (
  key text NOT NULL,
  value jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.test_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL,
  user_id uuid NOT NULL,
  started_at timestamp with time zone DEFAULT now(),
  submitted_at timestamp with time zone,
  status USER-DEFINED DEFAULT 'in_progress'::attempt_status,
  total_score numeric DEFAULT 0,
  max_score numeric DEFAULT 0,
  duration_seconds integer,
  review jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT test_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT test_attempts_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id),
  CONSTRAINT test_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  module_id uuid,
  title text NOT NULL,
  kind USER-DEFINED NOT NULL,
  time_limit_seconds integer,
  passing_score numeric DEFAULT 60.00,
  allowed_attempts integer,
  randomized boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT tests_pkey PRIMARY KEY (id),
  CONSTRAINT tests_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT tests_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT tests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.themes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  occasion text DEFAULT 'default'::text,
  colors jsonb NOT NULL,
  is_active boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT themes_pkey PRIMARY KEY (id),
  CONSTRAINT themes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.transcripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lesson_id uuid,
  user_id uuid,
  s3_transcript_key text,
  raw_text text,
  language text,
  confidence numeric,
  duration_seconds integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transcripts_pkey PRIMARY KEY (id),
  CONSTRAINT transcripts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT transcripts_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.tutor_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tutor_id uuid,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  recurring_rule text,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT tutor_availability_pkey PRIMARY KEY (id),
  CONSTRAINT tutor_availability_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutors(id)
);
CREATE TABLE public.tutors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  headline text,
  hourly_rate_cents bigint,
  rating numeric,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT tutors_pkey PRIMARY KEY (id),
  CONSTRAINT tutors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider text,
  payload jsonb,
  processed boolean DEFAULT false,
  received_at timestamp with time zone DEFAULT now(),
  CONSTRAINT webhooks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.website_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  content jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT website_content_pkey PRIMARY KEY (id),
  CONSTRAINT website_content_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);