import { Outlet, Link } from 'react-router-dom'
import Navbar from './Navbar'
import TabBar from './TabBar'
import styles from './MainLayout.module.css'

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <Navbar />

      {/* Mobile-only top bar - shows brand since Navbar is hidden on mobile */}
      <div className={styles.mobileHeader} aria-hidden="true">
        <Link to="/" className={styles.mobileBrand} tabIndex={-1}>
          <span className={styles.mobileBrandMark}>FC</span>
          <span className={styles.mobileBrandName}>FullCircle</span>
        </Link>
      </div>

      <main className={styles.main}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
