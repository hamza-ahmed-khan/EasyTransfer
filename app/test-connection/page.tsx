"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase-client"
import { env } from "@/lib/env"
import { CheckCircle2, XCircle } from "lucide-react"

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [envVarsPresent, setEnvVarsPresent] = useState({
    supabaseUrl: false,
    supabaseAnonKey: false,
  })
  const [dbQueryResult, setDbQueryResult] = useState<"loading" | "success" | "error">("loading")
  const [dbQueryError, setDbQueryError] = useState<string | null>(null)

  useEffect(() => {
    // Check if environment variables are present
    setEnvVarsPresent({
      supabaseUrl: Boolean(env.SUPABASE_URL),
      supabaseAnonKey: Boolean(env.SUPABASE_ANON_KEY),
    })

    // Test Supabase connection
    const testConnection = async () => {
      try {
        const supabase = createClient()

        // Test authentication service
        const { error: authError } = await supabase.auth.getSession()

        if (authError) {
          throw new Error(`Auth service error: ${authError.message}`)
        }

        setConnectionStatus("success")

        // Test database query
        try {
          setDbQueryResult("loading")
          // Simple query to test database access - this should work even if the table doesn't exist
          // as it will just return an error we can catch
          const { error: dbError } = await supabase.from("files").select("id").limit(1)

          if (dbError && !dbError.message.includes("does not exist")) {
            // If error is not about table not existing, it's a connection issue
            throw new Error(`Database error: ${dbError.message}`)
          }

          setDbQueryResult("success")
        } catch (dbErr: any) {
          setDbQueryResult("error")
          setDbQueryError(dbErr.message)
        }
      } catch (err: any) {
        setConnectionStatus("error")
        setErrorMessage(err.message)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Verifying your Supabase integration connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Environment Variables</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <span className="mr-2">SUPABASE_URL:</span>
                {envVarsPresent.supabaseUrl ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="flex items-center">
                <span className="mr-2">SUPABASE_ANON_KEY:</span>
                {envVarsPresent.supabaseAnonKey ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Supabase Connection</h3>
            <div className="flex items-center">
              <span className="mr-2">Status:</span>
              {connectionStatus === "loading" ? (
                <span>Testing connection...</span>
              ) : connectionStatus === "success" ? (
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-600">Connected successfully</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-600">Connection failed</span>
                </div>
              )}
            </div>
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">{errorMessage}</div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Database Query Test</h3>
            <div className="flex items-center">
              <span className="mr-2">Status:</span>
              {dbQueryResult === "loading" ? (
                <span>Testing query...</span>
              ) : dbQueryResult === "success" ? (
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-600">Query successful</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-600">Query failed</span>
                </div>
              )}
            </div>
            {dbQueryError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">{dbQueryError}</div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            If all tests pass, your Supabase integration is properly connected. If any test fails, check your
            environment variables and Supabase project settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
