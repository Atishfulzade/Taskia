const Setting = require("../models/setting.model.js");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const msg = require("../utils/message-constant.json");

// Default settings configuration
const DEFAULT_SETTINGS = {
  theme: "system",
  fontSize: "medium",
  useCustomId: false,
  notifications: {
    email: false,
    push: true,
    marketing: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 60,
  },
};

// Create new settings for user
const createSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingData = req.body;

    // Check if settings already exist
    const existingSetting = await Setting.findOne({ userId });
    if (existingSetting) {
      return handleResponse(res, 400, msg.setting.settingAlreadyExists);
    }

    // Create new settings with defaults merged with provided data
    const newSetting = await Setting.create({
      userId,
      ...DEFAULT_SETTINGS,
      ...settingData,
    });

    return handleResponse(
      res,
      201,
      msg.setting.settingCreatedSuccessfully,
      newSetting
    );
  } catch (error) {
    console.error("Error creating settings", error);
    return handleError(res, msg.setting.errorCreatingSetting, error, 500);
  }
};

// Get settings for the current user
const getSetting = async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await Setting.findOne({ userId });
    if (!settings) {
      // Return default settings if none exist
      return handleResponse(res, 200, msg.setting.usingDefaultSettings, {
        ...DEFAULT_SETTINGS,
        userId,
      });
    }

    return handleResponse(
      res,
      200,
      msg.setting.settingFetchedSuccessfully,
      settings
    );
  } catch (error) {
    console.error("Error fetching settings", error);
    return handleError(res, msg.setting.errorFetchingSetting, error, 500);
  }
};

// Update all settings (full update)
const updateSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingData = req.body;

    // Prevent changing userId
    if (settingData.userId && settingData.userId !== userId) {
      return handleResponse(res, 400, msg.setting.cannotChangeUserId);
    }

    // Find and update or create if doesn't exist
    const settings = await Setting.findOneAndUpdate(
      { userId },
      { ...settingData, userId }, // Ensure userId isn't changed
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return handleResponse(
      res,
      200,
      msg.setting.settingUpdatedSuccessfully,
      settings
    );
  } catch (error) {
    console.error("Error updating settings", error);
    return handleError(res, msg.setting.errorUpdatingSetting, error, 500);
  }
};

// Partial update of specific settings

// Delete user's settings
const deleteSetting = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Setting.deleteOne({ userId });
    if (result.deletedCount === 0) {
      return handleResponse(res, 404, msg.setting.settingNotFound);
    }

    return handleResponse(res, 200, msg.setting.settingDeleted);
  } catch (error) {
    console.error("Error deleting settings", error);
    return handleError(res, msg.setting.errorDeletingSetting, error, 500);
  }
};

module.exports = {
  createSetting,
  getSetting,
  updateSetting, // Full update (PUT)
  deleteSetting,
};
