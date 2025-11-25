import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

const TABLE_NAME = 'files_c';

// Get all files with error handling
export const getAll = async () => {
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "file_name_c"}},
        {"field": {"Name": "file_size_c"}},
        {"field": {"Name": "file_type_c"}},
        {"field": {"Name": "upload_date_c"}},
        {"field": {"Name": "files_c"}}
      ],
      orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
      pagingInfo: {"limit": 100, "offset": 0}
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response?.data?.length) {
      return [];
    } else {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching files:", error?.response?.data?.message || error);
    return [];
  }
};

// Get file by ID
export const getById = async (id) => {
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "Tags"}},
        {"field": {"Name": "CreatedOn"}},
        {"field": {"Name": "title_c"}},
        {"field": {"Name": "file_name_c"}},
        {"field": {"Name": "file_size_c"}},
        {"field": {"Name": "file_type_c"}},
        {"field": {"Name": "upload_date_c"}},
        {"field": {"Name": "files_c"}}
      ]
    };
    
    const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
    
    if (!response?.data) {
      return null;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error(`Error fetching file ${id}:`, error?.response?.data?.message || error);
    return null;
  }
};

// Create new files
export const create = async (filesData) => {
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }
    
    // Handle both single file and array of files
    const filesArray = Array.isArray(filesData) ? filesData : [filesData];
    
    const records = filesArray.map(fileData => {
      // Convert file to API format if needed
      const { ApperFileUploader } = window.ApperSDK;
      const convertedFile = ApperFileUploader ? ApperFileUploader.toCreateFormat(fileData) : fileData;
      
      return {
        Name: fileData.name || fileData.file_name_c || "Untitled File",
        Tags: fileData.Tags || "",
        title_c: fileData.title_c || fileData.name || fileData.file_name_c,
        file_name_c: fileData.name || fileData.file_name_c,
        file_size_c: fileData.size || fileData.file_size_c || 0,
        file_type_c: fileData.type || fileData.file_type_c || "",
        upload_date_c: new Date().toISOString(),
        files_c: convertedFile
      };
    });
    
    const params = { records };
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to create ${failed.length} files: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      return successful.map(r => r.data);
    }
    return [];
  } catch (error) {
    console.error("Error creating files:", error?.response?.data?.message || error);
    return [];
  }
};

// Update files
export const update = async (id, updates) => {
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }
    
    const updateData = {
      Id: parseInt(id)
    };
    
    // Map field names and only include updateable fields
    if (updates.title_c !== undefined || updates.name !== undefined) {
      updateData.title_c = updates.title_c || updates.name;
      updateData.Name = updates.title_c || updates.name;
    }
    if (updates.file_name_c !== undefined) {
      updateData.file_name_c = updates.file_name_c;
    }
    if (updates.file_size_c !== undefined) {
      updateData.file_size_c = updates.file_size_c;
    }
    if (updates.file_type_c !== undefined) {
      updateData.file_type_c = updates.file_type_c;
    }
    if (updates.Tags !== undefined) {
      updateData.Tags = updates.Tags;
    }
    if (updates.files_c !== undefined) {
      updateData.files_c = updates.files_c;
    }
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to update ${failed.length} files: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
          if (record.message) toast.error(record.message);
        });
      }
      return successful.length > 0 ? successful[0].data : null;
    }
    return null;
  } catch (error) {
    console.error("Error updating file:", error?.response?.data?.message || error);
    return null;
  }
};

// Delete files
export const remove = async (ids) => {
  try {
    const apperClient = await getApperClient();
    if (!apperClient) {
      throw new Error("ApperClient not initialized");
    }
    
    const recordIds = Array.isArray(ids) ? ids.map(id => parseInt(id)) : [parseInt(ids)];
    const params = { RecordIds: recordIds };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }
    
    if (response.results) {
      const successful = response.results.filter(r => r.success);
      const failed = response.results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error(`Failed to delete ${failed.length} files: ${JSON.stringify(failed)}`);
        failed.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      return successful.length === recordIds.length;
    }
    return false;
  } catch (error) {
    console.error("Error deleting files:", error?.response?.data?.message || error);
    return false;
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  remove
};