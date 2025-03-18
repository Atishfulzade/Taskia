import { useState, useRef } from "react";
import { PanelLeft, Plus, Search, X } from "lucide-react";

const SidebarHeader = ({
  isCollapsed,
  toggleCollapse,
  setShowAddProject,
  setShowSearch,
  showSearch,
  searchQuery,
  setSearchQuery,
}) => {
  const searchInputRef = useRef(null);

  return (
    <div className="flex h-12 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-3">
      {!isCollapsed && (
        <h3 className="font-medium text-gray-800 dark:text-gray-200">
          Projects
        </h3>
      )}

      <div className="flex items-center justify-center gap-1 relative">
        {!isCollapsed && (
          <>
            {showSearch ? (
              <div className="absolute w-[180px] z-20 right-10 top-1 bg-white dark:bg-gray-800">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm w-full px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearch(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setShowSearch(true)}
                aria-label="Search projects"
              >
                <Search size={18} />
              </button>
            )}
          </>
        )}

        {!isCollapsed && (
          <button
            className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            onClick={() => setShowAddProject(true)}
            aria-label="Add new project"
          >
            <Plus size={18} />
          </button>
        )}

        <button
          className="h-8 w-8 flex justify-center items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft size={18} />
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;
