import { NavLink } from 'react-router-dom'
import { Home, Search, Tag, Heart, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import styles from './TabBar.module.css'

const guestTabs = [
  { to: '/',       label: 'Home',   Icon: Home   },
  { to: '/browse', label: 'Browse', Icon: Search },
  { to: '/login',  label: 'Sign in', Icon: User  },
]

const userTabs = [
  { to: '/',        label: 'Home',    Icon: Home   },
  { to: '/browse',  label: 'Browse',  Icon: Search },
  { to: '/sell',    label: 'Sell',    Icon: Tag    },
  { to: '/donate',  label: 'Donate',  Icon: Heart  },
  { to: '/profile', label: 'Profile', Icon: User   },
]

export default function TabBar() {
  const { user } = useAuth()
  const tabs = user ? userTabs : guestTabs

  return (
    <nav className={styles.tabBar} aria-label="Mobile navigation">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
        >
          <Icon size={22} className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
