export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For demo purposes, allow access to dashboard
  // In production, this would check authentication

  return <>{children}</>
}
