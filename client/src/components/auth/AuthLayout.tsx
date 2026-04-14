import { Link } from 'react-router-dom'
import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>FC</span>
          <span className={styles.brandName}>FullCircle</span>
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {children}
      </div>
    </div>
  )
}
