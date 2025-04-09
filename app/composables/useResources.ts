import { ref } from 'vue'
import type { Database } from '~/types/supabase'
import type { ResourceRow, ResourceFormData, Resource, Notice, CombinedResource, ResourceType } from '~/types/resource'

interface ResourceResponse {
  id: number
  title: string
  description: string | null
  type: 'notice' | 'resource'
  resource_type: ResourceType
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

export const useResources = () => {
  const supabase = useSupabaseClient<Database>()
  const loading = ref(false)

  const getResources = async (type: 'notice' | 'resource'): Promise<CombinedResource[]> => {
    try {
      loading.value = true
      const { data: rawData, error } = await supabase
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
        .eq('type', type)
        .order('created_at', { ascending: false })

      if (error) throw error

      // First cast to unknown, then to our known response type
      const data = rawData as unknown as ResourceResponse[]

      return data.map(resource => {
        const base = {
          id: resource.id,
          title: resource.title,
          description: resource.description,
          url: resource.url,
          created_at: resource.created_at,
          createdAt: resource.created_at,
          // Store both class IDs and formatted names
          classIds: resource.class_has_resources.map(chr => chr.class_id),
          classes: resource.class_has_resources.map(chr => 
            `Grade ${chr.classes.grade} - ${chr.classes.name}`
          ),
          // Store the raw class data for reference
          classData: resource.class_has_resources
        }

        if (resource.type === 'notice') {
          return {
            ...base,
            type: 'notice' as const,
            resource_type: 'Image' as const
          } as Notice
        } else {
          return {
            ...base,
            type: 'resource' as const,
            resource_type: resource.resource_type
          } as Resource
        }
      })
    } catch (error) {
      console.error('Error fetching resources:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createResource = async (data: ResourceFormData): Promise<void> => {
    try {
      loading.value = true
      
      // Always enforce Image type for notices
      const resourceType = data.type === 'notice' ? 'Image' as const : data.resource_type

      const { data: insertedResource, error: insertError } = await supabase
        .from('learning_resources_and_notices')
        .insert({
          title: data.title,
          description: data.description || null,
          type: data.type,
          resource_type: resourceType,
          url: data.url,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      // Link classes to resource
      const classLinks = data.classes.map(classId => ({
        resource_id: insertedResource.id,
        class_id: parseInt(classId.toString())
      }))

      const { error: linkError } = await supabase
        .from('class_has_resources')
        .insert(classLinks)

      if (linkError) throw linkError
    } catch (error) {
      console.error('Error creating resource:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateResource = async (id: number, data: Partial<ResourceFormData>): Promise<void> => {
    try {
      loading.value = true

      // Always enforce Image type for notices
      const resourceType = data.type === 'notice' ? 'Image' as const : data.resource_type
      
      // Update resource
      const { error: updateError } = await supabase
        .from('learning_resources_and_notices')
        .update({
          title: data.title || undefined,
          description: data.description || null,
          type: data.type,
          resource_type: resourceType,
          url: data.url,
        })
        .eq('id', id)

      if (updateError) throw updateError

      if (data.classes) {
        // Delete existing class links
        const { error: deleteError } = await supabase
          .from('class_has_resources')
          .delete()
          .eq('resource_id', id)

        if (deleteError) throw deleteError

        // Create new class links
        const classLinks = data.classes.map(classId => ({
          resource_id: id,
          class_id: parseInt(classId.toString())
        }))

        const { error: linkError } = await supabase
          .from('class_has_resources')
          .insert(classLinks)

        if (linkError) throw linkError
      }
    } catch (error) {
      console.error('Error updating resource:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteResource = async (id: number): Promise<void> => {
    try {
      loading.value = true
      const { error } = await supabase
        .from('learning_resources_and_notices')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting resource:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getResources,
    createResource,
    updateResource,
    deleteResource
  }
}