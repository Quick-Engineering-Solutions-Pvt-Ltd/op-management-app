// store/Slice/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminSigIn, adminSignup } from '../../utils/api';



interface LoginPayload {
  email: string;
  password: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  userType: string;
}

interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}



export const register = createAsyncThunk(
  'auth/register',
  async (userData: UserData, { rejectWithValue }) => {
    try {
      const result = await adminSignup(userData);
      return result; // Adjust based on API response structure
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);


export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await adminSigIn({
        email: payload.email, // Map username to email
        password: payload.password,
      });
      if (!response.success) {
        return rejectWithValue(response.message || "Login failed");
      }
      return response;
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle",
    error: null,
  } as AuthState,
  reducers: {
    resetAuth: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetAuth } = authSlice.actions;
export default authSlice.reducer;