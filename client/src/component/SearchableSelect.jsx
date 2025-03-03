import React, { useState, useEffect } from "react";
import requestServer from "../utils/requestServer";
import { useSelector } from "react-redux";

// Debounce helper function
const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const SearchableSelect = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const userId = useSelector((state) => state.user.user?._id);
  // Fetch users from API based on search term
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (searchTerm.trim()) {
          setIsLoading(true);
          const res = await requestServer(`user/search/${searchTerm}`);
          setUsers(res.data.filter((user) => user._id !== userId));
          setIsLoading(false);
        } else {
          setUsers([]); // Clear results if search term is empty
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setIsLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchUsers, 500); // Adding 500ms debounce
    debouncedFetch(); // Call the debounced fetch

    return () => {
      // Cleanup debounce timer
      clearTimeout(debouncedFetch);
    };
  }, [searchTerm]);

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    onSelectUser(user); // Pass selected user to parent component
    setSearchTerm(""); // Clear search term
    setUsers([]); // Clear dropdown
  };

  return (
    <div className="relative w-48">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search for a user..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-1 text-sm rounded border border-slate-300"
      />

      {/* Dropdown List */}
      {searchTerm && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            borderRadius: "4px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "8px", textAlign: "center" }}>
              Loading...
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fff",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f0f0f0")
                }
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
              >
                {user.name}
              </div>
            ))
          ) : (
            <div style={{ padding: "8px", textAlign: "center" }}>
              No users found
            </div>
          )}
        </div>
      )}

      {/* Selected User */}
      {selectedUser && (
        <div style={{ marginTop: "10px", fontSize: "10px" }}>
          {selectedUser.name}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
