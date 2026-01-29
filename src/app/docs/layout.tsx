import "./docs.css"
import type { ReactNode } from "react"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { RootProvider } from "fumadocs-ui/provider/next"
import { source } from "@/lib/source"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        enabled: true,
        defaultTheme: "dark",
        attribute: "class",
      }}
    >
      <DocsLayout
        tree={source.getPageTree()}
        sidebar={{
          defaultOpenLevel: 1,
        }}
        nav={{
          title: "Axelot Docs",
          url: "/",
        }}
        links={[
          {
            text: "Home",
            url: "/",
          },
          {
            text: "API Reference",
            url: "/docs/api",
          },
          {
            text: "GitHub",
            url: "https://github.com/royce-mathew/axelot",
            external: true,
          },
        ]}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  )
}
