import { Folder, Star, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectItem = ({
  project,
  isActive,
  onClick,
  onContextMenu,
  isShared,
}) => {
  const navigate = useNavigate();
  return (
    <div
      className={`group flex items-center justify-between py-2 px-3 rounded-md my-1 cursor-pointer transition-colors duration-200 ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, project);
      }}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span
          className="text-sm font-medium truncate"
          onClick={() =>
            navigate(`/project/${project.customId || project._id}`)
          }
        >
          {project?.title}
        </span>
      </div>
      {!isShared && (
        <div className="flex items-center">
          {project?.isStarred && (
            <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
          )}
          <div
            className="h-6 w-6 flex justify-center items-center opacity-0 group-hover:opacity-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e, project, "menu");
            }}
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectItem;
