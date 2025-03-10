export const useFileUpload = () => {
  const [fileLoading, setFileLoading] = useState(false);

  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_PRESET || "Taskia"
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dqizv2ags"
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

// hooks/useProjectMembers.js
import { useState, useEffect, useCallback } from "react";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";

export const useProjectMembers = (projectMembers, isDialogOpen) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!projectMembers || projectMembers.length === 0) return;

    setLoading(true);
    try {
      const responses = await Promise.all(
        projectMembers.map((member) => requestServer(`user/u/${member}`))
      );

      const membersData = responses.map((res) => res.data);

      if (Array.isArray(membersData)) {
        setMembers(membersData);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      showToast("Failed to fetch project members", "error");
    } finally {
      setLoading(false);
    }
  }, [projectMembers]);

  useEffect(() => {
    if (isDialogOpen && projectMembers && projectMembers.length > 0) {
      fetchMembers();
    }
  }, [isDialogOpen, projectMembers, fetchMembers]);

  return { members, loading };
};
