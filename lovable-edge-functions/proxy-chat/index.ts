// Edge function to proxy chat messages to your Cursor backend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's creature
    const { data: creature, error: creatureError } = await supabaseClient
      .from('creatures')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (creatureError || !creature) {
      return new Response(
        JSON.stringify({ error: 'Creature not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Forward request to your Cursor backend
    const backendUrl = Deno.env.get('CURSOR_BACKEND_URL') || 'http://localhost:3000'
    const backendResponse = await fetch(`${backendUrl}/api/lovable/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('CURSOR_BACKEND_JWT_SECRET')}`,
      },
      body: JSON.stringify({
        message,
        userId: user.id,
        creatureId: creature.id,
        currentStage: creature.current_stage,
        moodScore: creature.mood_score,
        currentXP: creature.xp || 0,
        personality: creature.personality_profile,
        visualTraits: creature.visual_traits
      })
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const backendData = await backendResponse.json()

    if (!backendData.success) {
      throw new Error(backendData.error || 'Backend processing failed')
    }

    // Save chat memory to Supabase
    const { error: memoryError } = await supabaseClient
      .from('chat_memories')
      .insert({
        creature_id: creature.id,
        user_id: user.id,
        message,
        response: backendData.data.conversation.response,
        sentiment_score: backendData.data.conversation.sentimentScore,
        mood_score: backendData.data.creature.moodScore,
        keywords: backendData.data.keywords || []
      })

    if (memoryError) {
      console.error('Failed to save chat memory:', memoryError)
    }

    // Update creature state
    const { error: updateError } = await supabaseClient
      .from('creatures')
      .update({
        mood_score: backendData.data.creature.moodScore,
        xp: backendData.data.creature.xp,
        daily_chat_count: creature.daily_chat_count + 1,
        last_chat_date: new Date().toISOString(),
        total_chats: creature.total_chats + 1,
        user_keywords: [...new Set([...creature.user_keywords, ...(backendData.data.keywords || [])])]
      })
      .eq('id', creature.id)

    if (updateError) {
      console.error('Failed to update creature:', updateError)
    }

    // Return response to frontend
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          conversation: backendData.data.conversation,
          creature: {
            ...creature,
            moodScore: backendData.data.creature.moodScore,
            xp: backendData.data.creature.xp
          },
          keywords: backendData.data.keywords
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in proxy-chat:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
