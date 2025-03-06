"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
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
import requestServer from "../utils/requestServer";
import { showToast } from "../utils/showToast";

export function UserSearch({ onSelectUser, defaultValue }) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await requestServer(`user/all`);
        setUsers(response.data || []);

        // If defaultValue is provided, find and select that user
        if (defaultValue) {
          const user = response.data.find((user) => user._id === defaultValue);
          if (user) {
            setSelectedUser(user);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        showToast("Failed to load users", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [defaultValue]);

  const handleSelect = (userId) => {
    const user = users.find((user) => user._id === userId);
    setSelectedUser(user);
    onSelectUser(user);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser ? (
            <div className="flex items-center bg-white">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar || "/placeholder.svg"}
                  alt={selectedUser.name}
                  className="w-5 h-5 rounded-full mr-2"
                />
              ) : (
                <User className="mr-2 h-4 w-4" />
              )}
              {selectedUser.name}
            </div>
          ) : (
            "Select user"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-white">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading..." : "No users found."}
            </CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={() => handleSelect(user._id)}
                >
                  <div className="flex items-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    {user.name}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedUser?._id === user._id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
