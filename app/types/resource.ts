import type { Database } from './supabase'

// Base resource types
export type ResourceType = 'Document' | 'Video' | 'Image' | 'Link'
export type ResourceCategory = 'notice' | 'resource'

// Row type from database
export type ResourceRow = Database['public']['Tables']['learning_resources_and_notices']['Row']
export type ClassResourceRow = Database['public']['Tables']['class_has_resources']['Row']

// Base resource interface
export interface BaseResource {
  id: number
  title: string
  description: string | null
  url: string
  created_at: string
  createdAt: string
  classes: string[]  // Display names for classes
  classIds: number[] // IDs of classes
  classData?: Array<{  // Optional raw class data
    class_id: number
    classes: {
      id: number
      name: string
      grade: number
    }
  }>
}

// Specific resource types
export interface Resource extends BaseResource {
  type: 'resource'
  resource_type: ResourceType
}

export interface Notice extends BaseResource {
  type: 'notice'
  resource_type: 'Image'
}

export type CombinedResource = Resource | Notice

// Form interfaces
export interface ResourceFormData {
  title: string
  description: string
  classes: string[]
  type: ResourceCategory
  resource_type: ResourceType
  url: string
}