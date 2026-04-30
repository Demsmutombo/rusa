// import { apiPost, apiGet } from './apiService'

export const authService = {
  async login(email, password) {
    // Simulation API call - replace with real API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock users for demo
        const mockUsers = [
          { id: '1', email: 'admin@rusa.travel', password: 'admin123', role: 'admin', name: 'Admin Rusa' },
          { id: '2', email: 'transport@rusa.travel', password: 'transport123', role: 'transport', name: 'Transporteur Rusa' },
          { id: '3', email: 'client@rusa.travel', password: 'client123', role: 'client', name: 'Client Rusa' }
        ]

        const user = mockUsers.find(u => u.email === email && u.password === password)
        
        if (user) {
          const { password: _password, ...userWithoutPassword } = user
          resolve({
            token: `mock-jwt-token-${user.id}-${Date.now()}`,
            user: {
              ...userWithoutPassword,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          })
        } else {
          reject(new Error('Email ou mot de passe incorrect'))
        }
      }, 1000)
    })

    // Real API call (uncomment when ready):
    // return apiPost('/auth/login', { email, password })
  },

  async getCurrentUser() {
    // Simulation API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const token = localStorage.getItem('token')
        if (!token) {
          reject(new Error('No token found'))
          return
        }

        // Extract user id from mock token
        const userId = token.split('-')[2]
        const mockUsers = {
          '1': { id: '1', email: 'admin@rusa.travel', role: 'admin', name: 'Admin Rusa' },
          '2': { id: '2', email: 'transport@rusa.travel', role: 'transport', name: 'Transporteur Rusa' },
          '3': { id: '3', email: 'client@rusa.travel', role: 'client', name: 'Client Rusa' }
        }

        const user = mockUsers[userId]
        if (user) {
          resolve({
            ...user,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        } else {
          reject(new Error('User not found'))
        }
      }, 500)
    })

    // Real API call:
    // return apiGet('/auth/me')
  }
}
