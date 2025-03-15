import { useState } from "react";

export const useFileUpload = () => {
  const [fileLoading, setFileLoading] = useState(false);

  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      return { fileName: file.name, link: data.secure_url };
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const uploadFiles = async (files) => {
    setFileLoading(true);
    try {
      // Process files in parallel
      const uploadPromises = Array.from(files).map(uploadFileToCloudinary);
      const results = await Promise.all(uploadPromises);

      // Filter out failed uploads
      return results.filter(Boolean);
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    } finally {
      setFileLoading(false);
    }
  };

  return { uploadFiles, fileLoading };
};
