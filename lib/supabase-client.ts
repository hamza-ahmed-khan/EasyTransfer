import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { env, checkEnvVars } from "./env"

export const createClient = () => {
  const { isComplete, missing } = checkEnvVars()

  if (!isComplete) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  // Use the environment variables from our env utility
  return createClientComponentClient({
    supabaseUrl: env.SUPABASE_URL,
    supabaseKey: env.SUPABASE_ANON_KEY,
  })
}
