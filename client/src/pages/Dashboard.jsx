import React, { useState, useMemo } from "react";
import {
  LucideList,
  LayoutDashboard,
  Search,
  Settings,
  Filter,
  Plus,
  MoreHorizontal,
  RefreshCw,
  Layout,
  Columns,
  List,
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Project Components
import ProjectDetail from "./ProjectDetail";
import ProjectList from "./ProjectList";
import AddStatusPopup from "../component/AddStatusPopup";

// Advanced Configuration Modal
const ConfigurationModal = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState("default");
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dashboard Configuration</DialogTitle>
          <DialogDescription>
            Customize your dashboard experience
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {/* View Mode */}
            <div className="flex items-center justify-between">
              <Label>Default View Mode</Label>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label>Dark Mode</Label>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            {/* Compact View */}
            <div className="flex items-center justify-between">
              <Label>Compact View</Label>
              <Switch checked={compactView} onCheckedChange={setCompactView} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  // State Management
  const [selectedSubBoard, setSelectedSubBoard] = useState(2);
  const [openStatusPopup, setOpenStatusPopup] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

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
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <Card className="sticky top-0 z-50 rounded-none border-x-0 border-t-0 shadow-sm">
        <div className="flex h-14 px-4 justify-between items-center">
          {/* Left Navigation */}
          <Tabs
            value={selectedSubBoard.toString()}
            onValueChange={(value) => setSelectedSubBoard(Number(value))}
          >
            <TabsList>
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id.toString()}
                  className="space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Configuration Dropdown */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsConfigOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dashboard Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => setOpenStatusPopup(true)}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Status
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => setIsResetDialogOpen(true)}
                    className="text-red-600"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Dashboard
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <SelectedComponent />
      </div>

      {/* Modals */}
      {openStatusPopup && (
        <AddStatusPopup setOpenStatusPopup={setOpenStatusPopup} />
      )}

      <ConfigurationModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Dashboard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all your dashboard settings to default. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
