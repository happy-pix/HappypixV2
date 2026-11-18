import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginCustomer, fetchCustomerMe, updateCustomerProfile } from '../lib/api.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'hp_customer_token'
const DATA_KEY = 'hp_customer_data'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null
    } catch {
      return null
    }
  })

  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(DATA_KEY)
      return saved ? JSON.parse(saved) : { user: null, organization: null, subscription: null }
    } catch {
      return { user: null, organization: null, subscription: null }
    }
  })

  const [loading, setLoading] = useState(Boolean(token))

  const logout = useCallback(() => {
    setToken(null)
    setState({ user: null, organization: null, subscription: null })
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(DATA_KEY)
    } catch {}
  }, [])

  const refreshProfile = useCallback(async (activeToken = token) => {
    if (!activeToken) {
      setLoading(false)
      return null
    }
    try {
      const data = await fetchCustomerMe(activeToken)
      setState({
        user: data.user,
        organization: data.organization,
        subscription: data.subscription,
      })
      try {
        localStorage.setItem(DATA_KEY, JSON.stringify(data))
      } catch {}
      return data
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        logout()
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [token, logout])

  useEffect(() => {
    if (token) {
      refreshProfile(token)
    } else {
      setLoading(false)
    }
  }, [token, refreshProfile])

  const login = async (email, password) => {
    const res = await loginCustomer({ email, password })
    setToken(res.token)
    setState({
      user: res.user,
      organization: res.organization,
      subscription: res.subscription,
    })
    try {
      localStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(DATA_KEY, JSON.stringify(res))
    } catch {}
    return res
  }

  const updateProfile = async (formData) => {
    if (!token) throw new Error('Not logged in')
    const res = await updateCustomerProfile(token, formData)
    setState((prev) => ({
      ...prev,
      user: res.user,
      organization: res.organization || prev.organization,
    }))
    try {
      const current = JSON.parse(localStorage.getItem(DATA_KEY) || '{}')
      current.user = res.user
      if (res.organization) current.organization = res.organization
      localStorage.setItem(DATA_KEY, JSON.stringify(current))
    } catch {}
    return res
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user: state.user,
        organization: state.organization,
        subscription: state.subscription,
        isAuthed: Boolean(token && state.user),
        loading,
        login,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within an AuthProvider')
  }
  return ctx
}

