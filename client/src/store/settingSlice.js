import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import requestServer from "@/utils/requestServer";

const normalizeSettings = (settings) => {
  if (!settings) return null;

  const normalized = { ...settings };

  // Normalize boolean values
  const booleanKeys = [
    "useCustomId",
    "notifications.email",
    "notifications.push",
    "notifications.marketing",
    "security.twoFactorAuth",
  ];

  booleanKeys.forEach((key) => {
    const keys = key.split(".");
    let target = normalized;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    if (target[lastKey] !== undefined) {
      target[lastKey] = target[lastKey] === true || target[lastKey] === "true";
    }
  });

  if (normalized.security?.sessionTimeout) {
    normalized.security.sessionTimeout = Number(
      normalized.security.sessionTimeout
    );
  }

  return normalized;
};

const initialState = {
  _id: null,
  userId: null,
  theme: "system",
  useCustomId: false,
  fontSize: "medium",
  notifications: {
    email: false,
    push: true,
    marketing: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 60,
  },
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await requestServer(`/setting/get`);
      return normalizeSettings(res.data) || initialState;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const { loading, error, ...settingsToUpdate } = settings;
      const endpoint = settingsToUpdate._id
        ? `/setting/update/${settingsToUpdate._id}`
        : `/setting/create`;

      const res = await requestServer(endpoint, settingsToUpdate, "POST");
      return normalizeSettings(res.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const settingSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettingState: (state, action) => {
      const { path, value } = action.payload;
      const keys = path.split(".");
      let current = state;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
    },
    resetSettings: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        return { ...state, ...action.payload, loading: false };
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        return { ...state, ...action.payload, loading: false };
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateSettingState, resetSettings } = settingSlice.actions;
export default settingSlice.reducer;
