import type { Database } from '~/types/supabase'
import { useAuthStore } from '~/stores/auth'

// Define interfaces for the dashboard data
export interface AdminStats {
  totalStudents: number
  totalClasses: number
  activeModeratorCount: number
  joinRequestsCount: number
}

export interface ModeratorStats {
  assignedClasses: number
  studentCount: number
  lessonsCreated: number
}

export interface StudentStats {
  enrolledClasses: number
  attendanceRate: number
  completedQuizzes: number
}

export interface ClassItem {
  id: number
  name: string
  grade: number
  active: boolean
  schedule: string
  teacher: string
}

export interface ClassSchedule {
  name: string
  grade: number
  time: string
  students: number
}

export interface StudentActivity {
  student: string
  initials: string
  action: string
  time: string
}

export interface LessonItem {
  title: string
  class: string
  date: string
  time: string
}

export const useDashboard = () => {
  const supabase = useSupabaseClient<Database>()
  const authStore = useAuthStore()
  
  // Loading and error states
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  // Dashboard data
  const adminStats = ref<AdminStats>({
    totalStudents: 0,
    totalClasses: 0,
    activeModeratorCount: 0,
    joinRequestsCount: 0
  })
  
  const moderatorStats = ref<ModeratorStats>({
    assignedClasses: 0,
    studentCount: 0,
    lessonsCreated: 0
  })
  
  const studentStats = ref<StudentStats>({
    enrolledClasses: 0,
    attendanceRate: 0,
    completedQuizzes: 0
  })
  
  const classes = ref<ClassItem[]>([])
  const upcomingClasses = ref<ClassSchedule[]>([])
  const studentActivities = ref<StudentActivity[]>([])
  const upcomingLessons = ref<LessonItem[]>([])
  
  // Role computed properties - ensure we safely access the user object
  const isAdmin = computed(() => authStore.user?.role === 'ADMIN')
  const isModerator = computed(() => authStore.user?.role === 'MODERATOR')
  const isStudent = computed(() => authStore.user?.role === 'STUDENT')
  
  /**
   * Fetch admin dashboard data - You will implement this with your Supabase queries
   */
  const fetchAdminDashboardData = async () => {
    try {
      // Placeholder for your Supabase queries to fetch admin dashboard data
      // You will implement this according to your database schema
    } catch (err) {
      error.value = err as Error
      console.error('Error fetching admin dashboard data:', err)
    }
  }

  /**
   * Fetch moderator dashboard data - You will implement this with your Supabase queries
   */
  const fetchModeratorDashboardData = async (userId: string) => {
    try {
      // Placeholder for your Supabase queries to fetch moderator dashboard data
      // You will implement this according to your database schema
    } catch (err) {
      error.value = err as Error
      console.error('Error fetching moderator dashboard data:', err)
    }
  }

  /**
   * Fetch student dashboard data - You will implement this with your Supabase queries
   */
  const fetchStudentDashboardData = async (userId: string) => {
    try {
      // Placeholder for your Supabase queries to fetch student dashboard data
      // You will implement this according to your database schema
    } catch (err) {
      error.value = err as Error
      console.error('Error fetching student dashboard data:', err)
    }
  }

  /**
   * Main function to fetch dashboard data based on user role
   */
  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Make sure we have a valid user
      if (!authStore.user?.id) {
        console.warn('User not authenticated or user data not loaded yet')
        return
      }
      
      const userId = authStore.user.id
      
      // Add some mock data for testing the charts and UI
      if (isAdmin.value) {
        adminStats.value = {
          totalStudents: 245,
          totalClasses: 18,
          activeModeratorCount: 12,
          joinRequestsCount: 7
        }
        
        upcomingClasses.value = [
          { name: 'Physics 101', grade: 10, time: 'Today, 10:00 AM', students: 28 },
          { name: 'Chemistry Lab', grade: 11, time: 'Today, 1:30 PM', students: 24 },
          { name: 'Mathematics', grade: 9, time: 'Tomorrow, 9:00 AM', students: 32 },
          { name: 'Biology', grade: 8, time: 'Tomorrow, 11:00 AM', students: 26 }
        ]
        
        // Call your implementation when ready
        // await fetchAdminDashboardData()
      } else if (isModerator.value) {
        moderatorStats.value = {
          assignedClasses: 5,
          studentCount: 138,
          lessonsCreated: 42
        }
        
        upcomingClasses.value = [
          { name: 'Physics 101', grade: 10, time: 'Today, 10:00 AM', students: 28 },
          { name: 'Chemistry Lab', grade: 11, time: 'Today, 1:30 PM', students: 24 },
          { name: 'Science Lab', grade: 9, time: 'Tomorrow, 9:00 AM', students: 26 }
        ]
        
        studentActivities.value = [
          { student: 'John Doe', initials: 'JD', action: 'submitted an assignment', time: '10 minutes ago' },
          { student: 'Sarah Johnson', initials: 'SJ', action: 'joined Physics class', time: '1 hour ago' },
          { student: 'Mike Peters', initials: 'MP', action: 'completed a quiz', time: '3 hours ago' }
        ]
        
        // Call your implementation when ready
        // await fetchModeratorDashboardData(userId)
      } else if (isStudent.value) {
        studentStats.value = {
          enrolledClasses: 6,
          attendanceRate: 94,
          completedQuizzes: 12
        }
        
        classes.value = [
          { id: 1, name: 'Physics 101', grade: 10, active: true, schedule: 'Mon, Wed 10:00 AM', teacher: 'Dr. Johnson' },
          { id: 2, name: 'Chemistry Lab', grade: 10, active: true, schedule: 'Tue, Thu 1:30 PM', teacher: 'Ms. Williams' },
          { id: 3, name: 'Mathematics', grade: 10, active: true, schedule: 'Mon, Wed, Fri 9:00 AM', teacher: 'Mr. Davis' },
          { id: 4, name: 'Biology', grade: 10, active: false, schedule: 'Tue, Thu 11:00 AM', teacher: 'Dr. Miller' }
        ]
        
        upcomingLessons.value = [
          { title: 'Introduction to Forces', class: 'Physics 101', date: 'Today', time: '10:00 AM' },
          { title: 'Chemical Reactions', class: 'Chemistry Lab', date: 'Today', time: '1:30 PM' },
          { title: 'Algebra Review', class: 'Mathematics', date: 'Tomorrow', time: '9:00 AM' }
        ]
        
        // Call your implementation when ready
        // await fetchStudentDashboardData(userId)
      } else {
        console.warn('Unknown user role:', authStore.user.role)
      }
    } catch (err) {
      error.value = err as Error
      console.error('Error fetching dashboard data:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Format date with smart labels like "Today" or "Tomorrow"
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return `${date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
  }

  /**
   * Format date short version
   */
  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  /**
   * Format time from date string
   */
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return {
    // State
    loading,
    error,
    
    // Role checks
    isAdmin,
    isModerator,
    isStudent,
    
    // Stats data
    adminStats,
    moderatorStats,
    studentStats,
    
    // Content data
    classes,
    upcomingClasses,
    studentActivities,
    upcomingLessons,
    
    // Methods
    fetchDashboardData
  }
}