"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DashboardShell } from "@/components/dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import type { Opportunity, Profile } from "@/lib/types"
import { getStoredUser } from "@/lib/backend-auth"
import {
  adminApproveOpportunity,
  adminCreateTeacherInvite,
  adminCreateUser,
  adminDeactivateUser,
  adminRejectOpportunity,
  adminSendInvitation,
  getAdminDashboardData,
} from "@/lib/backend-api"
import { Check, Link as LinkIcon, Mail, Shield, UserMinus, X } from "lucide-react"

type AdminData = {
  profile: Profile
  users: Profile[]
  pending: Opportunity[]
  active: Opportunity[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [busy, setBusy] = useState(false)
  const [teacherInviteEmail, setTeacherInviteEmail] = useState("")
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "student" as "student" | "teacher" | "maintainer",
    age: "",
    githubUsername: "",
    linkedinUrl: "",
    avatarUrl: "",
    slackUserId: "",
  })

  async function load() {
    const payload = await getAdminDashboardData()
    setData(payload)
  }

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.replace("/auth/login")
      return
    }
    if (storedUser.role !== "admin") {
      router.replace("/")
      return
    }
    load().catch(() => router.replace("/auth/login"))
  }, [router])

  async function createUser() {
    setBusy(true)
    try {
      const payload = await adminCreateUser({
        ...form,
        age: form.role === "student" ? Number(form.age) : undefined,
      })
      toast.success(`Account created. Temporary password: ${payload.temporaryPassword}`)
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        role: "student",
        age: "",
        githubUsername: "",
        linkedinUrl: "",
        avatarUrl: "",
        slackUserId: "",
      })
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create user")
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-5 w-5" />
      </div>
    )
  }

  return (
    <DashboardShell profile={data.profile} title="Admin dashboard">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin control center</h1>
          <p className="text-sm text-muted-foreground">Approve posts, manage RCA accounts, and issue teacher invites.</p>
        </div>
        <Badge variant="outline" className="gap-2"><Shield className="h-3.5 w-3.5" /> Admin</Badge>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create system user</CardTitle>
            <CardDescription>Students, teachers and maintainers are managed by the RCA admin.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First name" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} />
              <Input placeholder="Last name" value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} />
            </div>
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as typeof form.role })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="maintainer">Maintainer</SelectItem>
              </SelectContent>
            </Select>
            {form.role === "student" && (
              <Input type="number" placeholder="Student age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            )}
            {form.role === "maintainer" && (
              <div className="grid gap-3">
                <Input placeholder="GitHub username" value={form.githubUsername} onChange={(e) => setForm({ ...form, githubUsername: e.target.value })} />
                <Input placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
                <Input placeholder="Profile image URL or /resources/images/name.jpg" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
              </div>
            )}
            <Input placeholder="Slack user ID (optional)" value={form.slackUserId} onChange={(e) => setForm({ ...form, slackUserId: e.target.value })} />
            <Button disabled={busy} onClick={createUser}>{busy && <Spinner className="mr-2" />} Create account</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher invite link</CardTitle>
            <CardDescription>Generate a non-guessable link for a teacher to finish registration.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Input placeholder="Teacher email (optional)" value={teacherInviteEmail} onChange={(e) => setTeacherInviteEmail(e.target.value)} />
            <Button
              variant="outline"
              onClick={async () => {
                const payload = await adminCreateTeacherInvite(teacherInviteEmail || undefined)
                await navigator.clipboard.writeText(payload.invite.registrationUrl)
                toast.success("Teacher invite copied")
              }}
            >
              <LinkIcon className="mr-2 h-4 w-4" /> Generate
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Pending opportunity approvals</CardTitle>
            <CardDescription>Posts from students, teachers and maintainers wait here before going public.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Opportunity</TableHead><TableHead>Organization</TableHead><TableHead>Deadline</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {data.pending.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell className="font-medium">{opportunity.title}</TableCell>
                    <TableCell>{opportunity.organization}</TableCell>
                    <TableCell>{new Date(opportunity.deadline).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={async () => { await adminRejectOpportunity(opportunity.id); toast.success("Rejected"); await load() }}><X className="mr-1 h-4 w-4" /> Reject</Button>{" "}
                      <Button size="sm" onClick={async () => { await adminApproveOpportunity(opportunity.id); toast.success("Approved and students notified"); await load() }}><Check className="mr-1 h-4 w-4" /> Approve</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!data.pending.length && <p className="py-6 text-sm text-muted-foreground">No pending opportunities.</p>}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Deactivate accounts instead of deleting historical analytics data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={async () => { await adminSendInvitation(user.id); toast.success("Invitation sent") }}><Mail className="mr-1 h-4 w-4" /> Invite</Button>{" "}
                      <Button size="sm" variant="destructive" onClick={async () => { await adminDeactivateUser(user.id); toast.success("Account deactivated"); await load() }}><UserMinus className="mr-1 h-4 w-4" /> Deactivate</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
