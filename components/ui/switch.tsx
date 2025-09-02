"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  value?: string
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const isControlled = typeof checked === "boolean"
    const [internal, setInternal] = React.useState<boolean>(defaultChecked ?? false)
    const isOn = isControlled ? (checked as boolean) : internal

    const toggle = () => {
      if (disabled) return
      const next = !isOn
      if (!isControlled) setInternal(next)
      onCheckedChange?.(next)
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-disabled={disabled || undefined}
        onClick={toggle}
        disabled={disabled}
        ref={ref}
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full transition-colors",
          isOn ? "bg-emerald-600" : "bg-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            isOn ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"
