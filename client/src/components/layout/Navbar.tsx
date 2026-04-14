import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogIn, LayoutDashboard, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    addToast('Signed out.', 'info')
    navigate('/login')
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Brand */}
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>FC</span>
          <span className={styles.brandName}>FullCircle</span>
        </Link>

        {/* Primary nav */}
        <nav className={styles.nav} aria-label="Primary">
          <NavLink
            to="/browse"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          >
            Browse
          </NavLink>
          {user && (
            <>
              <NavLink
                to="/sell"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                Sell
              </NavLink>
              <NavLink
                to="/donate"
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                Donate
              </NavLink>
              {profile?.role === 'charity_rep' && (
                <NavLink
                  to="/charity"
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <LayoutDashboard size={15} aria-hidden="true" />
                  Dashboard
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          {user ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => `${styles.avatarBtn} ${isActive ? styles.avatarBtnActive : ''}`}
                aria-label="Profile"
              >
                <User size={16} aria-hidden="true" />
                <span className={styles.avatarName}>
                  {profile?.display_name?.split(' ')[0] ?? 'Profile'}
                </span>
              </NavLink>
              <button onClick={handleSignOut} className={styles.signOutBtn}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.signInBtn}>
              <LogIn size={15} aria-hidden="true" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
