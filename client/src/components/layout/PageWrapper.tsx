import styles from './PageWrapper.module.css'

interface PageWrapperProps {
  children: React.ReactNode
  narrow?: boolean
}

export default function PageWrapper({ children, narrow = false }: PageWrapperProps) {
  return (
    <div className={`${styles.wrapper} ${narrow ? styles.narrow : ''}`}>
      {children}
    </div>
  )
}
