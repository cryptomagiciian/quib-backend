// Edge function to handle task submissions
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
      // Get user's tasks
      const { data: tasks, error: tasksError } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (tasksError) {
        throw tasksError
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: tasks || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (method === 'POST') {
      // Submit a new task
      const { taskType, title, description } = await req.json()

      if (!taskType || !title) {
        return new Response(
          JSON.stringify({ error: 'Task type and title are required' }),
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

      // Create task in Supabase
      const { data: task, error: taskError } = await supabaseClient
        .from('tasks')
        .insert({
          user_id: user.id,
          task_type: taskType,
          title,
          description,
          completed: true,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (taskError) {
        throw taskError
      }

      // Forward to your Cursor backend for XP calculation
      try {
        const backendUrl = Deno.env.get('CURSOR_BACKEND_URL') || 'http://localhost:3000'
        const backendResponse = await fetch(`${backendUrl}/api/lovable/task`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('CURSOR_BACKEND_JWT_SECRET')}`,
          },
          body: JSON.stringify({
            taskType,
            title,
            description,
            userId: user.id,
            creatureId: creature.id,
            currentXP: creature.xp || 0
          })
        })

        if (backendResponse.ok) {
          const backendData = await backendResponse.json()
          
          if (backendData.success) {
            // Update creature with XP and evolution status
            const { error: updateError } = await supabaseClient
              .from('creatures')
              .update({
                xp: creature.xp + (backendData.data.xpGained || 10),
                mood_score: backendData.data.creature?.moodScore || creature.mood_score
              })
              .eq('id', creature.id)

            if (updateError) {
              console.error('Failed to update creature XP:', updateError)
            }
          }
        }
      } catch (backendError) {
        console.error('Backend task processing failed:', backendError)
        // Continue without backend processing
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: { task }
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
    console.error('Error in proxy-tasks:', error)
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
