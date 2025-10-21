// Edge function to sync creature state with your Cursor backend
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

    const method = req.method

    if (method === 'GET') {
      // Get creature state
      const { data: creature, error: creatureError } = await supabaseClient
        .from('creatures')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (creatureError) {
        if (creatureError.code === 'PGRST116') {
          // Creature doesn't exist, create one
          return await createNewCreature(supabaseClient, user.id)
        }
        throw creatureError
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: { creature }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (method === 'POST') {
      // Update creature state (from backend)
      const { creatureId, updates } = await req.json()

      const { data: creature, error: updateError } = await supabaseClient
        .from('creatures')
        .update(updates)
        .eq('id', creatureId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: { creature }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in sync-creature:', error)
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

async function createNewCreature(supabaseClient: any, userId: string) {
  try {
    // Call your Cursor backend to generate personality and visual traits
    const backendUrl = Deno.env.get('CURSOR_BACKEND_URL') || 'http://localhost:3000'
    const backendResponse = await fetch(`${backendUrl}/api/creature/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('CURSOR_BACKEND_JWT_SECRET')}`,
      },
      body: JSON.stringify({ userId })
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`)
    }

    const backendData = await backendResponse.json()

    if (!backendData.success) {
      throw new Error(backendData.error || 'Failed to create creature')
    }

    // Create creature in Supabase with backend data
    const { data: creature, error: createError } = await supabaseClient
      .from('creatures')
      .insert({
        user_id: userId,
        current_stage: 'HATCHLING',
        personality_profile: backendData.data.personality,
        energy: backendData.data.personality.energy,
        tone: backendData.data.personality.tone,
        bond_type: backendData.data.personality.bondType,
        favorite_words: backendData.data.personality.favoriteWords,
        user_keywords: backendData.data.personality.userKeywords,
        evolution_path_variant: backendData.data.personality.evolutionPathVariant,
        visual_traits: backendData.data.visualTraits,
        horn_type: backendData.data.visualTraits.hornType,
        fur_color: backendData.data.visualTraits.furColor,
        eye_style: backendData.data.visualTraits.eyeStyle,
        tail_type: backendData.data.visualTraits.tailType,
        aura_effect: backendData.data.visualTraits.auraEffect,
        accessory: backendData.data.visualTraits.accessory
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { creature }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating creature:', error)
    
    // Fallback: create basic creature without backend
    const { data: creature, error: createError } = await supabaseClient
      .from('creatures')
      .insert({
        user_id: userId,
        current_stage: 'HATCHLING',
        personality_profile: {
          energy: 'medium',
          tone: 'playful',
          bondType: 'loyal guardian',
          favoriteWords: ['amazing', 'wonderful', 'fantastic'],
          userKeywords: [],
          evolutionPathVariant: 'A',
          moodState: 'happy',
          quirks: ['loves to ask questions', 'gets excited about new things'],
          communicationStyle: 'enthusiastic and curious'
        },
        visual_traits: {
          hornType: 'curved',
          furColor: 'galactic blue',
          eyeStyle: 'starry swirl',
          tailType: 'twist puff',
          auraEffect: 'fireflies',
          accessory: 'mini crown'
        }
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: { creature }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
