import { EditorView } from "@tiptap/pm/view"

/**
 * Collects all stylesheets and inline styles from the current document
 * @returns Object containing style and link elements
 */
function collectStyles(): {
  styles: HTMLStyleElement[]
  links: HTMLLinkElement[]
} {
  const styles = Array.from(
    document.querySelectorAll<HTMLStyleElement>("style")
  ).map((element) => element.cloneNode(true) as HTMLStyleElement)

  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>("link[rel='stylesheet']")
  ).map((element) => {
    const link = element.cloneNode(true) as HTMLLinkElement
    // Ensure absolute URLs for external stylesheets
    if (link.href && !link.href.startsWith("blob:")) {
      link.href = new URL(link.href, window.location.href).href
    }
    return link
  })

  return { styles, links }
}

/**
 * Creates a hidden iframe for printing
 * @returns The created iframe element
 */
function createPrintIframe(): HTMLIFrameElement {
  const iframe = document.createElement("iframe")
  iframe.id = "tiptap-print-iframe"
  iframe.style.cssText =
    "position: absolute; width: 0; height: 0; top: -10px; left: -10px; border: none;"
  iframe.setAttribute("aria-hidden", "true")
  iframe.setAttribute("title", "Print Frame")
  document.body.appendChild(iframe)
  return iframe
}

/**
 * Builds content for the iframe using modern DOM APIs
 * @param iframe The target iframe
 * @param contentElement The element to print
 * @returns Promise that resolves when all styles are loaded
 */
async function buildIframeContent(
  iframe: HTMLIFrameElement,
  contentElement: Element
): Promise<void> {
  const doc = iframe.contentDocument || iframe.contentWindow?.document

  if (!doc) {
    throw new Error("Unable to access iframe document")
  }

  // Create HTML structure using DOM APIs
  const html = doc.createElement("html")
  const head = doc.createElement("head")
  const body = doc.createElement("body")

  // Add charset meta tag
  const meta = doc.createElement("meta")
  meta.setAttribute("charset", "UTF-8")
  head.appendChild(meta)

  // Add viewport meta tag
  const viewport = doc.createElement("meta")
  viewport.setAttribute("name", "viewport")
  viewport.setAttribute("content", "width=device-width, initial-scale=1.0")
  head.appendChild(viewport)

  // Copy CSS variables from the parent document (especially font variables)
  const rootComputedStyle = window.getComputedStyle(document.documentElement)
  const cssVariables: string[] = []

  // Extract all CSS custom properties (variables)
  for (let i = 0; i < rootComputedStyle.length; i++) {
    const propertyName = rootComputedStyle[i]
    if (propertyName.startsWith("--")) {
      const value = rootComputedStyle.getPropertyValue(propertyName)
      cssVariables.push(`${propertyName}: ${value};`)
    }
  }

  // Also get body computed style for fallback font
  const bodyComputedStyle = window.getComputedStyle(document.body)
  const actualFontFamily = bodyComputedStyle.getPropertyValue("font-family")

  // Add print-specific styles with CSS variables
  const printStyle = doc.createElement("style")
  printStyle.textContent = `
    :root {
      ${cssVariables.join("\n      ")}
    }
    
    @media print {
      @page {
        margin: 0.5in;
      }
      
      body {
        margin: 0;
        padding: 20px;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        font-family: ${actualFontFamily};
      }
      
      .ProseMirror {
        border: none !important;
        padding: 0 !important;
        min-height: auto !important;
        outline: none !important;
        font-family: ${actualFontFamily};
      }
      
      /* Hide any interactive elements */
      button, .toolbar, .menu, [contenteditable] {
        pointer-events: none;
      }
      
      /* Prevent page breaks inside important elements */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        break-after: avoid;
      }
      
      pre, blockquote {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
    
    /* Ensure editor content is visible and styled */
    body {
      font-family: ${actualFontFamily};
      line-height: ${bodyComputedStyle.getPropertyValue("line-height")};
      color: ${bodyComputedStyle.getPropertyValue("color")};
    }
    
    .ProseMirror {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: ${actualFontFamily};
    }
  `
  head.appendChild(printStyle)

  // Collect and add all existing styles
  const { styles, links } = collectStyles()

  // Add all inline styles first
  styles.forEach((style) => head.appendChild(style))

  // Add all stylesheet links
  links.forEach((link) => head.appendChild(link))

  // Clone and add the content with all computed styles
  const clonedContent = contentElement.cloneNode(true) as HTMLElement

  // Copy computed styles to ensure accurate rendering
  const copyComputedStyles = (source: Element, target: Element) => {
    const computedStyle = window.getComputedStyle(source)
    const targetElement = target as HTMLElement

    // Copy essential styling properties
    const essentialProps = [
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "line-height",
      "color",
      "background-color",
      "padding",
      "margin",
      "border",
      "text-align",
      "text-decoration",
      "letter-spacing",
      "word-spacing",
      "white-space",
      "text-transform",
    ]

    essentialProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop)
      if (value && value !== "normal" && value !== "none") {
        targetElement.style.setProperty(prop, value, "important")
      }
    })

    // Recursively copy styles for children
    const sourceChildren = source.children
    const targetChildren = target.children
    for (
      let i = 0;
      i < sourceChildren.length && i < targetChildren.length;
      i++
    ) {
      copyComputedStyles(sourceChildren[i], targetChildren[i])
    }
  }

  // Apply computed styles to cloned content
  if (
    contentElement instanceof HTMLElement &&
    clonedContent instanceof HTMLElement
  ) {
    copyComputedStyles(contentElement, clonedContent)
  }

  // Explicitly set font on the cloned content root
  const contentComputedStyle = window.getComputedStyle(contentElement)
  clonedContent.style.setProperty(
    "font-family",
    contentComputedStyle.getPropertyValue("font-family"),
    "important"
  )

  body.appendChild(clonedContent)

  // Assemble the document
  html.appendChild(head)
  html.appendChild(body)

  // Replace the entire document
  doc.documentElement.replaceWith(html)

  // Wait for all stylesheets to load
  const styleLinks = Array.from(
    doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
  await Promise.all(
    styleLinks.map(
      (link) =>
        new Promise<void>((resolve) => {
          if (link.sheet) {
            resolve()
          } else {
            link.onload = () => resolve()
            link.onerror = () => resolve() // Resolve even on error to not block printing
            // Timeout fallback
            setTimeout(resolve, 3000)
          }
        })
    )
  )

  // Wait for fonts to be loaded if the Font Loading API is available
  if ("fonts" in doc && doc.fonts) {
    try {
      await doc.fonts.ready
    } catch (error) {
      console.warn("Font loading check failed:", error)
    }
  }
}

