import { Header } from "@/components/header"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Header />
      <div style={{ flex: 1, position: "relative" }}>{children}</div>
    </div>
  )
}
