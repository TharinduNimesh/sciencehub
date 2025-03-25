// Define available roles as a union type for better type safety
export type Role = 'ADMIN' | 'MODERATOR' | 'STUDENT'

interface NavigationItem {
  title: string
  href: string
  icon: string
  access: Role[]
  showInSidebar?: boolean
}

interface NavigationSection {
  title: string
  access: Role[]
  items: NavigationItem[]
}

// All available routes with their access control
export const allRoutes: NavigationItem[] = [
  // Core routes
  {
    title: 'Dashboard',
    href: '/console/dashboard',
    icon: 'i-heroicons-squares-2x2',
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    showInSidebar: true
  },
  {
    title: 'Join Requests',
    href: '/console/join-requests',
    icon: 'i-heroicons-users',
    access: ['ADMIN'],
    showInSidebar: true
  },
  {
    title: 'Resources Hub',
    href: '/console/resources-hub',
    icon: 'i-heroicons-chat-bubble-left-right',
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    showInSidebar: true
  },
  // Academic routes
  {
    title: 'Classes',
    href: '/console/classes',
    icon: 'i-heroicons-book-open',
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    showInSidebar: true
  },
  {
    title: 'Attendance',
    href: '/console/attendance',
    icon: 'i-heroicons-calendar',
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    showInSidebar: true
  },
  {
    title: 'Lessons',
    href: '/console/lessons',
    icon: 'i-heroicons-academic-cap',
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    showInSidebar: true
  },
  {
    title: 'Quizzes',
    href: '/console/quizzes',
    icon: 'i-heroicons-clipboard-document-list',
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    showInSidebar: true
  },
  // Administration routes
  {
    title: 'Student Management',
    href: '/console/students',
    icon: 'i-heroicons-users',
    access: ['ADMIN', 'MODERATOR'],
    showInSidebar: true
  },
  {
    title: 'Student Management',
    href: '/console/students/account-setup',
    icon: 'i-heroicons-users',
    access: ['STUDENT'],
    showInSidebar: false
  },
  {
    title: 'Student Details',
    href: '/console/students/[id]',
    icon: 'i-heroicons-user',
    access: ['ADMIN', 'MODERATOR'],
    showInSidebar: false
  },
  {
    title: 'Moderator Management',
    href: '/console/moderators',
    icon: 'i-heroicons-user-group',
    access: ['ADMIN'],
    showInSidebar: true
  },
  {
    title: 'Moderator Details',
    href: '/console/moderators/[id]',
    icon: 'i-heroicons-user',
    access: ['ADMIN'],
    showInSidebar: false
  },
  {
    title: 'Fees Management',
    href: '/console/fees',
    icon: 'i-heroicons-credit-card',
    access: ['ADMIN'],
    showInSidebar: true
  },
  {
    title: 'Product Management',
    href: '/console/products',
    icon: 'i-heroicons-shopping-bag',
    access: ['ADMIN'],
    showInSidebar: true
  },
  {
    title: 'Product Details',
    href: '/console/products/[id]',
    icon: 'i-heroicons-shopping-bag',
    access: ['ADMIN'],
    showInSidebar: false
  }
]

// Sidebar navigation sections
export const navSections: NavigationSection[] = [
  {
    title: "Core",
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    items: allRoutes.filter(route => 
      route.showInSidebar && 
      ['dashboard', 'join-requests', 'resources-hub'].some(path => route.href.includes(path))
    )
  },
  {
    title: "Academic",
    access: ['ADMIN', 'MODERATOR', 'STUDENT'],
    items: allRoutes.filter(route => 
      route.showInSidebar && 
      ['classes', 'attendance', 'lessons', 'quizzes'].some(path => route.href.includes(path))
    )
  },
  {
    title: "Administration",
    access: ['ADMIN', 'MODERATOR'],
    items: allRoutes.filter(route => 
      route.showInSidebar && 
      ['students', 'moderators', 'fees', 'products'].some(path => route.href.includes(path))
    )
  }
]