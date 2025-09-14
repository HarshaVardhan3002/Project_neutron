/**
 * @fileoverview Supabase client configuration for Project Neutron LMS
 * Provides authentication and database access through Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cfaxcledtqenebxunxpf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYXhjbGVkdHFlbmVieHVueHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDI3OTQsImV4cCI6MjA3MzI3ODc5NCJ9.ND8MgiXclpoqrWdtLI_2scIVFpmHOLeY5ok0pijXx4Y';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types (will be generated from Supabase later)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: 'student' | 'instructor' | 'admin' | 'super_admin';
          locale: string;
          timezone: string;
          bio: string | null;
          avatar_s3_key: string | null;
          country: string | null;
          date_of_birth: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          metadata: any;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'student' | 'instructor' | 'admin' | 'super_admin';
          locale?: string;
          timezone?: string;
          bio?: string | null;
          avatar_s3_key?: string | null;
          country?: string | null;
          date_of_birth?: string | null;
          metadata?: any;
        };
        Update: {
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: 'student' | 'instructor' | 'admin' | 'super_admin';
          locale?: string;
          timezone?: string;
          bio?: string | null;
          avatar_s3_key?: string | null;
          country?: string | null;
          date_of_birth?: string | null;
          metadata?: any;
        };
      };
      courses: {
        Row: {
          id: string;
          org_id: string | null;
          title: string;
          short_description: string | null;
          full_description: string | null;
          test_type: string | null;
          difficulty: string | null;
          thumbnail_s3_key: string | null;
          language: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          published: boolean;
          metadata: any;
        };
        Insert: {
          org_id?: string | null;
          title: string;
          short_description?: string | null;
          full_description?: string | null;
          test_type?: string | null;
          difficulty?: string | null;
          thumbnail_s3_key?: string | null;
          language?: string;
          created_by?: string | null;
          published?: boolean;
          metadata?: any;
        };
        Update: {
          title?: string;
          short_description?: string | null;
          full_description?: string | null;
          test_type?: string | null;
          difficulty?: string | null;
          thumbnail_s3_key?: string | null;
          language?: string;
          published?: boolean;
          metadata?: any;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          plan: 'free' | 'trial' | 'ai_tutor' | 'human_tutor' | 'hybrid';
          status: 'active' | 'paused' | 'completed' | 'cancelled' | 'trial' | 'expired';
          started_at: string;
          ends_at: string | null;
          trial_ends_at: string | null;
          progress_percent: number;
          last_accessed_at: string | null;
          metadata: any;
        };
        Insert: {
          user_id: string;
          course_id: string;
          plan?: 'free' | 'trial' | 'ai_tutor' | 'human_tutor' | 'hybrid';
          status?: 'active' | 'paused' | 'completed' | 'cancelled' | 'trial' | 'expired';
          ends_at?: string | null;
          trial_ends_at?: string | null;
          progress_percent?: number;
          last_accessed_at?: string | null;
          metadata?: any;
        };
        Update: {
          plan?: 'free' | 'trial' | 'ai_tutor' | 'human_tutor' | 'hybrid';
          status?: 'active' | 'paused' | 'completed' | 'cancelled' | 'trial' | 'expired';
          ends_at?: string | null;
          trial_ends_at?: string | null;
          progress_percent?: number;
          last_accessed_at?: string | null;
          metadata?: any;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];