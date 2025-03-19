// Simple utility to help with debugging
export const debugLog = (label, data, enabled = true) => {
  if (enabled && process.env.NODE_ENV !== "production") {
    console.log(`[DEBUG] ${label}:`, data);
  }
};
