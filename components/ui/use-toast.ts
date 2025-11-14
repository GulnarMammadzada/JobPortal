"use client"

import * as React from "react"

type ToastVariant = "default" | "success" | "destructive"

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToasterToast = Toast & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000 // Keep toasts visible until dismissed

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: Toast
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<Toast>
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId?: Toast["id"]
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId?: Toast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This means all toasts will be dismissed.
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: ((state: State) => void)[] = []

let state: State = {
  toasts: [],
}

function setState(action: Action) {
  state = reducer(state, action)
  listeners.forEach((listener) => listener(state))
}

function dispatch(action: Action) {
  setState(action)
}

export function useToast() {
  const [activeToasts, setActiveToasts] = React.useState(state.toasts)

  React.useEffect(() => {
    const listener = (newState: State) => {
      setActiveToasts(newState.toasts)
    }

    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts: activeToasts,
    toast: React.useCallback((props: Toast) => {
      const id = genId()

      const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: dismiss,
        },
      })

      return {
        id: id,
        dismiss,
      }
    }, []),
  }
}
