import {
  ChevronDown,
  ChevronRight,
  Clock,
  Folder,
  Plus,
  Users,
} from "lucide-react";
import ProjectItem from "./ProjectItem";

const SidebarContent = ({
  isCollapsed,
  expandedSections,
  toggleSection,
  recentProjects,
  selectedProjectId,
  handleSelectProject,
  handleContextMenu,
  filteredProjects,
  searchQuery,
  setShowAddProject,
  sharedProjects,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2">
        {/* Recent Projects Section */}
        {recentProjects?.length > 0 && (
          <div className="mb-4">
            <div
              className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1"
              onClick={() => toggleSection("recent")}
            >
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Recent
                </span>
              </div>
              <button
                className="h-5 w-5 flex items-center justify-center text-gray-500 dark:text-gray-400"
                aria-label={
                  expandedSections.recent
                    ? "Collapse recent projects"
                    : "Expand recent projects"
                }
              >
                {expandedSections.recent ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>

            {expandedSections.recent && (
              <div className="mt-1 overflow-hidden">
                {recentProjects.map((project) => (
                  <ProjectItem
                    key={`recent-${project._id}`}
                    project={project}
                    isActive={selectedProjectId === project._id}
                    onClick={() => handleSelectProject(project)}
                    onContextMenu={handleContextMenu}
                    isShared={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Projects Section */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1"
            onClick={() => toggleSection("myProjects")}
          >
            <div className="flex items-center gap-1">
              <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                My Projects
              </span>
              <span className="ml-1 h-5 px-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full flex items-center justify-center min-w-[20px]">
                {filteredProjects?.length || 0}
              </span>
            </div>
            <button
              className="h-5 w-5 flex items-center justify-center text-gray-500 dark:text-gray-400"
              aria-label={
                expandedSections.myProjects
                  ? "Collapse my projects"
                  : "Expand my projects"
              }
            >
              {expandedSections.myProjects ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>

          {expandedSections.myProjects && (
            <div className="mt-1 overflow-hidden">
              {filteredProjects?.length > 0 ? (
                filteredProjects?.map((project) => (
                  <ProjectItem
                    key={project._id}
                    project={project}
                    isActive={selectedProjectId === project._id}
                    onClick={() => handleSelectProject(project)}
                    onContextMenu={handleContextMenu}
                    isShared={false}
                  />
                ))
              ) : searchQuery ? (
                <div className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">
                  No projects match your search
                </div>
              ) : (
                <div className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">
                  No projects yet. Create your first project!
                </div>
              )}

              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mt-1"
                onClick={() => setShowAddProject(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Shared Projects Section */}
        <div className="mb-4">
          <div
            className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1"
            onClick={() => toggleSection("shared")}
          >
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Shared with me
              </span>
              <span className="ml-1 h-5 px-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full flex items-center justify-center min-w-[20px]">
                {sharedProjects?.length || 0}
              </span>
            </div>
            <button
              className="h-5 w-5 flex items-center justify-center text-gray-500 dark:text-gray-400"
              aria-label={
                expandedSections.shared
                  ? "Collapse shared projects"
                  : "Expand shared projects"
              }
            >
              {expandedSections.shared ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>

          {expandedSections.shared && (
            <div className="mt-1 overflow-hidden">
              {sharedProjects?.length > 0 ? (
                sharedProjects?.map((project) => (
                  <ProjectItem
                    key={`shared-${project?._id}`}
                    project={project}
                    isActive={selectedProjectId === project?._id}
                    onClick={() => handleSelectProject(project)}
                    onContextMenu={handleContextMenu}
                    isShared={true}
                  />
                ))
              ) : (
                <div className="py-3 px-3 text-sm text-gray-500 dark:text-gray-400">
                  No shared projects yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;
