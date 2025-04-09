import { allRoutes } from "~/config/navigation";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const user = useSupabaseUser();

  // Redirect to login if no session
  if (!user.value) {
    return navigateTo("/auth/sign-in");
  }

  const auth = useAuthStore();

  if (!auth.user) {
    // Redirect to login if not logged in
    return navigateTo("/auth/sign-in");
  }

  // Get user role from metadata
  const userRole = auth.user.role as
    | "ADMIN"
    | "MODERATOR"
    | "STUDENT";
  if (!userRole) {
    return navigateTo("/auth/sign-in");
  }

  // Check if route exists in our configuration
  const route = allRoutes.find((route) => {
    // Convert route pattern to regex to handle dynamic routes
    const routePattern = route.href.replace(/\[.*?\]/g, "[^/]+");
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(to.path);
  });

  // If route is not defined in our config, or user doesn't have access
  if (!route || !route.access.includes(userRole)) {
    // Redirect to dashboard or show 404/403
    return navigateTo("/console/dashboard");
  }
});
