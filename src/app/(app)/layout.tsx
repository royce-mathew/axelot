import InitColorSchemeScript from "@mui/material/InitColorSchemeScript"
import { Header } from "@/components/header"
import { Providers } from "@/components/Providers"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <InitColorSchemeScript attribute="class" />
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
    </Providers>
  )
}
