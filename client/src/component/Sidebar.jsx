import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Star,
  ChevronDown,
  ChevronRight,
  Settings,
  Users,
  Clock,
  MoreHorizontal,
  PanelLeft,
  Folder,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import AddProjectPopup from "./AddProjectPopup";
import { setCurrentProject } from "@/store/projectSlice"; // Import setCurrentProject

// Sample shared projects data
const sharedProjects = [
  {
    _id: "7",
    title: "Team Collaboration",
    isStarred: false,
    lastAccessed: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    _id: "8",
    title: "Client Presentation",
    isStarred: false,
    lastAccessed: null,
  },
];

const ProjectItem = ({ project, isActive, onClick, onContextMenu }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center z-0 justify-between py-2 px-3 rounded-md my-1 cursor-pointer",
        isActive
          ? "bg-slate-200 text-slate-900"
          : "text-slate-700 hover:bg-slate-100"
      )}
      onClick={onClick}
      onContextMenu={(e) => onContextMenu(e, project)}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Folder className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium truncate">{project.title}</span>
      </div>
      <div className="flex items-center">
        {project.isStarred && (
          <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="h-6 w-6 flex justify-center items-center opacity-0 group-hover:opacity-100 rounded hover:bg-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-slate-500" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, project, "rename");
              }}
            >
              Rename project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, project, "star");
              }}
            >
              {project.isStarred ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, project, "share");
              }}
            >
              Share project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, project, "delete");
              }}
            >
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

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
  const searchInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const projects = useSelector((state) => state.project.projects);
  const currentProject = useSelector((state) => state.project.currentProject);

  const [selectedProjectId, setSelectedProjectId] = useState(
    currentProject?._id || null
  );

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Handle project selection
  const handleSelectProject = (project) => {
    setSelectedProjectId(project._id); // Update local state
    dispatch(setCurrentProject(project)); // Update Redux state
  };

  // Handle context menu actions
  const handleContextAction = (project, action) => {
    switch (action) {
      case "star":
        dispatch(
          setCurrentProject((prevProjects) =>
            prevProjects.map((p) =>
              p._id === project._id ? { ...p, isStarred: !p.isStarred } : p
            )
          )
        );
        break;

      case "rename":
        console.log(`Renaming project: ${project._id}`);
        break;

      case "delete":
        console.log(`Deleting project: ${project._id}`);
        break;

      case "share":
        console.log(`Sharing project: ${project._id}`);
        break;

      default:
        console.warn(`Unknown action: ${action}`);
        break;
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  };

  // Filter projects based on search query
  const filteredProjects = searchQuery
    ? projects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  // Get recent projects
  const recentProjects = projects
    .filter((p) => p.lastAccessed)
    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    .slice(0, 5);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 60 : 280 }}
        className="h-screen border-r border-slate-300 bg-white flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-300 px-3">
          {!isCollapsed && (
            <h3 className="font-medium text-slate-800">Projects</h3>
          )}

          <div className="flex items-center justify-center gap-1 relative">
            {!isCollapsed && (
              <>
                {showSearch ? (
                  <div className="absolute w-[180px] z-20 right-10 top-1.5 bg-white">
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-sm bg-white border-slate-300"
                      onBlur={() => {
                        if (!searchQuery) setShowSearch(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setSearchQuery("");
                          setShowSearch(false);
                        }
                      }}
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                        onClick={() => {
                          setSearchQuery("");
                          setShowSearch(false);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                    onClick={() => setShowSearch(true)}
                  >
                    <Search size={18} />
                  </button>
                )}

                {showAddProject && (
                  <AddProjectPopup close={setShowAddProject} />
                )}
              </>
            )}

            <button
              className="h-8 w-8 flex justify-center items-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
              onClick={toggleCollapse}
            >
              <PanelLeft size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 gap-4">
            <button
              className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
              onClick={() => {
                setIsCollapsed(false);
                setShowAddProject(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </button>

            <button className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
              <Star className="h-4 w-4" />
            </button>

            <button className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
              <Clock className="h-4 w-4" />
            </button>

            <button className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
              <Users className="h-4 w-4" />
            </button>

            <button className="h-8 w-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-3 py-2">
              {/* Recent Projects Section */}
              {recentProjects.length > 0 && (
                <div className="mb-4">
                  <div
                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 rounded px-1"
                    onClick={() => toggleSection("recent")}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">
                        Recent
                      </span>
                    </div>
                    <button className="h-5 w-5 flex items-center justify-center text-slate-500">
                      {expandedSections.recent ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedSections.recent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {recentProjects.map((project) => (
                          <ProjectItem
                            key={`recent-${project._id}`}
                            project={project}
                            isActive={selectedProjectId === project._id}
                            onClick={() => handleSelectProject(project)}
                            onContextMenu={(e, project, action) => {
                              e.preventDefault();
                              handleContextAction(project, action);
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* My Projects Section */}
              <div className="mb-4">
                <div
                  className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 rounded px-1"
                  onClick={() => toggleSection("myProjects")}
                >
                  <div className="flex items-center gap-1">
                    <Folder className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">
                      My Projects
                    </span>
                    <Badge className="ml-1 h-5 px-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300">
                      {filteredProjects.length}
                    </Badge>
                  </div>
                  <button className="h-5 w-5 flex items-center justify-center text-slate-500">
                    {expandedSections.myProjects ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {expandedSections.myProjects && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                          <ProjectItem
                            key={project._id}
                            project={project}
                            isActive={selectedProjectId === project._id}
                            onClick={() => handleSelectProject(project)}
                            onContextMenu={(e, project, action) => {
                              e.preventDefault();
                              handleContextAction(project, action);
                            }}
                          />
                        ))
                      ) : searchQuery ? (
                        <div className="py-3 px-3 text-sm text-slate-500">
                          No projects match your search
                        </div>
                      ) : (
                        <div className="py-3 px-3 text-sm text-slate-500">
                          No projects yet. Create your first project!
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-500 hover:text-slate-700 hover:bg-slate-100 mt-1"
                        onClick={() => setShowAddProject(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="text-sm">New Project</span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shared Projects Section */}
              <div className="mb-4">
                <div
                  className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 rounded px-1"
                  onClick={() => toggleSection("shared")}
                >
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Shared with me
                    </span>
                    <Badge className="ml-1 h-5 px-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300">
                      {sharedProjects.length}
                    </Badge>
                  </div>
                  <button className="h-5 w-5 flex items-center justify-center text-slate-500">
                    {expandedSections.shared ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {expandedSections.shared && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {sharedProjects.map((project) => (
                        <ProjectItem
                          key={`shared-${project._id}`}
                          project={project}
                          isActive={selectedProjectId === project._id}
                          onClick={() => handleSelectProject(project)}
                          onContextMenu={(e, project, action) => {
                            e.preventDefault();
                            handleContextAction(project, action);
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Sidebar Footer */}
        <div className="border-t border-slate-300 p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            {!isCollapsed && <span className="text-sm">Settings</span>}
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
