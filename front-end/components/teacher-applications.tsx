"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { Application } from "@/lib/types"
import { format } from "date-fns"
import { Search, Users, MoreHorizontal, Eye, CheckCircle, XCircle, Clock, Mail } from "lucide-react"
import { toast } from "sonner"
import { updateApplication } from "@/lib/backend-api"

interface TeacherApplicationsProps {
  applications: (Application & {
    opportunities: { id: string; title: string; category: string }
    profiles: { id: string; full_name: string; email: string; institution: string; field_of_study: string }
  })[]
  opportunities: { id: string; title: string }[]
  currentFilter?: string
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

export function TeacherApplications({ applications: initialApplications, opportunities, currentFilter }: TeacherApplicationsProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [searchQuery, setSearchQuery] = useState("")
  const [opportunityFilter, setOpportunityFilter] = useState(currentFilter || "all")
  const [selectedApplication, setSelectedApplication] = useState<typeof applications[0] | null>(null)
  const router = useRouter()

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (opportunityFilter === "all") return matchesSearch
    return matchesSearch && app.opportunity_id === opportunityFilter
  })

  async function updateStatus(applicationId: string, status: Application["status"]) {
    try {
      await updateApplication(applicationId, { status })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status")
      return
    }

    setApplications(
      applications.map((app) =>
        app.id === applicationId ? { ...app, status } : app
      )
    )
    toast.success(`Application ${status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "updated"}`)
  }

  function handleFilterChange(value: string) {
    setOpportunityFilter(value)
    if (value === "all") {
      router.push("/dashboard/teacher/applications")
    } else {
      router.push(`/dashboard/teacher/applications?opportunity=${value}`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">Review and manage applications for your opportunities</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={opportunityFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filter by opportunity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Opportunities</SelectItem>
            {opportunities.map((opp) => (
              <SelectItem key={opp.id} value={opp.id}>
                {opp.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      {filteredApplications.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Opportunity</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">{app.profiles.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{app.opportunities.title}</p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {app.opportunities.category}
                      </Badge>
                    </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedApplication(app)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`mailto:${app.profiles.email}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Applicant
                          </a>
                        </DropdownMenuItem>
                        {app.status !== "under_review" && app.status !== "accepted" && app.status !== "rejected" && (
                          <DropdownMenuItem onClick={() => updateStatus(app.id, "under_review")}>
                            <Clock className="mr-2 h-4 w-4" />
                            Mark Under Review
                          </DropdownMenuItem>
                        )}
                        {app.status !== "accepted" && (
                          <DropdownMenuItem onClick={() => updateStatus(app.id, "accepted")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Accept
                          </DropdownMenuItem>
                        )}
                        {app.status !== "rejected" && (
                          <DropdownMenuItem onClick={() => updateStatus(app.id, "rejected")}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            Reject
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Empty>
          <EmptyIcon>
            <Users className="h-10 w-10" />
          </EmptyIcon>
          <EmptyTitle>
            {searchQuery || opportunityFilter !== "all" ? "No matching applications" : "No applications yet"}
          </EmptyTitle>
          <EmptyDescription>
            {searchQuery || opportunityFilter !== "all"
              ? "Try adjusting your filters"
              : "Applications will appear here once students apply to your opportunities"}
          </EmptyDescription>
        </Empty>
      )}

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        {selectedApplication && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Application for {selectedApplication.opportunities.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Applicant</h4>
                <p>{selectedApplication.profiles.full_name}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.profiles.email}</p>
              </div>
              {selectedApplication.profiles.institution && (
                <div>
                  <h4 className="font-medium mb-1">Institution</h4>
                  <p className="text-muted-foreground">{selectedApplication.profiles.institution}</p>
                </div>
              )}
              {selectedApplication.profiles.field_of_study && (
                <div>
                  <h4 className="font-medium mb-1">Field of Study</h4>
                  <p className="text-muted-foreground">{selectedApplication.profiles.field_of_study}</p>
                </div>
              )}
              {selectedApplication.cover_letter && (
                <div>
                  <h4 className="font-medium mb-1">Cover Letter</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium mb-1">Status</h4>
                <Badge variant="outline" className={statusColors[selectedApplication.status]}>
                  {statusLabels[selectedApplication.status]}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-1">Applied</h4>
                <p className="text-muted-foreground">
                  {format(new Date(selectedApplication.submitted_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" asChild>
                <a href={`mailto:${selectedApplication.profiles.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </a>
              </Button>
              {selectedApplication.status !== "accepted" && (
                <Button onClick={() => { updateStatus(selectedApplication.id, "accepted"); setSelectedApplication(null); }}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept
                </Button>
              )}
              {selectedApplication.status !== "rejected" && (
                <Button variant="destructive" onClick={() => { updateStatus(selectedApplication.id, "rejected"); setSelectedApplication(null); }}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
