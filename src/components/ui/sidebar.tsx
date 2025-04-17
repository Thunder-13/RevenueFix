import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({
  children,
  defaultExpanded = true,
}: {
  children: React.ReactNode
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()
  return (
    <aside
      className={cn(
        "group/sidebar h-full overflow-hidden transition-all duration-300",
        expanded ? "w-64" : "w-14",
        className
      )}
    >
      <div className="h-full w-64 flex flex-col">{children}</div>
    </aside>
  )
}

export function SidebarToggle() {
  const { expanded, setExpanded } = useSidebar()
  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="h-6 w-6 text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
    >
      <span className="sr-only">Toggle Sidebar</span>
      {expanded ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

export function SidebarContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto", className)}>{children}</div>
}

export function SidebarHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)}>{children}</div>
}

export function SidebarFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)}>{children}</div>
}

export function SidebarGroup({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pb-4", className)}>{children}</div>
}

export function SidebarGroupLabel({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()
  return (
    <div
      className={cn(
        "px-4 py-2 text-xs font-medium text-muted-foreground",
        !expanded && "sr-only",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SidebarGroupContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)}>{children}</div>
}

export function SidebarMenu({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)}>{children}</div>
}

export function SidebarMenuItem({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2", className)}>{children}</div>
}

export function SidebarMenuButton({
  className,
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}) {
  const { expanded } = useSidebar()
  const Comp = asChild ? React.Fragment : "button"
  return (
    <Comp
      className={cn(
        "flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground",
        !expanded && "justify-center",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}