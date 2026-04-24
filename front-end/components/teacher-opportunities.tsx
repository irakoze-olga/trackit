"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyIcon, EmptyTitle, EmptyDescription, EmptyActions } from "@/components/ui/empty"
import type { Opportunity } from "@/lib/types"
import { format } from "date-fns"
import {
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  FileText,
  Archive,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"
import { deleteOpportunity as deleteOpportunityRequest, patchOpportunity } from "@/lib/backend-api"

interface TeacherOpportunitiesProps {
  opportunities: (Opportunity & { application_count: number })[]
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  closed: "bg-red-500/10 text-red-600 border-red-500/20",
  draft: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
}

export function TeacherOpportunities({ opportunities: initialOpportunities }: TeacherOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function updateStatus(id: string, status: "active" | "closed" | "draft") {
    try {
      await patchOpportunity(id, { status })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status")
      return
    }

    setOpportunities(
      opportunities.map((o) => (o.id === id ? { ...o, status } : o))
    )
    toast.success(`Opportunity ${status === "active" ? "activated" : status === "closed" ? "closed" : "saved as draft"}`)
  }

  async function deleteOpportunity() {
    if (!deleteId) return

    try {
      await deleteOpportunityRequest(deleteId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete opportunity")
      return
    }

    setOpportunities(opportunities.filter((o) => o.id !== deleteId))
    setDeleteId(null)
    toast.success("Opportunity deleted")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Opportunities</h1>
          <p className="text-muted-foreground">Manage your posted opportunities</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teacher/opportunities/new">
            <Plus className="mr-2 h-4 w-4" />
            Post New
          </Link>
        </Button>
      </div>

      {opportunities.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {filteredOpportunities.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium max-w-[250px]">
                    <div className="truncate">{opp.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{opp.organization}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {opp.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {opp.application_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {opp.views_count || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(opp.deadline), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[opp.status]}>
                      {opp.status}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/opportunities/${opp.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/teacher/opportunities/${opp.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/teacher/applications?opportunity=${opp.id}`}>
                            <Users className="mr-2 h-4 w-4" />
                            View Applications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {opp.status !== "active" && (
                          <DropdownMenuItem onClick={() => updateStatus(opp.id, "active")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Set Active
                          </DropdownMenuItem>
                        )}
                        {opp.status !== "closed" && (
                          <DropdownMenuItem onClick={() => updateStatus(opp.id, "closed")}>
                            <Archive className="mr-2 h-4 w-4" />
                            Close
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteId(opp.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
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
            <FileText className="h-10 w-10" />
          </EmptyIcon>
          <EmptyTitle>
            {searchQuery ? "No matching opportunities" : "No opportunities yet"}
          </EmptyTitle>
          <EmptyDescription>
            {searchQuery
              ? "Try adjusting your search terms"
              : "Start by posting your first opportunity to attract students"}
          </EmptyDescription>
          <EmptyActions>
            <Button asChild>
              <Link href="/dashboard/teacher/opportunities/new">
                <Plus className="mr-2 h-4 w-4" />
                Post Your First Opportunity
              </Link>
            </Button>
          </EmptyActions>
        </Empty>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this opportunity and all associated applications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteOpportunity}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
