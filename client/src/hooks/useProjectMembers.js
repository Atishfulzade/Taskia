import requestServer from "@/utils/requestServer";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export function useProjectMembers(projectId) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const memberIds = useSelector(
    (state) => state.project.currentProject?.member
  );

  useEffect(() => {
    async function fetchMembers() {
      try {
        // Fetch user details for each member ID
        const memberRequests = memberIds.map(
          (userId) => requestServer(`/user/u/${userId}`) // Assuming requestServer is a function that makes an API call
        );

        // Wait for all member requests to resolve
        const memberResponses = await Promise.all(memberRequests);

        // Extract JSON data from responses
        const memberData = await Promise.all(
          memberResponses.map((res) => res.data)
        );

        // Set the fetched member data
        setMembers(memberData);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Error fetching members:", err);
      }
    }

    if (projectId && memberIds.length > 0) {
      fetchMembers();
    } else {
      // Reset members if no projectId or no memberIds
      setMembers([]);
      setLoading(false);
    }
  }, [projectId, memberIds]); // Depend on projectId and memberIds

  return { members, loading };
}
