import requestServer from "@/utils/requestServer";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export function useProjectMembers(projectId) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const memberCache = useRef(new Map()); // Store already fetched members
  const memberIds = useSelector(
    (state) => state.project.currentProject?.member || []
  );

  // Memoize memberIds to prevent unnecessary re-renders
  const stableMemberIds = useMemo(() => memberIds, [JSON.stringify(memberIds)]);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);

      // Filter out members already in cache
      const newMemberIds = stableMemberIds.filter(
        (id) => !memberCache.current.has(id)
      );

      if (newMemberIds.length === 0) {
        setMembers(stableMemberIds.map((id) => memberCache.current.get(id)));
        setLoading(false);
        return;
      }

      try {
        const memberRequests = newMemberIds.map((userId) =>
          requestServer(`/user/u/${userId}`)
        );
        const memberResponses = await Promise.all(memberRequests);
        const memberData = await Promise.all(
          memberResponses.map((res) => res.data)
        );

        // Store fetched members in cache
        newMemberIds.forEach((id, index) => {
          memberCache.current.set(id, memberData[index]);
        });

        // Update state with cached + new members
        setMembers(stableMemberIds.map((id) => memberCache.current.get(id)));
      } catch (err) {
        toast.error("Error fetching members");
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    }

    if (projectId && stableMemberIds.length > 0) {
      fetchMembers();
    } else {
      setMembers([]);
      setLoading(false);
    }
  }, [projectId, stableMemberIds]);

  return { members, loading };
}
