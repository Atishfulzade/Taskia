import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTask, setTasks, updateTask, deleteTask } from "../store/taskSlice";
import { setStatuses } from "../store/statusSlice";
import requestServer from "../utils/requestServer";
import socket from "../utils/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { joinProjectRoom, leaveProjectRoom } from "../utils/socketHandlers";
import { Search, Plus, Loader2 } from "lucide-react";
import BoardContainer from "../component/BoardContainer";
import AddStatusPopup from "../component/AddStatusPopup";

const ProjectDetail = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserTaskIds, setCurrentUserTaskIds] = useState(new Set());

  // Track if we've already joined the project room
  const joinedRoom = useRef(false);

  // Redux
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const projectName = useSelector(
    (state) =>
      state.project.currentProject?.name || state.project.currentProject?.title
  );
  const tasks = useSelector((state) => state.task.tasks);
  const statuses = useSelector((state) => state.status.statuses);

  // Fetch and Update Functions
  const fetchStatuses = useCallback(async () => {
    try {
      if (!projectId) return;
      setIsLoading(true);
      const res = await requestServer(`status/all/${projectId}`);
      if (res?.data) {
        dispatch(setStatuses(res.data));
      } else {
        dispatch(setStatuses([]));
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
      dispatch(setStatuses([]));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, dispatch]);

  const fetchTasks = useCallback(async () => {
    try {
      if (!projectId) return;
      setIsLoading(true);
      const res = await requestServer(`task/all/${projectId}`);
      if (res?.data) {
        dispatch(setTasks(res.data));
      } else {
        dispatch(setTasks([]));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      dispatch(setTasks([]));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, dispatch]);

  // Load data on component mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      console.log("Fetching data for project:", projectId);
      fetchStatuses();
      fetchTasks();
    } else {
      dispatch(setTasks([]));
      dispatch(setStatuses([]));
    }
  }, [projectId, dispatch, fetchStatuses, fetchTasks]);

  // Refresh data when AddStatusPopup closes
  useEffect(() => {
    if (!showStatusPopup && projectId) {
      fetchStatuses();
    }
  }, [showStatusPopup, projectId, fetchStatuses]);

  // Join project room for real-time updates when project changes
  useEffect(() => {
    if (!projectId || !socket.connected) return;

    // Only join if we haven't already joined this room
    if (!joinedRoom.current) {
      console.log(`Joining project room for project: ${projectId}`);
      joinProjectRoom(socket, projectId);
      joinedRoom.current = true;
    }

    return () => {
      if (joinedRoom.current) {
        console.log(`Leaving project room for project: ${projectId}`);
        leaveProjectRoom(socket, projectId);
        joinedRoom.current = false;
      }
    };
  }, [projectId]);

  // In ProjectDetail.jsx

  // Improve the room joining logic
  useEffect(() => {
    if (!projectId || !socket.connected) return;

    // Only join if we haven't already joined this room
    if (!joinedRoom.current) {
      console.log(`Joining project room for project: ${projectId}`);
      joinProjectRoom(socket, projectId);
      joinedRoom.current = true;
    }

    return () => {
      if (joinedRoom.current && projectId) {
        console.log(`Leaving project room for project: ${projectId}`);
        leaveProjectRoom(socket, projectId);
        joinedRoom.current = false;
      }
    };
  }, [projectId]);

  // Reset joined room ref when project changes
  useEffect(() => {
    // When projectId changes, reset the joinedRoom ref
    return () => {
      joinedRoom.current = false;
    };
  }, [projectId]);

  // Modify the handleTaskCreate function to use a more reliable approach
  const handleTaskCreate = useCallback(
    async (taskData) => {
      try {
        const response = await requestServer("task/create", {
          ...taskData,
          projectId,
        });

        if (response.data) {
          // We'll let the socket event handle adding to Redux store
          // to avoid duplicate tasks
          console.log("Task created via API:", response.data._id);
          toast.success("Task created successfully");

          // Instead of tracking in a Set, we could check directly in Redux
          // before adding to the store in the socket handler
        }
      } catch (error) {
        console.error("Error creating task:", error);
        toast.error("Failed to create task");
      }
    },
    [projectId]
  );

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Project Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {projectName || "Project Dashboard"}{" "}
          <Badge variant="secondary" className="ml-2 text-xs">
            {tasks.length} Tasks
          </Badge>
        </h1>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search tasks..."
                className="pl-8 h-9 w-[200px] sm:w-[240px] text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Add Status Button */}
          {projectId && (
            <Button
              onClick={() => setShowStatusPopup(true)}
              size="sm"
              className="h-9 bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-800"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Status
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <BoardContainer
            projectId={projectId}
            statuses={statuses}
            tasks={filteredTasks}
            onTaskCreate={handleTaskCreate}
          />
        )}
      </div>

      {/* Add Status Popup */}
      <AddStatusPopup
        open={showStatusPopup}
        setOpen={setShowStatusPopup}
        isEdit={false}
        onSuccess={fetchStatuses}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectDetail;
