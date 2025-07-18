export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      oracle_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          last_message_at: string
          message_count: number
          is_active: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
          message_count?: number
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
          message_count?: number
          is_active?: boolean
          metadata?: Json
        }
      }
      oracle_messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          content: string
          role: 'user' | 'assistant' | 'system'
          created_at: string
          updated_at: string
          audio_url: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          content: string
          role: 'user' | 'assistant' | 'system'
          created_at?: string
          updated_at?: string
          audio_url?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          content?: string
          role?: 'user' | 'assistant' | 'system'
          created_at?: string
          updated_at?: string
          audio_url?: string | null
          metadata?: Json
        }
      }
      oracle_settings: {
        Row: {
          id: string
          user_id: string
          setting_type: 'appearance' | 'behavior' | 'voice' | 'context' | 'tools' | 'advanced'
          settings_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          setting_type: 'appearance' | 'behavior' | 'voice' | 'context' | 'tools' | 'advanced'
          settings_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          setting_type?: 'appearance' | 'behavior' | 'voice' | 'context' | 'tools' | 'advanced'
          settings_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: string
          vote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          type: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          type?: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      community_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      post_votes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          vote_type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          vote_type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      posts_with_users: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: string
          vote_count: number
          created_at: string
          updated_at: string
          user_email: string | null
          user_full_name: string | null
        }
      }
    }
    Functions: {
      update_post_vote_count: {
        Args: {
          post_id: string
          vote_change: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 