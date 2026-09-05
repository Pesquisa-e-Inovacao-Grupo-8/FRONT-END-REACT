// Dev-only mock authentication users. Loaded from main.jsx in development mode.
if (import.meta.env.DEV) {
  window.__mockAuthUsers = window.__mockAuthUsers || {
    ADMIN: {
      email: 'admin@local',
      senha: 'admin123',
      token: 'mock-admin-token',
      userId: '1',
      userName: 'Administrador',
      userRole: 'ADMIN'
    },
    USERS: [
      {
        email: 'cliente@local',
        senha: 'cliente123',
        token: 'mock-cliente-token',
        userId: '2',
        userName: 'Cliente Teste',
        userRole: 'CLIENTE'
      }
    ]
  };

  // helper to add users during runtime
  window.__mockAuthUsers.addUser = function (user) {
    this.USERS = this.USERS || [];
    this.USERS.push(user);
  };
}

export {};
