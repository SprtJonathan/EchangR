import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    user_id: null,
    username: "",
    display_name: "",
    fname: "",
    lname: "",
    email: "",
    birth_date: "",
    role_id: "",
    profile_picture_url: "",
    user_description: "",
    following: "",
    followers: "",
  },
  reducers: {
    setUser: (state, action) => {
      const {
        user_id,
        username,
        display_name,
        fname,
        lname,
        email,
        birth_date,
        role_id,
        profile_picture_url,
        user_description,
        following,
        followers,
      } = action.payload;
      state.user_id = user_id;
      state.username = username;
      state.display_name = display_name;
      state.fname = fname;
      state.lname = lname;
      state.email = email;
      state.birth_date = birth_date;
      state.role_id = role_id;
      state.profile_picture_url = profile_picture_url;
      state.user_description = user_description;
      state.following = following;
      state.followers = followers;
    },
    updateUser: (state, action) => {
      const { username, display_name, profile_picture_url, user_description } =
        action.payload;
      // console.log(state);
      // console.log(action);
      state.username = username;
      state.display_name = display_name;
      state.profile_picture_url = profile_picture_url;
      state.user_description = user_description;
    },
    clearUser: (state) => {
      state.user_id = null;
      state.username = "";
      state.display_name = "";
      state.fname;
      state.lname;
      state.email = "";
      state.birth_date = "";
      state.role_id = "";
      state.profile_picture_url = "";
      state.user_description = "";
      state.following = "";
      state.followers = "";
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
