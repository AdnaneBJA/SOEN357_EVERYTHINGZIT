import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthLayout from '../components/auth/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useToast } from '../contexts/ToastContext'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useToast()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const from = (location.state as { from?: string })?.from ?? '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    addToast('Welcome back!', 'success')
    navigate(from, { replace: true })
  }

  return (
    <AuthLayout title="Sign in" subtitle="Good to see you again.">
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
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
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            error={error || undefined}
          />
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg" className={styles.submit}>
          Sign in
        </Button>
      </form>

      <p className={styles.footer}>
        No account?{' '}
        <Link to="/signup" className={styles.link}>Create one</Link>
      </p>

      <div className={styles.demo}>
        <p className={styles.demoLabel}>Demo credentials</p>
        <p className={styles.demoValue}>sophie.martin@demo.fc · demo1234</p>
      </div>
    </AuthLayout>
  )
}
