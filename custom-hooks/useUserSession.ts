'use client'

import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/SupabaseClient'

export default function useUserSession() {

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    // 1️⃣ Get current session on first load
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.log("Session error:", error.message)
      }

      setSession(data.session)
      setLoading(false)
    }

    fetchSession()

    // 2️⃣ Listen for auth changes (login/logout/token refresh)
    const { data: {subscription} } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      });
      
    

    // 3️⃣ Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }

  }, [])

  return { session, loading }
}