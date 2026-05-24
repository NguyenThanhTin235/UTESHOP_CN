import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Backend auth endpoint

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (email, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/register/send-otp`, { email });
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        message = firstError;
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        message = firstError;
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe = false }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      return { ...response.data, rememberMe };
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        message = firstError;
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const verify2FALogin = createAsyncThunk(
  'auth/verify2FALogin',
  async (verifyData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/verify-2fa`, verifyData);
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, userData);
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        message = firstError;
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const token = sessionStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`${API_URL}/profile`, userData, config);
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (formData, thunkAPI) => {
    try {
      const token = sessionStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };
      const response = await axios.post(`${API_URL}/profile/avatar`, formData, config);
      sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (tokenId, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/google`, { tokenId });
      if (response.data.data) {
        sessionStorage.setItem('user', JSON.stringify(response.data.data.user));
        sessionStorage.setItem('token', response.data.data.token);
        // Google login: do NOT auto-persist to localStorage
      }
      return response.data;
    } catch (error) {
      let message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    // Only restore from sessionStorage. If sessionStorage is empty but localStorage has data,
    // it means the user did NOT tick "Remember me" in a previous session, so treat as logged out.
    user: (() => {
      const sessionUser = sessionStorage.getItem('user');
      if (sessionUser) return JSON.parse(sessionUser);
      const lsUser = localStorage.getItem('user');
      const lsToken = localStorage.getItem('token');
      if (lsUser && lsToken) {
        // Restore into sessionStorage so the rest of the app can read it
        sessionStorage.setItem('user', lsUser);
        sessionStorage.setItem('token', lsToken);
        return JSON.parse(lsUser);
      }
      return null;
    })(),
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    logout: (state) => {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      state.user = null;
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.user = action.payload.data.user;
        sessionStorage.setItem('user', JSON.stringify(action.payload.data.user));
        sessionStorage.setItem('token', action.payload.data.token);
        // New registrations don't auto-persist (no rememberMe)
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        if (action.payload.data && action.payload.data.user) {
          state.user = action.payload.data.user;
          sessionStorage.setItem('user', JSON.stringify(action.payload.data.user));
          sessionStorage.setItem('token', action.payload.data.token);
          if (action.payload.rememberMe) {
            // Persist across browser sessions
            localStorage.setItem('user', JSON.stringify(action.payload.data.user));
            localStorage.setItem('token', action.payload.data.token);
          } else {
            // Clear any stale persisted data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(verify2FALogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verify2FALogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        if (action.payload.data && action.payload.data.user) {
          state.user = action.payload.data.user;
          sessionStorage.setItem('user', JSON.stringify(action.payload.data.user));
          sessionStorage.setItem('token', action.payload.data.token);
          localStorage.setItem('user', JSON.stringify(action.payload.data.user));
          localStorage.setItem('token', action.payload.data.token);
        }
      })
      .addCase(verify2FALogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.user = action.payload.data.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.user = action.payload.data.user;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data.user;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;
