import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthLayout from '../components/auth/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'
import type { UserRole } from '../types'
import styles from './Signup.module.css'

export default function Signup() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [role, setRole]               = useState<UserRole>('user')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim(), role },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    addToast('Account created! Welcome to FullCircle.', 'success')
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout title="Create account" subtitle="Join the circular economy.">
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <Input
            label="Display name"
            type="text"
            name="displayName"
            autoComplete="name"
            required
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            hint="At least 8 characters"
            error={error || undefined}
          />

          <div className={styles.roleGroup}>
            <p className={styles.roleLabel}>I am a</p>
            <div className={styles.roleOptions}>
              <label className={`${styles.roleOption} ${role === 'user' ? styles.roleSelected : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className={styles.roleRadio}
                />
                <span className={styles.roleTitle}>Seller / Buyer</span>
                <span className={styles.roleDesc}>List items, bid on auctions</span>
              </label>

              <label className={`${styles.roleOption} ${role === 'charity_rep' ? styles.roleSelected : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="charity_rep"
                  checked={role === 'charity_rep'}
                  onChange={() => setRole('charity_rep')}
                  className={styles.roleRadio}
                />
                <span className={styles.roleTitle}>Charity Rep</span>
                <span className={styles.roleDesc}>Manage incoming donations</span>
              </label>
            </div>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg" className={styles.submit}>
          Create account
        </Button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}
