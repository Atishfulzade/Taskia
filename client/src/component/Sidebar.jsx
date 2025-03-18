import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  PanelLeft,
  Plus,
  Search,
  Settings,
  Star,
  Clock,
  Users,
  X,
} from "lucide-react";
import {
  setCurrentProject,
  setDeleteProject,
  updateProject,
} from "../store/projectSlice";
import {
  addSharedProject,
  setSharedProjects,
  removeSharedProject,
} from "../store/sharedProjectSlice";
import requestServer from "../utils/requestServer";
import AddProjectPopup from "./AddProjectPopup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogHeader,
} from "../components/ui/alert-dialog";
import socket from "@/utils/socket";
import SidebarHeader from "./SidebarHeader";
import SidebarContent from "./SIdebarContent";
import SidebarFooter from "./SidebarFooter";
import ContextMenu from "./ContextMenu";

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    myProjects: true,
    shared: true,
    recent: true,
  });
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    project: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    project: null,
  });
  const [renameModal, setRenameModal] = useState({
    open: false,
    project: null,
    title: "",
  });
  const [shareModal, setShareModal] = useState({
    open: false,
    project: null,
    email: "",
  });

  const dispatch = useDispatch();
  const projects = useSelector((state) => state.project.projects || []);
  const currentProject = useSelector((state) => state.project.currentProject);
  const sharedProjects = useSelector(
    (state) => state.sharedproject.sharedProject || []
  );
  const [selectedProjectId, setSelectedProjectId] = useState(
    currentProject?._id || null
  );

  const searchInputRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenu.visible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setContextMenu({
          visible: false,
          position: { x: 0, y: 0 },
          project: null,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu.visible]);

  const fetchSharedProjects = useCallback(async () => {
    try {
      const res = await requestServer("project/member");
      if (res?.data) {
        dispatch(setSharedProjects(res.data));
      }
    } catch (error) {
      console.error("Failed to fetch shared projects:", error);
      toast.error("Failed to fetch shared projects");
    }
  }, [dispatch]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleProjectInvitation = async (data) => {
      if (data.newProject) {
        dispatch(addSharedProject(data.newProject));
        toast.success(data.message || "You've been invited to a project");
      }
      await requestServer("user/notification/add", {
        title: data.message,
        type: "info",
      });
    };

    socket.on("projectInvitation", handleProjectInvitation);

    return () => {
      socket.off("projectInvitation", handleProjectInvitation);
    };
  }, [dispatch]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    fetchSharedProjects();
  }, [showSearch, fetchSharedProjects]);

  useEffect(() => {
    if (currentProject?._id) {
      setSelectedProjectId(currentProject._id);
    }
  }, [currentProject]);

  const handleSelectProject = useCallback(
    (project) => {
      dispatch(setCurrentProject(project));
      setSelectedProjectId(project._id);
    },
    [dispatch]
  );

  const handleContextMenu = useCallback((e, project, action) => {
    console.log("Context menu triggered");
    e.preventDefault();
    e.stopPropagation(); // Ensure event propagation is stopped

    if (action === "menu") {
      const rect = e.currentTarget.getBoundingClientRect();
      console.log("Menu action triggered at position:", rect);
      setContextMenu({
        visible: true,
        position: { x: rect.left, y: rect.bottom },
        project,
      });
    } else if (action) {
      console.log("Direct action triggered:", action);
      handleContextAction(project, action);
    } else {
      console.log("Right-click triggered at position:", e.clientX, e.clientY);
      setContextMenu({
        visible: true,
        position: { x: e.clientX, y: e.clientY },
        project,
      });
    }
  }, []);

  const handleContextAction = useCallback(
    async (project, action) => {
      console.log("Context menu action:", action);
      setContextMenu({
        visible: false,
        position: { x: 0, y: 0 },
        project: null,
      });

      switch (action) {
        case "star":
          console.log("Star action triggered");
          try {
            const updatedProject = {
              ...project,
              isStarred: !project.isStarred,
            };
            await requestServer(
              `project/update/${project._id}`,
              updatedProject
            );
            dispatch(updateProject(updatedProject));
            toast.success(
              `Project ${
                updatedProject.isStarred ? "added to" : "removed from"
              } favorites`
            );
          } catch (error) {
            console.error("Failed to update project:", error);
            toast.error("Failed to update project");
          }
          break;

        case "rename":
          console.log("Rename action triggered");
          setRenameModal({ open: true, project, title: project.title });
          break;

        case "delete":
          console.log("Delete action triggered");
          setDeleteModal({ open: true, project });
          break;

        case "share":
          console.log("Share action triggered");
          setShareModal({ open: true, project, email: "" });
          break;

        default:
          console.warn(`Unknown action: ${action}`);
          break;
      }
    },
    [dispatch]
  );

  const handleRenameProject = async () => {
    if (!renameModal.title.trim()) {
      toast.error("Project title cannot be empty");
      return;
    }

    if (renameModal.title && renameModal.title !== renameModal.project.title) {
      try {
        const renamedProject = {
          ...renameModal.project,
          title: renameModal.title,
        };
        await requestServer(
          `project/update/${renameModal.project._id}`,
          renamedProject
        );
        dispatch(updateProject(renamedProject));
        toast.success("Project renamed successfully");
      } catch (error) {
        console.error("Failed to rename project:", error);
        toast.error("Failed to rename project");
      }
    }
    setRenameModal({ open: false, project: null, title: "" });
  };

  const handleDeleteProject = async () => {
    try {
      if (deleteModal.project.isShared) {
        await requestServer(`project/leave/${deleteModal.project._id}`);
        dispatch(removeSharedProject(deleteModal.project._id));
        toast.success("You have left the project");
      } else {
        await requestServer(`project/delete/${deleteModal.project._id}`);
        dispatch(setDeleteProject(deleteModal.project._id));
        toast.success("Project deleted successfully");
      }

      if (selectedProjectId === deleteModal.project._id) {
        const remainingProjects = projects.filter(
          (p) => p._id !== deleteModal.project._id
        );
        if (remainingProjects.length > 0) {
          dispatch(setCurrentProject(remainingProjects[0]));
        } else {
          dispatch(setCurrentProject(null));
          setSelectedProjectId(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    }
    setDeleteModal({ open: false, project: null });
  };

  const handleShareProject = async () => {
    if (!shareModal.email.trim()) {
      toast.error("Email address cannot be empty");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareModal.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await requestServer(`project/share/${shareModal.project._id}`, {
        email: shareModal.email,
      });
      toast.success(`Project shared with ${shareModal.email}`);
    } catch (error) {
      console.error("Failed to share project:", error);
      toast.error("Failed to share project");
    }
    setShareModal({ open: false, project: null, email: "" });
  };

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  }, [isCollapsed, onCollapse]);

  const filteredProjects = searchQuery
    ? projects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const recentProjects = projects
    ?.filter((p) => p.lastAccessed)
    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    .slice(0, 5);

  return (
    <>
      <div
        ref={sidebarRef}
        className={`h-[calc(100vh-50px)] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-72"
        }`}
      >
        <SidebarHeader
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          setShowAddProject={setShowAddProject}
          setShowSearch={setShowSearch}
          showSearch={showSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 gap-4">
            <button
              className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => {
                setIsCollapsed(false);
                setShowAddProject(true);
              }}
              aria-label="Add new project"
            >
              <Plus className="h-4 w-4" />
            </button>

            <button
              className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              aria-label="Favorites"
            >
              <Star className="h-4 w-4" />
            </button>

            <button
              className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              aria-label="Recent projects"
            >
              <Clock className="h-4 w-4" />
            </button>

            <button
              className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              aria-label="Shared projects"
            >
              <Users className="h-4 w-4" />
            </button>

            <button
              className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <SidebarContent
            isCollapsed={isCollapsed}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            recentProjects={recentProjects}
            selectedProjectId={selectedProjectId}
            handleSelectProject={handleSelectProject}
            handleContextMenu={handleContextMenu}
            filteredProjects={filteredProjects}
            searchQuery={searchQuery}
            setShowAddProject={setShowAddProject}
            sharedProjects={sharedProjects}
          />
        )}

        <SidebarFooter isCollapsed={isCollapsed} />
      </div>

      {contextMenu.visible && (
        <ContextMenu
          project={contextMenu.project}
          position={contextMenu.position}
          onAction={handleContextAction}
          onClose={() =>
            setContextMenu({
              visible: false,
              position: { x: 0, y: 0 },
              project: null,
            })
          }
        />
      )}

      {showAddProject && (
        <AddProjectPopup
          isOpen={showAddProject}
          close={() => setShowAddProject(false)}
          onAdd={(project) => {
            setShowAddProject(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open) =>
          setDeleteModal({ open, project: open ? deleteModal.project : null })
        }
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete "{deleteModal.project?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel
              onClick={() => setDeleteModal({ open: false, project: null })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Project Modal */}
      <AlertDialog
        open={renameModal.open}
        onOpenChange={(open) =>
          setRenameModal({
            open,
            project: open ? renameModal.project : null,
            title: open ? renameModal.title : "",
          })
        }
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Rename Project
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Enter a new name for the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <label
              htmlFor="projectTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Project Title
            </label>
            <input
              type="text"
              id="projectTitle"
              value={renameModal.title}
              onChange={(e) =>
                setRenameModal({ ...renameModal, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter project title"
              autoFocus
            />
          </div>
          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel
              onClick={() =>
                setRenameModal({ open: false, project: null, title: "" })
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRenameProject}
              disabled={!renameModal.title.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                !renameModal.title.trim()
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Project Modal */}
      <AlertDialog
        open={shareModal.open}
        onOpenChange={(open) =>
          setShareModal({
            open,
            project: open ? shareModal.project : null,
            email: open ? shareModal.email : "",
          })
        }
      >
        <AlertDialogContent className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Share Project
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Enter the email address of the user you want to share this project
              with.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <label
              htmlFor="shareEmail"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="shareEmail"
              value={shareModal.email}
              onChange={(e) =>
                setShareModal({ ...shareModal, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter email address"
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The user will receive an invitation to collaborate on this
              project.
            </p>
          </div>
          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel
              onClick={() =>
                setShareModal({ open: false, project: null, email: "" })
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleShareProject}
              disabled={!shareModal.email.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                !shareModal.email.trim()
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Share
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;
