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

// Get settings for the current user
const getSetting = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find existing settings
    const settings = await Setting.findOne({ userId });

    if (!settings) {
      return handleResponse(res, 404, msg.setting.settingNotFound, null);
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

// Create or update settings
const manageSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingData = req.body;

    // Find existing settings
    let settings = await Setting.findOne({ userId });

    if (!settings) {
      // Create new settings with defaults merged with provided data
      const newSettingData = {
        userId,
        ...DEFAULT_SETTINGS,
        ...settingData,
      };

      settings = await Setting.create(newSettingData);

      return handleResponse(
        res,
        201,
        msg.setting.settingCreatedSuccessfully,
        settings
      );
    }

    // Update existing settings if new data provided
    if (Object.keys(settingData).length > 0) {
      // Merge existing settings with new data
      const updatedData = { ...settingData };

      settings = await Setting.findOneAndUpdate({ userId }, updatedData, {
        new: true,
      });

      return handleResponse(
        res,
        200,
        msg.setting.settingUpdatedSuccessfully,
        settings
      );
    }

    // Return existing settings if no update requested
    return handleResponse(
      res,
      200,
      msg.setting.settingFetchedSuccessfully,
      settings
    );
  } catch (error) {
    console.error("Error managing settings", error);
    return handleError(res, msg.setting.errorFetchingSetting, error, 500);
  }
};

// Update specific setting
const updateSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingId = req.params.id;
    const updatedSetting = req.body;

    // Verify setting exists and belongs to user
    const setting = await Setting.findOne({ _id: settingId, userId });

    if (!setting) {
      return handleResponse(res, 404, msg.setting.settingNotFound);
    }

    // Prevent changing userId
    if (updatedSetting.userId && updatedSetting.userId !== userId) {
      return handleResponse(res, 400, msg.setting.cannotChangeUserId);
    }

    const updated = await Setting.findByIdAndUpdate(settingId, updatedSetting, {
      new: true,
    });

    return handleResponse(
      res,
      200,
      msg.setting.settingUpdatedSuccessfully,
      updated
    );
  } catch (error) {
    console.error("Error updating setting", error);
    return handleError(res, msg.setting.errorUpdatingSetting, error, 500);
  }
};

// Delete setting
const deleteSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const settingId = req.params.id;

    if (!settingId) {
      return handleResponse(res, 400, msg.setting.settingIdRequired);
    }

    // Verify setting exists and belongs to user
    const setting = await Setting.findOne({ _id: settingId, userId });

    if (!setting) {
      return handleResponse(res, 404, msg.setting.settingNotFound);
    }

    await Setting.findByIdAndDelete(settingId);
    return handleResponse(res, 200, msg.setting.settingDeleted);
  } catch (error) {
    console.error("Error deleting setting", error);
    return handleError(res, msg.setting.errorDeletingSetting, error, 500);
  }
};

module.exports = {
  getSetting,
  manageSetting,
  updateSetting,
  deleteSetting,
};
