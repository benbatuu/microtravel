// Main route protection components
export { AuthGuard, RequireAuth, RequireSubscription, RequireAdmin, GuestOnly } from './AuthGuard'
export { RouteGuard, RequireAuth as RouteRequireAuth, RequireSubscription as RouteRequireSubscription, RequireAdmin as RouteRequireAdmin } from './RouteGuard'

// Subscription-specific guards
export {
    SubscriptionGuard,
    RequireExplorer,
    RequireTraveler,
    RequireEnterprise,
    FeatureGate
} from './SubscriptionGuard'

// Admin-specific guards
export {
    AdminGuard,
    AdminSection,
    AdminFeatureGate,
    useAdminStatus
} from './AdminGuard'

// Unauthorized pages
export {
    UnauthorizedPage,
    AuthenticationRequired,
    SubscriptionUpgradeRequired,
    AdminRequired,
    SubscriptionExpired,
    MiddlewareError
} from './UnauthorizedPage'

// Auth forms (existing)
export { LoginForm } from './LoginForm'
export { SignupForm } from './SignupForm'
export { PasswordReset } from './PasswordReset'