/**
 * Initiates the print dialog and cleans up the iframe
 * @param iframe The iframe containing the print content
 */
async function executePrint(iframe: HTMLIFrameElement): Promise<void> {
  const frameWindow = iframe.contentWindow

  if (!frameWindow) {
    console.error("Unable to access iframe window")
    document.body.removeChild(iframe)
    return
  }

  // Wait a bit for all styles and fonts to be fully applied
  // This is critical for web fonts loaded via Next.js or Google Fonts
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    frameWindow.focus()
    frameWindow.print()
  } catch (error) {
    console.error("Print failed:", error)
  } finally {
    // Clean up after print dialog
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }, 100)
  }
}

/**
 * Prints HTML content in a separate iframe
 * @param element The DOM element to print
 */
async function printHtml(element: Element): Promise<void> {
  const iframe = createPrintIframe()

  try {
    await buildIframeContent(iframe, element)
    await executePrint(iframe)
  } catch (error) {
    console.error("Failed to initialize print:", error)
    // Clean up iframe on error
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe)
    }
  }
}

/**
 * Prints the content of a TipTap editor view
 * @param view The TipTap editor view
 * @returns Promise that resolves to true if print was initiated, false otherwise
 */
export async function printView(view: EditorView): Promise<boolean> {
  const editorContent = view.dom.closest(".ProseMirror")

  if (!editorContent) {
    console.warn("Could not find ProseMirror editor content")
    return false
  }

  try {
    await printHtml(editorContent)
    return true
  } catch (error) {
    console.error("Failed to print editor view:", error)
    return false
  }
}
