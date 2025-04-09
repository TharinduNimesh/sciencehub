import type { Database } from '~/types/supabase'
import { useAuthStore } from '~/stores/auth'
import type { JoinRequest, JoinRequestDB, JoinRequestStatusDB } from './useJoinRequests'
import type { ClassMethod } from '~/types/supabase'
import type { CombinedResource, ResourceType } from '~/types/resource'

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
  method: ClassMethod
}

export interface StudentActivity {
  student: string
  initials: string
  action: string
  time: string
}

export interface LessonItem {
  id: number;
  title: string;
  class: string;
  className: string;
  date: string;
  time: string;
  created_at: string;
}

interface ClassWithDetails {
  id: number
  name: string
  grade: number
  date: string
  start_time: string
  end_time: string
  method: ClassMethod
  is_active: boolean
  moderators: Array<{
    moderators: {
      name: string
    }
  }>
}

interface ClassSessionWithDetails {
  id: number
  date: string
  start_time: string
  end_time: boolean
  is_cancelled: boolean
  class_id: number
  classes: {
    name: string
    grade: number
    method: ClassMethod
  }
}

interface ClassSessionResponse {
  id: number
  date: string
  start_time: string
  end_time: string
  classes: {
    name: string
    grade: number
    method: ClassMethod
  }
}

interface LessonResponse {
  id: number
  title: string
  created_at: string
  class_lessons: Array<{
    classes: {
      name: string
      grade: number
    }
  }>
}

interface ResourceResponse {
  id: number
  title: string
  description: string | null
  type: 'notice' | 'resource'
  resource_type: string
  url: string
  created_at: string
  class_has_resources: Array<{
    class_id: number
    classes: {
      id: number
      name: string
      grade: number
    }
  }>
}

// Add type for Supabase response
interface ResourceWithClasses {
  id: number
  title: string
  description: string | null
  type: 'notice' | 'resource'
  resource_type: string
  url: string
  created_at: string
  class_has_resources: Array<{
    class_id: number
    classes: {
      id: number
      name: string
      grade: number
    }
  }>
}

const mockClasses: ClassSchedule[] = [
  { name: 'Physics 101', grade: 10, time: 'Today, 10:00 AM', students: 28, method: 'VirtualRecurringSeries' },
  { name: 'Chemistry Lab', grade: 11, time: 'Today, 1:30 PM', students: 24, method: 'InPersonRecurringSeries' },
  { name: 'Mathematics', grade: 9, time: 'Tomorrow, 9:00 AM', students: 32, method: 'VirtualRecurringSeries' }
]

