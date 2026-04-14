import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import TabBar from './TabBar'
import styles from './MainLayout.module.css'

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
