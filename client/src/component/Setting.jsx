"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Moon,
  Sun,
  Save,
  RotateCcw,
  Check,
  Fingerprint,
  Palette,
  Lock,
  UserCog,
} from "lucide-react";
import {
  fetchSettings,
  updateSettings,
  updateSettingState,
  resetSettings,
} from "../store/settingSlice";

const Setting = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleToggle = (path) => {
    const currentValue = path
      .split(".")
      .reduce((obj, key) => obj[key], settings);
    dispatch(updateSettingState({ path, value: !currentValue }));
  };

  const handleSelectChange = (path, value) => {
    dispatch(updateSettingState({ path, value }));
  };

  const handleThemeChange = (theme) => {
    dispatch(updateSettingState({ path: "theme", value: theme }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await dispatch(updateSettings(settings)).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    dispatch(resetSettings());
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* ID Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Fingerprint className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold">ID Settings</h2>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Use Custom ID</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable to use a custom identifier
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.useCustomId
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    onClick={() => handleToggle("useCustomId")}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.useCustomId ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Appearance</h2>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {["light", "dark", "system"].map((theme) => (
                    <div
                      key={theme}
                      className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer ${
                        settings.theme === theme
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => handleThemeChange(theme)}
                    >
                      {theme === "light" && (
                        <Sun className="h-6 w-6 mb-2 text-yellow-500" />
                      )}
                      {theme === "dark" && (
                        <Moon className="h-6 w-6 mb-2 text-indigo-500" />
                      )}
                      {theme === "system" && (
                        <div className="flex h-6 mb-2">
                          <Sun className="h-6 w-6 text-yellow-500" />
                          <Moon className="h-6 w-6 text-indigo-500 -ml-1" />
                        </div>
                      )}
                      <span className="text-sm font-medium capitalize">
                        {theme}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                    <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Notifications</h2>
                </div>
              </div>

              <div className="space-y-4">
                {["email", "push", "marketing"].map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <h3 className="font-medium">
                        {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                        Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {type === "email" && "Receive notifications via email"}
                        {type === "push" &&
                          "Receive push notifications on your devices"}
                        {type === "marketing" &&
                          "Receive marketing and promotional emails"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications[type]
                          ? "bg-blue-600"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      onClick={() => handleToggle(`notifications.${type}`)}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications[type]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </button>
              </div>

              {saveSuccess && (
                <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex items-center text-green-700 dark:text-green-400">
                  <Check className="h-4 w-4 mr-2" />
                  <span className="text-sm">Settings saved successfully!</span>
                </div>
              )}

              {settings.error && (
                <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                  {settings.error}
                </div>
              )}
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold">Security</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Add an extra layer of security
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.twoFactorAuth
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    onClick={() => handleToggle("security.twoFactorAuth")}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.twoFactorAuth
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="py-3">
                  <label className="block text-sm font-medium mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      handleSelectChange(
                        "security.sessionTimeout",
                        Number(e.target.value)
                      )
                    }
                  >
                    {[15, 30, 60, 120, 240].map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes === 60
                          ? "1 hour"
                          : minutes === 120
                          ? "2 hours"
                          : minutes === 240
                          ? "4 hours"
                          : `${minutes} minutes`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <UserCog className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-lg font-semibold">Account Info</h2>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Account Type:
                  </span>
                  <span className="font-medium">Premium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Member Since:
                  </span>
                  <span className="font-medium">Jan 15, 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Setting;