export const useDashboard = () => {
  const supabase = useSupabaseClient<Database>()
  const authStore = useAuthStore()
  const notification = useNotification()
  
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
    enrolledClasses: 0
  })
  
  const classes = ref<ClassItem[]>([])
  const upcomingClasses = ref<ClassSchedule[]>([])
  const studentActivities = ref<StudentActivity[]>([])
  const upcomingLessons = ref<LessonItem[]>([])
  const latestJoinRequests = ref<JoinRequest[]>([])
  const latestNotices = ref<CombinedResource[]>([])
  const latestNotes = ref<CombinedResource[]>([])

  /**
   * Fetch admin dashboard data using Supabase queries
   */
  const fetchAdminDashboardData = async () => {
    try {
      loading.value = true
      error.value = null

      // Get total active students count
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (studentsError) throw studentsError

      // Get total active classes count
      const { count: totalClasses, error: classesError } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (classesError) throw classesError

      // Get pending join requests count
      const { count: joinRequestsCount, error: joinRequestsError } = await supabase
        .from('join_requests')
        .select(`
          id,
          join_request_status!left (
            status
          )
        `, { count: 'exact', head: true })
        .is('join_request_status.status', null)

      if (joinRequestsError) throw joinRequestsError

      // Update admin stats
      adminStats.value = {
        totalStudents: totalStudents || 0,
        totalClasses: totalClasses || 0,
        activeModeratorCount: 0, // Keep as 0 for now as requested
        joinRequestsCount: joinRequestsCount || 0
      }

      // Get upcoming classes for today and tomorrow
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: sessions, error: sessionsError } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          start_time,
          end_time,
          is_cancelled,
          class_id,
          classes (
            name,
            grade,
            method
          )
        `)
        .in('date', [today.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0]])
        .eq('is_cancelled', false)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (sessionsError) throw sessionsError

      // Transform sessions into upcoming classes format
      upcomingClasses.value = (sessions as unknown as ClassSessionWithDetails[]).map(session => ({
        name: session.classes?.name || '',
        grade: session.classes?.grade || 0,
        time: `${session.date === today.toISOString().split('T')[0] ? 'Today' : 'Tomorrow'}, ${session.start_time.slice(0, 5)}`,
        students: 0, // This would need a subquery to count students, can be added later
        method: session.classes?.method || 'VirtualRecurringSeries'
      }))

      // Get latest join requests
      const { data: latestRequests, error: latestRequestsError } = await supabase
        .from('join_requests')
        .select(`
          *,
          join_request_status:join_request_status (
            status,
            updated_at
          )
        `)
        .not('join_request_status.status', 'is', true)
        .not('join_request_status.status', 'is', false)
        .order('created_at', { ascending: false })
        .limit(5)

      if (latestRequestsError) throw latestRequestsError

      latestJoinRequests.value = (latestRequests as Array<JoinRequestDB & {
        join_request_status: Array<JoinRequestStatusDB>
      }>).map(request => ({
        id: request.id,
        name: request.name,
        email: request.email,
        grade: request.grade,
        contactNumber: request.mobile,
        referralSource: request.how_did_find_us,
        status: 'Pending',
        requestedAt: request.created_at,
        acceptedAt: request.join_request_status?.[0]?.updated_at || null,
        invitationStatus: null
      }))

    } catch (err) {
      error.value = err as Error
      console.error('Error fetching admin dashboard data:', err)
    } finally {
      loading.value = false
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
   * Fetch student dashboard data using Supabase queries
   */
  const fetchStudentDashboardData = async () => {
    try {
      loading.value = true
      error.value = null

      // Get the total enrolled classes count from class_lessons view - RLS will handle permissions
      const { data: enrolledClasses, error: classesError } = await supabase
        .from('classes')
        .select('id')

      if (classesError) throw classesError

      // Update student stats
      studentStats.value = {
        enrolledClasses: enrolledClasses?.length || 0
      }

      // Get upcoming class sessions - RLS will filter to student's classes
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: sessions, error: sessionsError } = await supabase
        .from('class_sessions')
        .select(`
          id,
          date,
          start_time,
          end_time,
          classes (
            name,
            grade,
            method
          )
        `)
        .in('date', [today.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0]])
        .eq('is_cancelled', false)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (sessionsError) throw sessionsError

      // Transform sessions into upcoming classes format
      upcomingClasses.value = (sessions as unknown as Array<{
        id: number
        date: string
        start_time: string
        end_time: string
        classes: {
          name: string
          grade: number
          method: ClassMethod
        }
      }>).map(session => ({
        name: session.classes.name,
        grade: session.classes.grade,
        time: `${session.date === today.toISOString().split('T')[0] ? 'Today' : 'Tomorrow'}, ${session.start_time.slice(0, 5)}`,
        students: 0,
        method: session.classes.method
      }))

      // Get latest lessons - RLS will filter to student's classes
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          created_at,
          class_lessons!inner (
            classes (
              name,
              grade
            )
          )
        `)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(5)

      if (lessonsError) throw lessonsError

      // Transform and update upcoming lessons with proper typing
      upcomingLessons.value = (lessons as unknown as Array<{
        id: number
        title: string
        created_at: string
        class_lessons: Array<{
          classes: {
            name: string
            grade: number
          }
        }>
      }>).map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        class: lesson.class_lessons[0]?.classes?.name || '',
        className: `Grade ${lesson.class_lessons[0]?.classes?.grade} | ${lesson.class_lessons[0]?.classes?.name}`,
        date: formatDateShort(lesson.created_at),
        time: formatTime(lesson.created_at),
        created_at: lesson.created_at
      }))

      // Get latest notices and resources
      const { data: notices, error: noticesError } = await supabase
        .from('learning_resources_and_notices')
        .select(`
          id,
          title,
          description,
          type,
          resource_type,
          url,
          created_at,
          class_has_resources (
            class_id,
            classes (
              id,
              name,
              grade
            )
          )
        `)
        .eq('type', 'notice')
        .order('created_at', { ascending: false })
        .limit(3)

      if (noticesError) throw noticesError

      // Get latest notes (resources)
      const { data: notes, error: notesError } = await supabase
        .from('learning_resources_and_notices')
        .select(`
          id,
          title,
          description,
          type,
          resource_type,
          url,
          created_at,
          class_has_resources (
            class_id,
            classes (
              id,
              name,
              grade
            )
          )
        `)
        .eq('type', 'resource')
        .order('created_at', { ascending: false })
        .limit(3)

      if (notesError) throw notesError

      // Transform and set notices and notes
      latestNotices.value = (notices as unknown as ResourceWithClasses[]).map(notice => ({
        id: notice.id,
        title: notice.title,
        description: notice.description,
        type: 'notice' as const,
        resource_type: 'Image' as const,
        url: notice.url,
        created_at: notice.created_at,
        createdAt: notice.created_at,
        classIds: notice.class_has_resources.map(chr => chr.class_id),
        classes: notice.class_has_resources.map(chr => 
          `Grade ${chr.classes.grade} - ${chr.classes.name}`
        ),
        classData: notice.class_has_resources.map(chr => ({
          class_id: chr.class_id,
          classes: chr.classes
        }))
      }))
      
      latestNotes.value = (notes as unknown as ResourceWithClasses[]).map(note => ({
        id: note.id,
        title: note.title,
        description: note.description,
        type: 'resource' as const,
        resource_type: note.resource_type as ResourceType,
        url: note.url,
        created_at: note.created_at,
        createdAt: note.created_at,
        classIds: note.class_has_resources.map(chr => chr.class_id),
        classes: note.class_has_resources.map(chr => 
          `Grade ${chr.classes.grade} - ${chr.classes.name}`
        ),
        classData: note.class_has_resources.map(chr => ({
          class_id: chr.class_id,
          classes: chr.classes
        }))
      }))

    } catch (err) {
      error.value = err as Error
      console.error('Error fetching student dashboard data:', err)
    } finally {
      loading.value = false
    }
  }

  const handleApproveRequest = async (request: JoinRequest) => {
    try {
      const { error } = await supabase
        .from('join_request_status')
        .upsert({
          id: request.id,
          status: true,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update the local state
      latestJoinRequests.value = latestJoinRequests.value.filter(r => r.id !== request.id)
      
      // Update the admin stats
      adminStats.value.joinRequestsCount--

      notification.showSuccess('Join request approved successfully')
    } catch (err) {
      console.error('Error approving join request:', err)
      notification.showError('Failed to approve join request')
    }
  }

  const handleRejectRequest = async (request: JoinRequest) => {
    try {
      const { error } = await supabase
        .from('join_request_status')
        .upsert({
          id: request.id,
          status: false,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update the local state
      latestJoinRequests.value = latestJoinRequests.value.filter(r => r.id !== request.id)
      
      // Update the admin stats
      adminStats.value.joinRequestsCount--

      notification.showSuccess('Join request rejected successfully')
    } catch (err) {
      console.error('Error rejecting join request:', err)
      notification.showError('Failed to reject join request')
    }
  }

  const fetchJoinRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          *,
          join_request_status:join_request_status (
            status,
            updated_at
          )
        `)
        .is('join_request_status.status', null)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      // Transform the data to match our interface
      latestJoinRequests.value = (data as Array<JoinRequestDB & {
        join_request_status: Array<JoinRequestStatusDB>
      }>).map(request => ({
        id: request.id,
        name: request.name,
        email: request.email,
        grade: request.grade,
        contactNumber: request.mobile,
        referralSource: request.how_did_find_us,
        status: 'Pending',
        requestedAt: request.created_at,
        acceptedAt: request.join_request_status?.[0]?.updated_at || null,
        invitationStatus: null
      }))
    } catch (err) {
      console.error('Error fetching join requests:', err)
      error.value = err as Error
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
      const userRole = authStore.user.role
      
      if (userRole === 'ADMIN') {
        await fetchAdminDashboardData()
      } else if (userRole === 'MODERATOR') {
        moderatorStats.value = {
          assignedClasses: 5,
          studentCount: 138,
          lessonsCreated: 42
        }
        
        // Keep moderator mock data for now until implemented
        upcomingClasses.value = mockClasses.slice(0, 3)
        
        studentActivities.value = [
          { student: 'John Doe', initials: 'JD', action: 'submitted an assignment', time: '10 minutes ago' },
          { student: 'Sarah Johnson', initials: 'SJ', action: 'joined Physics class', time: '1 hour ago' },
          { student: 'Mike Peters', initials: 'MP', action: 'completed a quiz', time: '3 hours ago' }
        ]
      } else if (userRole === 'STUDENT') {
        await fetchStudentDashboardData()
      } else {
        console.warn('Unknown user role:', userRole)
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
    
    // Stats data
    adminStats,
    moderatorStats,
    studentStats,
    
    // Content data
    classes,
    upcomingClasses,
    studentActivities,
    upcomingLessons,
    latestJoinRequests,
    latestNotices,
    latestNotes,
    
    // Methods
    fetchDashboardData,
    handleApproveRequest,
    handleRejectRequest,
    formatDateShort
  }
}