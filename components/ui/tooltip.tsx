"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type TooltipCtx = {
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}
const Ctx = React.createContext<TooltipCtx | null>(null)

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)
  const value = React.useMemo(() => ({ open, setOpen, triggerRef }), [open])
  return <Ctx.Provider value={value}><span className="relative inline-block">{children}</span></Ctx.Provider>
}

type TriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
}
export const TooltipTrigger = React.forwardRef<HTMLElement, TriggerProps>(function Trigger(
  { asChild, className, children, ...rest },
  ref,
) {
  const ctx = React.useContext(Ctx)
  const mergedRef = (node: HTMLElement | null) => {
    if (typeof ref === "function") ref(node)
    else if (ref && "current" in (ref as any)) (ref as any).current = node
    if (ctx) ctx.triggerRef.current = node as HTMLElement
  }
  const handlers = {
    onMouseEnter: () => ctx?.setOpen(true),
    onMouseLeave: () => ctx?.setOpen(false),
    onFocus: () => ctx?.setOpen(true),
    onBlur: () => ctx?.setOpen(false),
  }
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      ref: mergedRef,
      className: cn((children as any).props?.className, className),
      ...handlers,
      ...rest,
    })
  }
  return (
    <button
      ref={mergedRef as any}
      type="button"
      className={cn("inline-flex items-center", className)}
      {...handlers}
      {...rest}
    >
      {children}
    </button>
  )
})

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
}
export const TooltipContent = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { className, side = "top", children, ...rest },
  ref,
) {
  const ctx = React.useContext(Ctx)
  const [mounted, setMounted] = React.useState(false)
  const [style, setStyle] = React.useState<React.CSSProperties>({})

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!ctx?.open || !ctx.triggerRef.current) return
    const rect = ctx.triggerRef.current.getBoundingClientRect()
    const gap = 8
    const pos: React.CSSProperties = { position: "fixed", zIndex: 50 }
    if (side === "top") {
      pos.left = rect.left + rect.width / 2
      pos.top = rect.top - gap
      pos.transform = "translate(-50%, -100%)"
    } else if (side === "bottom") {
      pos.left = rect.left + rect.width / 2
      pos.top = rect.bottom + gap
      pos.transform = "translate(-50%, 0)"
    } else if (side === "left") {
      pos.left = rect.left - gap
      pos.top = rect.top + rect.height / 2
      pos.transform = "translate(-100%, -50%)"
    } else {
      pos.left = rect.right + gap
      pos.top = rect.top + rect.height / 2
      pos.transform = "translate(0, -50%)"
    }
    setStyle(pos)
  }, [ctx?.open, ctx?.triggerRef.current, side])

  if (!ctx?.open || !mounted) return null

  const node = (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "pointer-events-none rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md",
        "border border-gray-800",
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )

  const portalTarget = typeof document !== "undefined" ? document.body : null
  return portalTarget ? createPortal(node, portalTarget) : node
})
