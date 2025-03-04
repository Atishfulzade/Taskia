"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { setCurrentProject } from "../store/projectSlice";
import requestServer from "../utils/requestServer";
import AddProjectPopup from "./AddProjectPopup";
import ProjectContextMenu from "./ProjectContext-Menu";
import { AiOutlineProject } from "react-icons/ai";

import {
  Search,
  Plus,
  List,
  Star,
  ChevronDown,
  ChevronRight,
  Settings,
  Users,
  Clock,
  MoreHorizontal,
  PanelLeft,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { ScrollArea } from "../components/ui/ScrollArea";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/Tooltip";
import { GoProjectRoadmap } from "react-icons/go";

const ProjectItem = ({ project, isActive, onClick, onContextMenu }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center justify-between py-2 px-3 rounded-md my-1 cursor-pointer",
        isActive ? "bg-violet-500 text-white" : "text-foreground hover:bg-muted"
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <List
          className={cn(
            "h-4 w-4",
            isActive ? "text-primary-foreground" : "text-muted-foreground"
          )}
        />
        <span className="text-sm text-slate-800 font-medium truncate">
          {project.title}
        </span>
      </div>
      <div className="flex items-center">
        {project.isStarred && (
          <Star className="h-3.5 w-3.5 text-yellow-400 mr-1" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "h-6 w-6 flex justify-center items-center opacity-0 group-hover:opacity-100",
                isActive
                  ? "hover:bg-primary-foreground/20"
                  : "hover:bg-muted-foreground/20"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-white text-slate-800"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, "rename");
              }}
            >
              Rename project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, "star");
              }}
            >
              {project.isStarred ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, "share");
              }}
            >
              Share project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onContextMenu(e, "delete");
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    projectId: null,
    action: null,
  });
  const [expandedSections, setExpandedSections] = useState({
    myProjects: true,
    invites: true,
    recent: true,
  });
  const searchInputRef = useRef(null);

  // Redux states
  const projects = useSelector((state) => state.project.projects || []);
  const selectedProject = useSelector((state) => state.project.currentProject);
  const assignTask = useSelector((state) => state.assignTask?.tasks || []);

  // Enhanced projects with additional metadata
  const [enhancedProjects, setEnhancedProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);

  // Process projects with additional metadata
  useEffect(() => {
    if (projects.length) {
      const enhanced = projects.map((project) => ({
        ...project,
        isStarred: localStorage.getItem(`starred_${project._id}`) === "true",
        lastAccessed:
          localStorage.getItem(`lastAccessed_${project._id}`) || null,
      }));

      enhanced.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return a.title.localeCompare(b.title);
      });

      setEnhancedProjects(enhanced);

      const recent = enhanced
        .filter((p) => p.lastAccessed)
        .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
        .slice(0, 5);

      setRecentProjects(recent);
    }
  }, [projects]);

  // Set the first project as the current project on mount
  useEffect(() => {
    if (enhancedProjects.length > 0 && !selectedProject) {
      dispatch(setCurrentProject(enhancedProjects[0]));
    }
  }, [enhancedProjects, selectedProject, dispatch]);

  // Fetch assigned projects
  const fetchAssignedProjects = async () => {
    try {
      setIsLoading(true);
      if (!assignTask.length) {
        setAssignedProjects([]);
        return;
      }

      const projectIds = [
        ...new Set(assignTask.flatMap((task) => task.projectId)),
      ];

      if (!projectIds.length) {
        setAssignedProjects([]);
        return;
      }

      const responses = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const response = await requestServer(`project/get/${projectId}`);
            return response;
          } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            return null;
          }
        })
      );

      const validProjects = responses.filter(Boolean).map((project) => ({
        ...project,
        data: {
          ...project.data,
          isStarred:
            localStorage.getItem(`starred_${project.data._id}`) === "true",
        },
      }));

      setAssignedProjects(validProjects);
    } catch (error) {
      console.error("Error fetching assigned projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, [assignTask]);

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Handle project selection
  const handleSelectProject = (project) => {
    dispatch(setCurrentProject(project));
    navigate(`/dashboard/${project._id}`);
    localStorage.setItem(
      `lastAccessed_${project._id}`,
      new Date().toISOString()
    );
  };

  // Handle context menu
  const handleContextMenu = (e, project, action) => {
    e.preventDefault();
    e.stopPropagation();

    if (action) {
      handleContextAction(project._id, action);
    } else {
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        projectId: project._id,
      });
    }
  };

  // Handle context menu actions
  const handleContextAction = (projectId, action) => {
    const project =
      enhancedProjects.find((p) => p._id === projectId) ||
      assignedProjects.find((p) => p.data._id === projectId)?.data;

    if (!project) return;

    switch (action) {
      case "star":
        const isCurrentlyStarred =
          localStorage.getItem(`starred_${projectId}`) === "true";
        localStorage.setItem(
          `starred_${projectId}`,
          (!isCurrentlyStarred).toString()
        );
        setEnhancedProjects((prev) =>
          prev.map((p) =>
            p._id === projectId ? { ...p, isStarred: !isCurrentlyStarred } : p
          )
        );
        break;
      case "rename":
        console.log("Rename project:", projectId);
        break;
      case "delete":
        console.log("Delete project:", projectId);
        break;
      case "share":
        console.log("Share project:", projectId);
        break;
      default:
        break;
    }

    setContextMenu({ show: false, x: 0, y: 0, projectId: null });
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
    ? enhancedProjects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : enhancedProjects;

  return (
    <>
      {/* Add Project Popup */}
      <AnimatePresence>
        {showAddProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AddProjectPopup close={() => setShowAddProject(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      {contextMenu.show && (
        <ProjectContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          projectId={contextMenu.projectId}
          onAction={handleContextAction}
          onClose={() =>
            setContextMenu({ show: false, x: 0, y: 0, projectId: null })
          }
        />
      )}

      {/* Sidebar Container */}
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 60 : 280 }}
        className="h-screen border-r border-slate-300 bg-background flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center  justify-between border-b border-slate-300 px-3">
          {!isCollapsed && <h3 className="font-medium text-md">Projects</h3>}

          <div className="flex items-center justify-center gap-1 relative">
            {!isCollapsed && (
              <>
                {showSearch ? (
                  <div className="absolute w-[180px] z-20 right-10 bg-white">
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-sm bg-white"
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
                    <div
                      className="absolute right-0 top-0 h-8 w-8"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearch(false);
                      }}
                    >
                      {searchQuery ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="h-8 w-8 flex items-center justify-center"
                          onClick={() => setShowSearch(true)}
                        >
                          <Search size={18} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white rounded-md px-3 py-2 shadow-md border-none">
                        <p>Search projects</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="h-8 w-8 flex items-center justify-center"
                        onClick={() => setShowAddProject(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Add new project</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="h-10 w-10 flex justify-center items-center"
                    onClick={toggleCollapse}
                  >
                    <PanelLeft size={18} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{isCollapsed ? "Expand" : "Collapse"} sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Sidebar Content */}
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setIsCollapsed(false);
                      setShowAddProject(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Add new project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Favorites</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Recent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Shared with me</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-3 py-2">
              {/* Recent Projects Section */}
              {recentProjects.length > 0 && (
                <div className="mb-4">
                  <div
                    className="flex items-center justify-between py-1 cursor-pointer"
                    onClick={() => toggleSection("recent")}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recent</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      {expandedSections.recent ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
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
                            isActive={selectedProject?._id === project._id}
                            onClick={() => handleSelectProject(project)}
                            onContextMenu={(e, action) =>
                              handleContextMenu(e, project, action)
                            }
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
                  className="flex items-center justify-between py-1 cursor-pointer"
                  onClick={() => toggleSection("myProjects")}
                >
                  <div className="flex items-center gap-1">
                    <GoProjectRoadmap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">My Projects</span>
                    <Badge
                      variant="outline"
                      className="ml-1 h-5 px-1.5 text-xs"
                    >
                      {filteredProjects.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    {expandedSections.myProjects ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
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
                      {isLoading ? (
                        Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="py-2 px-3">
                              <Skeleton className="h-6 w-full" />
                            </div>
                          ))
                      ) : filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                          <ProjectItem
                            key={project._id}
                            project={project}
                            isActive={selectedProject?._id === project._id}
                            onClick={() => handleSelectProject(project)}
                            onContextMenu={(e, action) =>
                              handleContextMenu(e, project, action)
                            }
                          />
                        ))
                      ) : searchQuery ? (
                        <div className="py-3 px-3 text-sm text-muted-foreground">
                          No projects match your search
                        </div>
                      ) : (
                        <div className="py-3 px-3 text-sm text-muted-foreground">
                          No projects yet. Create your first project!
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Invites/Assigned Projects Section */}
              {assignedProjects.length > 0 && (
                <div className="mb-4">
                  <div
                    className="flex items-center justify-between py-1 cursor-pointer"
                    onClick={() => toggleSection("invites")}
                  >
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Shared with me
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-1 h-5 px-1.5 text-xs"
                      >
                        {assignedProjects.length}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      {expandedSections.invites ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {expandedSections.invites && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {isLoading
                          ? Array(2)
                              .fill(0)
                              .map((_, i) => (
                                <div key={i} className="py-2 px-3">
                                  <Skeleton className="h-6 w-full" />
                                </div>
                              ))
                          : assignedProjects.map((project) => (
                              <ProjectItem
                                key={`assigned-${project.data._id}`}
                                project={project.data}
                                isActive={
                                  selectedProject?._id === project.data._id
                                }
                                onClick={() =>
                                  handleSelectProject(project.data)
                                }
                                onContextMenu={(e, action) =>
                                  handleContextMenu(e, project.data, action)
                                }
                              />
                            ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </motion.div>
    </>
  );
};

export default Sidebar;
