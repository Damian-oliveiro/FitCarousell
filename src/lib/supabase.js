import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidConfig = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey

let supabase

if (hasValidConfig) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Demo mode — mock Supabase client so the app renders without a backend
  console.warn('[FitCarousell] No valid Supabase config. Running in demo mode.')

  const mockChain = () => {
    const handler = {
      get(target, prop) {
        if (prop === 'then') {
          return (resolve) => resolve({ data: null, error: null, count: 0 })
        }
        if (prop === 'catch') {
          return () => Promise.resolve({ data: null, error: null })
        }
        return () => new Proxy({}, handler)
      }
    }
    return new Proxy({}, handler)
  }

  supabase = {
    from: () => mockChain(),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: { user: { id: 'demo' } }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: { id: 'demo' } }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    channel: () => ({
      on: function() { return this },
      subscribe: function(cb) { if (cb) cb('SUBSCRIBED'); return this },
    }),
    removeChannel: () => {},
  }
}

export { supabase }
