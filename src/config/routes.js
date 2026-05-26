export const ROUTES = {
  // Public
  HOME:            '/',
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // User (authenticated)
  FIXTURE:      '/fixture',
  AGENDA:       '/agenda',
  MATCH_DETAIL: '/match/:matchId',
  POOLS:        '/pools',
  POOL_DETAIL:  '/pools/:poolId',
  POOL_CREATE:  '/pools/new',
  PREDICT:      '/predict/:matchId',
  ALBUM:        '/album',
  TICKETS:      '/tickets',
  GROUPS:       '/groups',
  NATIONS:      '/nations',
  PROFILE:      '/profile',

  // Admin
  ADMIN:         '/admin',
  ADMIN_USERS:   '/admin/users',
  ADMIN_MATCHES: '/admin/matches',
  ADMIN_ALERTS:  '/admin/alerts',
}
