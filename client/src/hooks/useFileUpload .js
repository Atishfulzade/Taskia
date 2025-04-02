import { useState } from "react";
import { toast } from "sonner";

export const useFileUpload = () => {
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Upload a single file to Cloudinary
  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "Taskia"
    );

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error("Cloudinary cloud name is not defined");
      }

      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: percentComplete,
            }));
          }
        };

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/upload`);

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                fileName: file.name,
                link: response.secure_url,
                publicId: response.public_id,
                format: response.format,
                size: response.bytes,
                createdAt: response.created_at,
              });
            } catch (error) {
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload"));
        };

        xhr.send(formData);
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
      return null;
    }
  };

  // Process multiple files
  const uploadFiles = async (files) => {
    if (!files || files.length === 0) {
      return [];
    }

    setFileLoading(true);
    setUploadProgress({});

    try {
      // Validate file types and sizes first
      const validFiles = Array.from(files).filter((file) => {
        // Check file size (10MB limit as an example)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (file.size > MAX_SIZE) {
          toast.error(`${file.name} is too large (max 10MB)`);
          return false;
        }

        // Check allowed file types if needed
        // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', ...];
        // if (!allowedTypes.includes(file.type)) {
        //   toast.error(`${file.name} has an unsupported file type`);
        //   return false;
        // }

        return true;
      });

      if (validFiles.length === 0) {
        return [];
      }

      // Process files in chunks to avoid overwhelming the server
      const CHUNK_SIZE = 3; // Process 3 files at a time
      const results = [];

      for (let i = 0; i < validFiles.length; i += CHUNK_SIZE) {
        const chunk = validFiles.slice(i, i + CHUNK_SIZE);
        const chunkResults = await Promise.all(
          chunk.map(uploadFileToCloudinary)
        );
        results.push(...chunkResults.filter(Boolean));
      }

      return results;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    } finally {
      setFileLoading(false);
      setUploadProgress({});
    }
  };

  return {
    uploadFiles,
    fileLoading,
    uploadProgress,
  };
};

export default useFileUpload;
