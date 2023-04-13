import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userId: null,
    username: "",
    displayName: "",
    email: "",
    roleId: "",
    profilePictureUrl: "",
    following: "",
    followers: "",
  },
  reducers: {
    setUser: (state, action) => {
      const {
        userId,
        username,
        displayName,
        email,
        roleId,
        profilePictureUrl,
        following,
        followers,
      } = action.payload;
      state.userId = userId;
      state.username = username;
      state.displayName = displayName;
      state.email = email;
      state.roleId = roleId;
      state.profilePictureUrl = profilePictureUrl;
      state.following = following;
      state.followers = followers;
    },
    clearUser: (state) => {
      state.userId = null;
      state.username = "";
      state.displayName = "";
      state.email = "";
      state.roleId = "";
      state.profilePictureUrl = "";
      state.following = "";
      state.followers = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
