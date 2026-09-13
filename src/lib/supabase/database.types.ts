/**
 * Types for the schema in supabase/migrations/.
 *
 * Hand-maintained, deliberately. Two things to know:
 *
 * 1. When you change a migration, change this file in the same commit.
 *    Once you have the Supabase CLI linked to your project you can replace it
 *    wholesale with:
 *      npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 *
 * 2. The status columns are CHECK constraints rather than Postgres enums, so
 *    the generator would emit `string` for them. They are narrowed to unions
 *    here on purpose — a typo in `status: 'complete'` should not reach the
 *    database. If you regenerate, re-apply that narrowing.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GoalHorizon = "short_term" | "long_term";
export type GoalStatus = "active" | "completed" | "abandoned";
export type MessageRole = "user" | "assistant";
export type ProgressStatus = "done" | "partial" | "skipped";
export type PivotOutcome = "pivoted" | "stayed" | "undecided";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          why: string | null;
          horizon: GoalHorizon;
          duration_weeks: number | null;
          starts_on: string;
          ends_on: string | null;
          status: GoalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          why?: string | null;
          horizon: GoalHorizon;
          duration_weeks?: number | null;
          starts_on?: string;
          ends_on?: string | null;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          why?: string | null;
          horizon?: GoalHorizon;
          duration_weeks?: number | null;
          starts_on?: string;
          ends_on?: string | null;
          status?: GoalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      commitments: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          title: string;
          target_per_week: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          title: string;
          target_per_week?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          title?: string;
          target_per_week?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entry_date?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      check_in_messages: {
        Row: {
          id: string;
          user_id: string;
          check_in_id: string;
          role: MessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          check_in_id: string;
          role: MessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          check_in_id?: string;
          role?: MessageRole;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      commitment_progress: {
        Row: {
          id: string;
          user_id: string;
          commitment_id: string;
          check_in_id: string;
          status: ProgressStatus;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          commitment_id: string;
          check_in_id: string;
          status: ProgressStatus;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          commitment_id?: string;
          check_in_id?: string;
          status?: ProgressStatus;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pivot_requests: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          answers: Json;
          reflection: string | null;
          outcome: PivotOutcome | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          answers?: Json;
          reflection?: string | null;
          outcome?: PivotOutcome | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          answers?: Json;
          reflection?: string | null;
          outcome?: PivotOutcome | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];

/** Row type for a table: `Tables<"goals">`. */
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

/** Insert type for a table: `TablesInsert<"goals">`. */
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

/** Update type for a table: `TablesUpdate<"goals">`. */
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Goal = Tables<"goals">;
export type Commitment = Tables<"commitments">;
export type CheckIn = Tables<"check_ins">;
export type CheckInMessage = Tables<"check_in_messages">;
export type CommitmentProgress = Tables<"commitment_progress">;
export type PivotRequest = Tables<"pivot_requests">;
