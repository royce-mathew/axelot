import { Icons } from "@/config/icons"

export interface NavItem {
  title: string
  href?: string
  modifiedDate?: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
  label?: {
    text: string
    className?: string
  }
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

