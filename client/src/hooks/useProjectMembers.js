import { useState, useEffect, useRef, useCallback } from "react";
import requestServer from "../utils/requestServer";

const useProjectMembers = (projectId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is required");
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("New request initiated");
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Fetch project data
      const projectResponse = await requestServer(
        `/project/get/${projectId}`,

        { signal: controller.signal, timeout: 10000 } // Added timeout
      );

      if (!projectResponse?.data?.member) {
        setMembers([]);
        return;
      }

      const memberIds = projectResponse.data.member;

      // Fetch user details in batches
      const batchSize = 5;
      const allMemberDetails = [];

      for (let i = 0; i < memberIds.length; i += batchSize) {
        if (controller.signal.aborted) break;

        const batch = memberIds.slice(i, i + batchSize);
        const memberRequests = batch.map((userId) =>
          requestServer(
            `/user/u/${userId}`,

            { signal: controller.signal }
          ).catch((err) => {
            console.error(`Failed to fetch user ${userId}:`, err);
            return null;
          })
        );

        const batchResults = await Promise.all(memberRequests);
        allMemberDetails.push(...batchResults.filter(Boolean));
      }

      if (!controller.signal.aborted) {
        setMembers(allMemberDetails);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch members");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort("Component unmounted");
      }
    };
  }, [fetchMembers]);

  return {
    members: members.map((m) => m?.data || m), // Normalize response format
    loading,
    error,
    refetch: fetchMembers,
  };
};

export default useProjectMembers;
