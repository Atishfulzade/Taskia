"use client";

import { useState, useEffect, useRef } from "react";
import { User, X, Loader2, Search } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import requestServer from "../utils/requestServer";
import { toast } from "sonner";

export function UserSearch({
  onSelectUser,
  defaultValue = [],
  maxUsers = Number.POSITIVE_INFINITY,
  placeholder = "Search users...",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(defaultValue || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounce the search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch users based on the search term
  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 1) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching users with search term:", debouncedSearchTerm);

        const response = await requestServer(
          `user/search?name=${encodeURIComponent(debouncedSearchTerm)}`
        );

        console.log("API Response:", response);

        if (response && response.data && Array.isArray(response.data.users)) {
          console.log("Users found:", response.data.users);
          setUsers(response.data.users);
        } else {
          console.error("Invalid response structure:", response);
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [debouncedSearchTerm, isOpen]);

  // Load selected users' details when component mounts or defaultValue changes
  useEffect(() => {
    if (!defaultValue || defaultValue.length === 0) {
      setSelectedUsers([]);
      return;
    }

    setSelectedUserIds(defaultValue);
  }, [defaultValue]);

  const handleSelect = (user) => {
    if (
      !selectedUserIds.includes(user._id) &&
      selectedUserIds.length < maxUsers
    ) {
      const updatedSelectedUserIds = [...selectedUserIds, user._id];
      setSelectedUserIds(updatedSelectedUserIds);

      const newUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      };

      setSelectedUsers((prev) => [...prev, newUser]);
      onSelectUser(updatedSelectedUserIds);
      setSearchTerm("");
    }
    setIsOpen(false);
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
  const filteredUsers = users.filter(
    (user) => !selectedUserIds.includes(user._id)
  );

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={
            selectedUserIds.length > 0
              ? `${selectedUserIds.length} selected • Add more`
              : placeholder
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          disabled={reachedMaxUsers}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200 dark:border-gray-700"
        >
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2 dark:text-gray-300" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <ul className="py-1">
              {filteredUsers.map((user) => (
                <li
                  key={user._id}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between"
                  onClick={() => handleSelect(user)}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 dark:bg-gray-700">
                      <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </div>
                    <span className="text-sm dark:text-white">{user.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : debouncedSearchTerm ? (
            <div className="py-4 px-3 text-center text-sm text-gray-500 dark:text-gray-400">
              No users found matching "{debouncedSearchTerm}"
            </div>
          ) : (
            <div className="py-4 px-3 text-center text-sm text-gray-500 dark:text-gray-400">
              Type to search for users...
            </div>
          )}
        </div>
      )}

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedUsers.length}{" "}
              {selectedUsers.length === 1 ? "user" : "users"} selected
              {maxUsers < Number.POSITIVE_INFINITY && ` (max: ${maxUsers})`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllUsers}
              className="h-6 px-2 text-xs dark:text-gray-300"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <Badge
                key={user._id}
                variant="secondary"
                className="flex items-center gap-1 py-1 px-2 hover:bg-secondary/80 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-600">
                  <User className="h-3 w-3 text-gray-500 dark:text-gray-300" />
                </div>
                <span className="max-w-[100px] truncate dark:text-white">
                  {user.name}
                </span>
                <button
                  onClick={() => removeUser(user._id)}
                  className="ml-1 rounded-full hover:bg-gray-200 p-1 transition-colors dark:hover:bg-gray-600"
                  aria-label={`Remove ${user.name}`}
                >
                  <X className="h-3 w-3 dark:text-gray-300" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
