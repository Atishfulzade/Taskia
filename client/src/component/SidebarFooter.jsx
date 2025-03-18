import { Settings } from "lucide-react";

const SidebarFooter = ({ isCollapsed }) => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
      <button
        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
        {!isCollapsed && <span>Settings</span>}
      </button>
    </div>
  );
};

export default SidebarFooter;
