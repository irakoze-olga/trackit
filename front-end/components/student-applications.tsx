"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions } from "@/components/ui/empty"
import type { Application, Opportunity } from "@/lib/types"
import { format } from "date-fns"
import { Search, FileText, ExternalLink, X, Eye } from "lucide-react"
import { toast } from "sonner"
import { updateApplication } from "@/lib/backend-api"

interface StudentApplicationsProps {
  applications: (Application & { opportunities: Opportunity })[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  under_review: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  accepted: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
  withdrawn: "bg-gray-500/10 text-gray-600 border-gray-500/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

export function StudentApplications({ applications: initialApplications }: StudentApplicationsProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.opportunities.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.opportunities.organization.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    return matchesSearch && app.status === activeTab
  })

  async function withdrawApplication(applicationId: string) {
    try {
      await updateApplication(applicationId, { status: "withdrawn" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to withdraw application")
      return
    }

    setApplications(
      applications.map((app) =>
        app.id === applicationId ? { ...app, status: "withdrawn" } : app
      )
    )
    toast.success("Application withdrawn")
  }

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track and manage your opportunity applications</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search applications..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({counts.under_review})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({counts.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredApplications.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium max-w-[200px]">
                        <Link 
                          href={`/opportunities/${app.opportunities.id}`}
                          className="hover:underline line-clamp-1"
                        >
                          {app.opportunities.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {app.opportunities.organization}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {app.opportunities.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(app.submitted_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[app.status]}>
                          {statusLabels[app.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/opportunities/${app.opportunities.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {app.opportunities.application_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a
                                href={app.opportunities.application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {app.status === "pending" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <X className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to withdraw your application for &quot;{app.opportunities.title}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => withdrawApplication(app.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Withdraw
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Empty>
              <EmptyIcon>
                <FileText className="h-10 w-10" />
              </EmptyIcon>
              <EmptyTitle>No applications found</EmptyTitle>
              <EmptyDescription>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : activeTab === "all"
                  ? "Start by exploring opportunities and submitting applications"
                  : `No ${statusLabels[activeTab]?.toLowerCase()} applications`}
              </EmptyDescription>
              <EmptyActions>
                <Button asChild>
                  <Link href="/dashboard/student/explore">Explore Opportunities</Link>
                </Button>
              </EmptyActions>
            </Empty>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
