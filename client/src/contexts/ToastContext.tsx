import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { X } from 'lucide-react'
import styles from '../components/ui/Toast.module.css'

export type ToastType = 'info' | 'success' | 'warning' | 'error'
interface Toast { id: string; message: string; type: ToastType }
interface ToastContextValue { addToast: (message: string, type?: ToastType) => void }

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} })
export function useToast() { return useContext(ToastContext) }

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div className={`${styles.toast} ${styles[toast.type]}`} role="alert">
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.close} onClick={onDismiss} aria-label="Dismiss"><X size={14} /></button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `t${++counter.current}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  function dismiss(id: string) { setToasts(prev => prev.filter(t => t.id !== id)) }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.length > 0 && (
        <div className={styles.container} aria-live="polite">
          {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />)}
        </div>
      )}
    </ToastContext.Provider>
  )
}
