"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { LogOut, Upload, User, Database } from "lucide-react"

export default function Header() {
  const { user, supabase } = useSupabase()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          FileShare
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant={pathname === "/dashboard" ? "default" : "ghost"}>Dashboard</Button>
              </Link>
              <Link href="/upload">
                <Button variant={pathname === "/upload" ? "default" : "ghost"}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant={pathname === "/login" ? "default" : "ghost"}>Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant={pathname === "/signup" ? "default" : "ghost"}>
                  <User className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <Link href="/test-connection">
            <Button variant={pathname === "/test-connection" ? "default" : "ghost"}>
              <Database className="mr-2 h-4 w-4" />
              Test Connection
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
