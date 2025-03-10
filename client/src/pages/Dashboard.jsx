import React, { useState, useMemo } from "react";
import { Search, Columns, List } from "lucide-react";

// Shadcn UI Components
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

// Project Components
import ProjectDetail from "./ProjectDetail";
import ProjectList from "./ProjectList";
import AddStatusPopup from "../component/AddStatusPopup";

const Dashboard = () => {
  // State Management
  const [selectedSubBoard, setSelectedSubBoard] = useState(2);
  const [openStatusPopup, setOpenStatusPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Navigation Items with Enhanced Metadata
  const navItems = useMemo(
    () => [
      {
        id: 1,
        icon: List,
        label: "List",
        component: ProjectList,
      },
      {
        id: 2,
        icon: Columns,
        label: "Board",
        component: ProjectDetail,
      },
    ],
    []
  );

  // Render Selected Component
  const SelectedComponent = useMemo(() => {
    const selectedItem = navItems.find((item) => item.id === selectedSubBoard);
    return selectedItem ? selectedItem.component : ProjectDetail;
  }, [selectedSubBoard, navItems]);

  // Action Handlers
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement global search logic across projects
  };

  const handleReset = () => {
    // Implement reset logic
    setIsResetDialogOpen(false);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="flex px-4 h-12 justify-between border-b border-slate-300 dark:border-gray-700 items-center">
        {/* Left Navigation */}
        <Tabs
          value={selectedSubBoard.toString()}
          onValueChange={(value) => setSelectedSubBoard(Number(value))}
        >
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            {navItems.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id.toString()}
                className="rounded-sm px-4 py-2 flex items-center dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 z-[1]">
          {/* Search */}
          <div className="relative z-[1]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder="Search status..."
              className="pl-8 w-64 z-0 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <SelectedComponent />
      </div>

      {/* Modals */}
      {openStatusPopup && (
        <AddStatusPopup setOpenStatusPopup={setOpenStatusPopup} />
      )}
    </div>
  );
};

export default Dashboard;
