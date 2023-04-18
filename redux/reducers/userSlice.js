import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user_id: null,
    username: "",
    displayName: "",
    email: "",
    role_id: "",
    profile_picture_url: "",
    following: "",
    followers: "",
  },
  reducers: {
    setUser: (state, action) => {
      const {
        user_id,
        username,
        displayName,
        email,
        role_id,
        profile_picture_url,
        following,
        followers,
      } = action.payload;
      state.user_id = user_id;
      state.username = username;
      state.displayName = displayName;
      state.email = email;
      state.role_id = role_id;
      state.profile_picture_url = profile_picture_url;
      state.following = following;
      state.followers = followers;
    },
    clearUser: (state) => {
      state.user_id = null;
      state.username = "";
      state.displayName = "";
      state.email = "";
      state.role_id = "";
      state.profile_picture_url = "";
      state.following = "";
      state.followers = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
