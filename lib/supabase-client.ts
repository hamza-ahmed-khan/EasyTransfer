import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { env } from "./env"

export const createClient = () => {
  // Use the environment variables from our env utility
  return createClientComponentClient({
    supabaseUrl: env.SUPABASE_URL,
    supabaseKey: env.SUPABASE_ANON_KEY,
  })
}
