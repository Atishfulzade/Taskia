"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Check,
  ChevronsUpDown,
  User,
  X,
  Loader2,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";
import { useDebounce } from "../hooks/useDebounce";

export function UserSearch({
  onSelectUser,
  defaultValue = [],
  maxUsers = Number.POSITIVE_INFINITY,
  placeholder = "Select users",
  className,
}) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(defaultValue || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingSelectedUsers, setLoadingSelectedUsers] = useState(false);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch users based on the search term
  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedSearchTerm) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await requestServer(
          `user/search?name=${debouncedSearchTerm}`
        );
        setUsers(response.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        showToast("Failed to load users", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchTerm]);

  // Filter out already selected users from search results
  const filteredUsers = useMemo(() => {
    return users.filter((user) => !selectedUserIds.includes(user._id));
  }, [users, selectedUserIds]);

  // Update selected users when IDs change
  useEffect(() => {
    const fetchSelectedUsers = async () => {
      if (selectedUserIds.length === 0) {
        setSelectedUsers([]);
        return;
      }

      setLoadingSelectedUsers(true);
      try {
        // Assuming there's an endpoint to fetch user details by IDs
        const response = await requestServer(
          `user/details?ids=${selectedUserIds.join(",")}`
        );
        setSelectedUsers(response.users || []);
      } catch (error) {
        console.error("Error fetching selected users:", error);
        showToast("Failed to load selected users", "error");
      } finally {
        setLoadingSelectedUsers(false);
      }
    };

    fetchSelectedUsers();
  }, [selectedUserIds]);

  const handleSelect = (userId, userName, userAvatar) => {
    if (
      !selectedUserIds.includes(userId) &&
      selectedUserIds.length < maxUsers
    ) {
      const updatedSelectedUserIds = [...selectedUserIds, userId];
      setSelectedUserIds(updatedSelectedUserIds);

      // Also update the selected users array with the user information
      const newUser = { _id: userId, name: userName, avatar: userAvatar };
      setSelectedUsers([...selectedUsers, newUser]);

      onSelectUser(updatedSelectedUserIds);

      // Clear search term after selection
      setSearchTerm("");
    }
    setOpen(false);
  };

  const removeUser = (userId) => {
    const updatedSelectedUserIds = selectedUserIds.filter(
      (id) => id !== userId
    );
    setSelectedUserIds(updatedSelectedUserIds);
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
    onSelectUser(updatedSelectedUserIds);
  };

  const clearAllUsers = () => {
    setSelectedUserIds([]);
    setSelectedUsers([]);
    onSelectUser([]);
  };

  const reachedMaxUsers = selectedUserIds.length >= maxUsers;

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={reachedMaxUsers && selectedUserIds.length > 0}
          >
            <span className="flex items-center">
              {loadingSelectedUsers ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading users...</span>
                </>
              ) : selectedUserIds.length > 0 ? (
                <>
                  <span>{selectedUserIds.length} selected</span>
                  {!reachedMaxUsers && (
                    <span className="ml-2 text-muted-foreground">
                      • Add more
                    </span>
                  )}
                </>
              ) : (
                placeholder
              )}
            </span>
            {!reachedMaxUsers && (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0 bg-white">
          <Command>
            <CommandInput
              placeholder="Search users..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="border-none focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Searching...</span>
                  </div>
                ) : debouncedSearchTerm ? (
                  "No users found."
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Type to search for users...
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="max-h-60">
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user._id}
                      value={user._id}
                      onSelect={() =>
                        handleSelect(user._id, user.name, user.avatar)
                      }
                      className="flex items-center py-2"
                      disabled={reachedMaxUsers}
                    >
                      <div className="flex items-center flex-1">
                        {user.avatar ? (
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <span className="truncate">{user.name}</span>
                      </div>
                      {selectedUserIds.includes(user._id) ? (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      ) : (
                        <UserPlus className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUsers.length > 0 ? (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">
              {selectedUsers.length}{" "}
              {selectedUsers.length === 1 ? "user" : "users"} selected
              {maxUsers < Number.POSITIVE_INFINITY && ` (max: ${maxUsers})`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllUsers}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {loadingSelectedUsers ? (
              <div className="w-full">
                {Array.from({ length: selectedUserIds.length }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-7 w-24 rounded-full inline-block mr-2 mb-2"
                  />
                ))}
              </div>
            ) : (
              selectedUsers.map((user) => (
                <Badge
                  key={user._id}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-2 hover:bg-secondary/80 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <button
                    onClick={() => removeUser(user._id)}
                    className="ml-1 rounded-full hover:bg-gray-200 p-1 transition-colors"
                    aria-label={`Remove ${user.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
