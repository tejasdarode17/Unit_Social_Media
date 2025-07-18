import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: (JSON.parse(localStorage.getItem("userData")) || null),
    },
    reducers: {
        addUser(state, action) {
            state.userData = action.payload
            localStorage.setItem("userData", JSON.stringify(state.userData));
        },
        logOut(state) {
            state.userData = null;
            localStorage.removeItem("userData");
            localStorage.removeItem("token");
            localStorage.removeItem("postData");
        },
        updateUser(state, action) {
            state.userData = action.payload
            localStorage.setItem("userData", JSON.stringify(state.userData));
        }
    }
})


export const { addUser, logOut, updateUser } = userSlice.actions
export default userSlice.reducer



