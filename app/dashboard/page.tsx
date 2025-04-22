"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Download, Trash2, Upload } from "lucide-react"
import Link from "next/link"

interface FileItem {
  id: string
  name: string
  size: number
  type: string
  created_at: string
  unique_key: string
  downloads: number
  path: string
}

export default function Dashboard() {
  const { supabase, user, loading: userLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase.from("files").select("*").order("created_at", { ascending: false })

        if (error) throw error
        setFiles(data || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch files",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [supabase, user, userLoading, router, toast])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const copyShareLink = (uniqueKey: string) => {
    const link = `${window.location.origin}/download/${uniqueKey}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard",
    })
  }

  const deleteFile = async (id: string, path: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage.from("files").remove([path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase.from("files").delete().eq("id", id)

      if (dbError) throw dbError

      // Update UI
      setFiles(files.filter((file) => file.id !== id))

      toast({
        title: "File deleted",
        description: "The file has been deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Files</h1>
        <Link href="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload New File
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Loading your files...</p>
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No files yet</CardTitle>
            <CardDescription>
              You haven&apos;t uploaded any files yet. Start sharing by uploading your first file.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First File
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{formatDate(file.created_at)}</TableCell>
                    <TableCell>{file.downloads}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyShareLink(file.unique_key)}
                          title="Copy share link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Link href={`/download/${file.unique_key}`} target="_blank">
                          <Button variant="outline" size="icon" title="Download file">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteFile(file.id, file.path)}
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
