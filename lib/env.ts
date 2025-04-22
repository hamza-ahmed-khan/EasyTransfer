// Get environment variables with fallbacks
export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
}

// Function to check if all required environment variables are set
export const checkEnvVars = () => {
  const missing = []

  if (!env.SUPABASE_URL) missing.push("SUPABASE_URL")
  if (!env.SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY")

  return {
    isComplete: missing.length === 0,
    missing,
  }
}
