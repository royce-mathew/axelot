import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ThemeToggle from "@/components/ThemeToggle"

// Mock hooks
const mockSetMode = vi.fn()
const mockUseColorScheme = vi.fn()

vi.mock("@mui/material/styles", () => ({
  useColorScheme: () => mockUseColorScheme(),
}))

vi.mock("@mui/material", () => ({
  useTheme: () => ({
    shadows: ["none", "shadow1", "shadow2"],
  }),
  Box: ({
    children,
    ...props
  }: Record<string, unknown> & { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}))

vi.mock("@mui/icons-material", () => ({
  LightMode: () => <div data-testid="light-icon" />,
  DarkMode: () => <div data-testid="dark-icon" />,
}))

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state when mode is undefined", () => {
    mockUseColorScheme.mockReturnValue({
      mode: undefined,
      setMode: mockSetMode,
    })
    render(<ThemeToggle />)
    // Should not have role button in loading state
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("renders correctly in light mode", () => {
    mockUseColorScheme.mockReturnValue({ mode: "light", setMode: mockSetMode })
    render(<ThemeToggle />)

    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute("aria-label", "Switch theme mode")
  })

  it("renders correctly in dark mode", () => {
    mockUseColorScheme.mockReturnValue({ mode: "dark", setMode: mockSetMode })
    render(<ThemeToggle />)

    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute("aria-label", "Switch theme mode")
  })

  it("toggles to dark mode when clicked in light mode", () => {
    mockUseColorScheme.mockReturnValue({ mode: "light", setMode: mockSetMode })
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole("button"))
    expect(mockSetMode).toHaveBeenCalledWith("dark")
  })

  it("toggles to light mode when clicked in dark mode", () => {
    mockUseColorScheme.mockReturnValue({ mode: "dark", setMode: mockSetMode })
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole("button"))
    expect(mockSetMode).toHaveBeenCalledWith("light")
  })
})
