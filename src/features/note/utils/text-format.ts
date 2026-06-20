export type HighlightColor = "yellow" | "green" | "blue" | "pink"
export type PenColor = "red" | "blue" | "green" | "purple"
export type UnderlineStyle = "solid" | "wavy" | "double" | "dotted"

const HIGHLIGHT_STYLE: Record<HighlightColor, string> = {
  yellow: "background-color: rgba(253, 224, 71, 0.55); border-radius: 2px;",
  green: "background-color: rgba(134, 239, 172, 0.55); border-radius: 2px;",
  blue: "background-color: rgba(147, 197, 253, 0.55); border-radius: 2px;",
  pink: "background-color: rgba(249, 168, 212, 0.55); border-radius: 2px;",
}

const PEN_STYLE: Record<PenColor, string> = {
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  purple: "#9333ea",
}

const PEN_STYLE_DARK: Record<PenColor, string> = {
  red: "#fca5a5",
  blue: "#93c5fd",
  green: "#86efac",
  purple: "#d8b4fe",
}

const UNDERLINE_DECORATION: Record<UnderlineStyle, string> = {
  solid: "solid",
  wavy: "wavy",
  double: "double",
  dotted: "dotted",
}

const getPenColor = (editable: HTMLElement, color: PenColor) =>
  editable.classList.contains("ex-editable-dark")
    ? PEN_STYLE_DARK[color]
    : PEN_STYLE[color]

const isCustomFormatSpan = (node: Node): node is HTMLSpanElement =>
  node instanceof HTMLSpanElement &&
  (node.hasAttribute("data-ex-highlight") ||
    node.hasAttribute("data-ex-pen") ||
    node.hasAttribute("data-ex-underline"))

const unwrapCustomSpansInRange = (range: Range) => {
  const spans: HTMLSpanElement[] = []
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) =>
        isCustomFormatSpan(node) && range.intersectsNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
    }
  )

  let current = walker.nextNode()
  while (current) {
    if (isCustomFormatSpan(current)) spans.push(current)
    current = walker.nextNode()
  }

  spans.forEach((span) => {
    const parent = span.parentNode
    if (!parent) return
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span)
    }
    parent.removeChild(span)
  })
}

type SavedSelection = {
  range: Range
  editable: HTMLElement
}

let savedSelection: SavedSelection | null = null

const isEditableField = (node: Node | null): node is HTMLElement =>
  node instanceof HTMLElement && node.hasAttribute("data-editable-field")

export const findEditableRoot = (node: Node | null): HTMLElement | null => {
  let current: Node | null = node
  while (current) {
    if (isEditableField(current)) return current
    current = current.parentNode
  }
  return null
}

export const getSelectionInEditable = (): SavedSelection | null => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null
  }

  const range = selection.getRangeAt(0)
  const editable = findEditableRoot(range.commonAncestorContainer)
  if (!editable) return null

  return { editable, range: range.cloneRange() }
}

/** Call on every valid selection so toolbar clicks can restore it */
export const syncSavedSelection = () => {
  const ctx = getSelectionInEditable()
  if (ctx) {
    savedSelection = ctx
  }
}

const getFormatContext = (): SavedSelection | null => {
  if (savedSelection?.editable.isConnected) {
    return {
      editable: savedSelection.editable,
      range: savedSelection.range.cloneRange(),
    }
  }
  return getSelectionInEditable()
}

const restoreSelectionToWindow = (ctx: SavedSelection) => {
  ctx.editable.focus({ preventScroll: true })
  const selection = window.getSelection()
  if (!selection) return
  selection.removeAllRanges()
  selection.addRange(ctx.range.cloneRange())
}

const notifyEditableChange = (editable: HTMLElement) => {
  editable.dispatchEvent(new InputEvent("input", { bubbles: true }))
}

const wrapRange = (range: Range, wrapper: HTMLSpanElement) => {
  try {
    range.surroundContents(wrapper)
  } catch {
    wrapper.appendChild(range.extractContents())
    range.insertNode(wrapper)
  }

  const selection = window.getSelection()
  if (selection) {
    selection.removeAllRanges()
    const after = document.createRange()
    after.selectNodeContents(wrapper)
    after.collapse(false)
    selection.addRange(after)

    const editable = findEditableRoot(wrapper)
    if (editable) {
      savedSelection = { editable, range: after.cloneRange() }
    }
  }
}

const applyWrapper = (ctx: SavedSelection, wrapper: HTMLSpanElement) => {
  restoreSelectionToWindow(ctx)
  wrapRange(ctx.range, wrapper)
  notifyEditableChange(ctx.editable)
}

export const applyBold = () => {
  const ctx = getFormatContext()
  if (!ctx) return
  restoreSelectionToWindow(ctx)
  document.execCommand("bold")
  notifyEditableChange(ctx.editable)
}

export const applyItalic = () => {
  const ctx = getFormatContext()
  if (!ctx) return
  restoreSelectionToWindow(ctx)
  document.execCommand("italic")
  notifyEditableChange(ctx.editable)
}

export const applyHighlight = (color: HighlightColor) => {
  const ctx = getFormatContext()
  if (!ctx) return

  const wrapper = document.createElement("span")
  wrapper.setAttribute("data-ex-highlight", color)
  wrapper.style.cssText = HIGHLIGHT_STYLE[color]

  applyWrapper(ctx, wrapper)
}

export const applyPenColor = (color: PenColor) => {
  const ctx = getFormatContext()
  if (!ctx) return

  const penColor = getPenColor(ctx.editable, color)

  const wrapper = document.createElement("span")
  wrapper.setAttribute("data-ex-pen", color)
  wrapper.style.color = penColor

  applyWrapper(ctx, wrapper)
}

export const applyPenUnderline = (color: PenColor, style: UnderlineStyle) => {
  const ctx = getFormatContext()
  if (!ctx) return

  const penColor = getPenColor(ctx.editable, color)
  const decorationStyle = UNDERLINE_DECORATION[style]

  const wrapper = document.createElement("span")
  wrapper.setAttribute("data-ex-pen", color)
  wrapper.setAttribute("data-ex-underline", style)
  wrapper.style.cssText = `text-decoration-line: underline; text-decoration-color: ${penColor}; text-decoration-style: ${decorationStyle}; text-underline-offset: 2px;`

  applyWrapper(ctx, wrapper)
}

export const removeFormatting = () => {
  const ctx = getFormatContext()
  if (!ctx) return
  restoreSelectionToWindow(ctx)
  document.execCommand("removeFormat")
  unwrapCustomSpansInRange(ctx.range)
  notifyEditableChange(ctx.editable)
}

export const getSelectionRect = (): DOMRect | null => {
  syncSavedSelection()

  const ctx = savedSelection ?? getSelectionInEditable()
  if (!ctx) return null

  return ctx.range.getBoundingClientRect()
}
