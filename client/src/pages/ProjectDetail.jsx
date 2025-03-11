import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTasks } from "../store/taskSlice";
import requestServer from "../utils/requestServer";

// Shadcn UI Components
import { CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

import { Search, Filter, ChevronsUpDown, Plus } from "lucide-react";
import BoardContainer from "../component/BoardContainer";
import AddStatusPopup from "../component/AddStatusPopup";
import { setStatuses } from "@/store/statusSlice";

const ProjectDetail = () => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusPopup, setShowStatusPopup] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user?._id);
  const projectId = useSelector((state) => state.project.currentProject?._id);
  const projectName = useSelector(
    (state) => state.project.currentProject?.name
  );
  const tasks = useSelector((state) => state.task.tasks);
  const statuses = useSelector((state) => state.status.statuses);

  // Fetch and Update Functions
  const fetchStatuses = async () => {
    try {
      if (!projectId) return;
      const res = await requestServer(`status/all/${projectId}`);
      dispatch(setStatuses(res.data));
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      if (!projectId) return;
      const res = await requestServer(`task/all/${projectId}`);
      dispatch(setTasks(res.data));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Load data on component mount and when projectId changes
  useEffect(() => {
    const loadData = async () => {
      if (projectId) {
        setLoading(true);
        await Promise.all([fetchStatuses(), fetchTasks()]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, dispatch]);

  // Refresh data when AddStatusPopup closes
  useEffect(() => {
    if (!showStatusPopup && projectId) {
      fetchStatuses();
    }
  }, [showStatusPopup, projectId]);

  return (
    <div className="h-full w-full z-10 dark:bg-slate-900">
      {/* Project Header */}
      <div className="flex justify-between items-center mb-2 p-2 border-b border-slate-300">
        <div>
          <CardTitle className="text-xl font-semibold flex gap-3.5 text-slate-800 dark:text-white">
            {projectName || "Project Dashboard"}{" "}
            <Badge>{tasks.length} Tasks</Badge>
          </CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          {/* Add Status Button */}
          {projectId && (
            <Button
              onClick={() => setShowStatusPopup(true)}
              size="sm"
              className="bg-violet-600 text-white dark:bg-violet-700"
            >
              <Plus className="h-4 w-4" /> Add status
            </Button>
          )}
          <AddStatusPopup
            open={showStatusPopup}
            setOpen={setShowStatusPopup}
            isEdit={false}
            onSuccess={fetchStatuses}
            projectId={projectId}
          />

          {/* Search */}
          <div className="relative z-[1]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 dark:bg-gray-800 z-[1] dark:text-white dark:border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-300"></div>
          <span className="ml-2 dark:text-white">Loading...</span>
        </div>
      )}

      {/* Board Container */}
      {!loading && (
        <BoardContainer
          projectId={projectId}
          statuses={statuses}
          tasks={tasks}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
