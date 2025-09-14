# Apply RLS Policies

Please run the following SQL in your Supabase SQL Editor to enable Row Level Security:

```sql
-- Enable RLS on critical user-sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enrollments policies
CREATE POLICY "Users can view own enrollments" ON enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments" ON enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments" ON enrollments
    FOR UPDATE USING (auth.uid() = user_id);

-- Test attempts policies
CREATE POLICY "Users can view own test attempts" ON test_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own test attempts" ON test_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test attempts" ON test_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Question responses policies
CREATE POLICY "Users can view own responses" ON question_responses
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM test_attempts WHERE id = attempt_id)
    );

CREATE POLICY "Users can create own responses" ON question_responses
    FOR INSERT WITH CHECK (
        auth.uid() = (SELECT user_id FROM test_attempts WHERE id = attempt_id)
    );

-- Module progress policies
CREATE POLICY "Users can view own progress" ON module_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON module_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON module_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view own files" ON files
    FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can upload own files" ON files
    FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own files" ON files
    FOR UPDATE USING (auth.uid() = owner_user_id);

-- AI feedback policies
CREATE POLICY "Users can view own ai feedback" ON ai_feedback
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM test_attempts WHERE id = test_attempt_id)
    );

-- Speaking sessions policies
CREATE POLICY "Users can view own speaking sessions" ON speaking_sessions
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = tutor_id);

CREATE POLICY "Users can create own speaking sessions" ON speaking_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transcripts policies
CREATE POLICY "Users can view own transcripts" ON transcripts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transcripts" ON transcripts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (for users with admin/super_admin roles)
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Public read policies for published content
CREATE POLICY "Anyone can view published courses" ON courses
    FOR SELECT USING (published = true);

CREATE POLICY "Anyone can view modules of published courses" ON modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE id = course_id AND published = true
        )
    );

CREATE POLICY "Anyone can view lessons of published courses" ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN modules m ON m.course_id = c.id
            WHERE m.id = module_id AND c.published = true
        )
    );

-- Instructor policies
CREATE POLICY "Instructors can manage own courses" ON courses
    FOR ALL USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('instructor', 'admin', 'super_admin')
        )
    );
```

After running this, your database will have proper Row Level Security enabled!
