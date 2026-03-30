import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  onboarding_completed: boolean
  tier: 'free' | 'premium'
  created_at: string
}

export interface HealthProfile {
  id: string
  user_id: string
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  blood_type: string | null
  existing_conditions: string[]
  allergies: string[]
  current_medications: string[]
  smoking_status: string | null
  alcohol_consumption: string | null
  exercise_frequency: string | null
  primary_health_goal: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  topic: string | null
  created_at: string
  updated_at: string
}

export interface ConversationMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ─── Profile helpers ──────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  const { error } = await supabase
    .from('profiles')
    .upsert(profile)
  return { error }
}

// ─── Health profile helpers ───────────────────────────────────────────────────

export async function getHealthProfile(userId: string): Promise<HealthProfile | null> {
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function upsertHealthProfile(profile: Partial<HealthProfile> & { user_id: string }) {
  const { data, error } = await supabase
    .from('health_profiles')
    .upsert({ ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single()
  return { data, error }
}

// ─── Conversation helpers ─────────────────────────────────────────────────────

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) return []
  return data
}

export async function createConversation(userId: string, title: string, topic?: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title, topic: topic ?? null })
    .select()
    .single()
  if (error) return null
  return data
}

export async function updateConversationTitle(id: string, title: string) {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id)
  return { error }
}

export async function deleteConversation(id: string) {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
  return { error }
}

export async function getMessages(conversationId: string): Promise<ConversationMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<ConversationMessage | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single()
  // Update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
  if (error) return null
  return data
}
