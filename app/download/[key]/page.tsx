"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase-client"

interface FileDetails {
  id: string
  name: string
  size: number
  type: string
  path: string
}

export default function DownloadPage({ params }: { params: { key: string } }) {
  const { key } = params
  const supabase = createClient()
  const { toast } = useToast()
  const [file, setFile] = useState<FileDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        // Get file details from the database
        const { data, error } = await supabase
          .from("files")
          .select("id, name, size, type, path")
          .eq("unique_key", key)
          .single()

        if (error) throw error

        setFile(data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "File not found or has been removed",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFileDetails()
  }, [key, supabase, toast])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = async () => {
    if (!file) return

    setDownloading(true)

    try {
      // Increment download counter
      await supabase
        .from("files")
        .update({ downloads: supabase.rpc("increment", { row_id: file.id }) })
        .eq("id", file.id)

      // Get download URL
      const { data, error } = await supabase.storage.from("files").download(file.path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download started",
        description: "Your file is being downloaded",
      })
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "There was an error downloading the file",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading file details...</p>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>File Not Found</CardTitle>
            <CardDescription>The file you are looking for does not exist or has been removed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Download File</CardTitle>
          <CardDescription>You can download the file using the button below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <FileIcon className="h-8 w-8 text-blue-500 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="font-medium">{file.name}</h3>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleDownload} disabled={downloading} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Starting Download..." : "Download File"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
