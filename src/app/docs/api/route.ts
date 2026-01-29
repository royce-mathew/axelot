import { ApiReference } from "@scalar/nextjs-api-reference"

export const GET = ApiReference({
  url: "/openapi/axelot-api.yaml",
  theme: "deepSpace",
  customCss: `
    :root {
      --scalar-font: 'DM Sans', system-ui, sans-serif;
      --scalar-font-code: ui-monospace, 'SF Mono', monospace;

      /* light mode */
      --scalar-background-1: #f5f5f5;
      --scalar-background-2: #ffffff;
      --scalar-background-3: #fafafa;
      --scalar-color-1: #1a1a1a;
      --scalar-color-2: #666666;
      --scalar-color-3: #9e9e9e;
      --scalar-color-accent: #3b82f6;
      --scalar-border-color: rgba(128, 128, 128, 0.2);
    }

    .dark-mode {
      --scalar-background-1: #1e1e1e;
      --scalar-background-2: #252526;
      --scalar-background-3: #2d2d2d;
      --scalar-color-1: #e0e0e0;
      --scalar-color-2: #9e9e9e;
      --scalar-color-3: #666666;
      --scalar-color-accent: #60a5fa;
      --scalar-border-color: rgba(255, 255, 255, 0.12);
    }
  `,
  defaultHttpClient: {
    targetKey: "js",
    clientKey: "fetch",
  },
  withDefaultFonts: false,
})
