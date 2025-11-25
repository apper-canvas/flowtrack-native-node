import { useState, useEffect, useRef, useMemo } from 'react';

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    if (!config.existingFiles || !Array.isArray(config.existingFiles)) {
      return [];
    }
    
    // Detect actual changes by comparing length and first file's ID
    const current = config.existingFiles;
    const previous = existingFilesRef.current;
    
    if (current.length !== previous.length) {
      return current;
    }
    
    if (current.length > 0 && previous.length > 0) {
      const currentFirstId = current[0].Id || current[0].id;
      const previousFirstId = previous[0].Id || previous[0].id;
      if (currentFirstId !== previousFirstId) {
        return current;
      }
    }
    
    return previous.length > 0 ? previous : current;
  }, [config.existingFiles]);

  // Initial mount effect
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;
    const checkInterval = 100;

    const initializeSDK = async () => {
      while (attempts < maxAttempts) {
        if (window.ApperSDK && window.ApperSDK.ApperFileUploader) {
          try {
            const { ApperFileUploader } = window.ApperSDK;
            
            elementIdRef.current = `file-uploader-${elementId}`;
            
            await ApperFileUploader.FileField.mount(elementIdRef.current, {
              ...config,
              existingFiles: memoizedExistingFiles
            });
            
            mountedRef.current = true;
            setIsReady(true);
            setError(null);
            return;
          } catch (err) {
            setError(`Failed to mount file field: ${err.message}`);
            return;
          }
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
      
      setError('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
    };

    initializeSDK();

    // Cleanup on component destruction
    return () => {
      try {
        if (window.ApperSDK && mountedRef.current && elementIdRef.current) {
          const { ApperFileUploader } = window.ApperSDK;
          ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
      
      mountedRef.current = false;
      existingFilesRef.current = [];
      setIsReady(false);
    };
  }, [elementId, config.fieldKey]);

  // File update effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK || !config.fieldKey) {
      return;
    }

    // Deep equality check with JSON.stringify
    const currentFilesString = JSON.stringify(memoizedExistingFiles);
    const previousFilesString = JSON.stringify(existingFilesRef.current);
    
    if (currentFilesString === previousFilesString) {
      return;
    }

    const updateFiles = async () => {
      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        // Format detection - check for .Id vs .id property
        let formattedFiles = memoizedExistingFiles;
        if (memoizedExistingFiles.length > 0) {
          const hasIdProperty = memoizedExistingFiles[0].hasOwnProperty('Id');
          if (hasIdProperty) {
            // Convert from API format to UI format
            formattedFiles = ApperFileUploader.toUIFormat(memoizedExistingFiles);
          }
        }

        // Update files or clear field based on length
        if (formattedFiles.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, formattedFiles);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = memoizedExistingFiles;
        setError(null);
      } catch (err) {
        setError(`Failed to update files: ${err.message}`);
      }
    };

    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main container - always render with unique ID */}
      <div id={`file-uploader-${elementId}`} className="min-h-[100px]">
        {/* Loading UI - show when not ready */}
        {!isReady && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-500 text-sm">Loading file uploader...</div>
          </div>
        )}
        {/* When mounted, SDK takes over the container */}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;