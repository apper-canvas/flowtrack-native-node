import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

const TABLE_NAME = "task_c"

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "files_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      }

      const response = await apperClient.fetchRecords(TABLE_NAME, params)
      
      if (!response.success) {
        console.error("Error fetching tasks:", response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error)
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
{"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "files_c"}}
        ]
      }

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params)
      
      if (!response?.data) {
        throw new Error(`Task with Id ${id} not found`)
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error)
      throw error
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

const params = {
        records: [{
          Name: taskData.title_c || taskData.title || "Untitled Task",
          Tags: taskData.Tags || "",
          title_c: taskData.title_c || taskData.title,
          description_c: taskData.description_c || taskData.description || "",
          priority_c: taskData.priority_c || taskData.priority || "medium",
          status_c: taskData.status_c || taskData.status || "active",
          completed_at_c: taskData.completed_at_c || taskData.completedAt || null,
          files_c: taskData.files_c || null
        }]
      }

      const response = await apperClient.createRecord(TABLE_NAME, params)

      if (!response.success) {
        console.error("Error creating task:", response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          return successful[0].data
        }
      }

      throw new Error("No data returned from create operation")
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

const updateData = {
        Id: parseInt(id)
      }

      // Map field names and only include updateable fields
      if (updates.title_c !== undefined || updates.title !== undefined) {
        updateData.title_c = updates.title_c || updates.title
        updateData.Name = updates.title_c || updates.title
      }
      if (updates.description_c !== undefined || updates.description !== undefined) {
        updateData.description_c = updates.description_c || updates.description
      }
      if (updates.priority_c !== undefined || updates.priority !== undefined) {
        updateData.priority_c = updates.priority_c || updates.priority
      }
      if (updates.status_c !== undefined || updates.status !== undefined) {
        updateData.status_c = updates.status_c || updates.status
      }
      if (updates.completed_at_c !== undefined || updates.completedAt !== undefined) {
        updateData.completed_at_c = updates.completed_at_c || updates.completedAt
      }
      if (updates.Tags !== undefined) {
        updateData.Tags = updates.Tags
      }
      if (updates.files_c !== undefined) {
        updateData.files_c = updates.files_c
      }
      const params = {
        records: [updateData]
      }

      const response = await apperClient.updateRecord(TABLE_NAME, params)

      if (!response.success) {
        console.error("Error updating task:", response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          return successful[0].data
        }
      }

      throw new Error("No data returned from update operation")
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord(TABLE_NAME, params)

      if (!response.success) {
        console.error("Error deleting task:", response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0
      }

      return true
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error)
      throw error
    }
  }
}