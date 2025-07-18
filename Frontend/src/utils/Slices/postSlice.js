import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: "posts",
    initialState: {
        postData: (JSON.parse(localStorage.getItem("postData")) || []),
        isCreatePost: false,
    },
    reducers: {

        setPostData(state, action) {

            const sortedPosts = [...action.payload].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            state.postData = sortedPosts;
            localStorage.setItem("postData", JSON.stringify(sortedPosts));
        },

        addOnePost(state, action) {
            state.postData = [action.payload, ...state.postData];
            localStorage.setItem("postData", JSON.stringify(state.postData))
        },

        editPostData(state, action) {
            const { id, description, image } = action.payload

            state.postData = state.postData.map((post) => {
                if (post._id === id) {
                    return { ...post, description, image }
                }
                return post
            })
            localStorage.setItem("postData", JSON.stringify(state.postData));
        },

        deletePostData(state, action) {
            const { id } = action.payload;
            state.postData = state.postData.filter(post => post._id !== id);
            localStorage.setItem("postData", JSON.stringify(state.postData));
        },

        toggleCreatePost(state, action) {
            if (typeof action.payload === "boolean") {
                state.isCreatePost = action.payload;
            } else {
                state.isCreatePost = !state.isCreatePost;
            }
        },

        updatePostLikes(state, action) {
            const { id, likes } = action.payload
            state.postData = state.postData.map(post => {
                if (post._id === id) {
                    return { ...post, likes };
                }

                return post;
            });
            localStorage.setItem("postData", JSON.stringify(state.postData));
        },
        
        updatePostCommentsCount(state, action) {
            const { id, comments } = action.payload
            state.postData = state.postData.map((post) => {
                if (post._id === id) {
                    return { ...post, comments }
                }
                return post
            })
            localStorage.setItem("postData", JSON.stringify(state.postData));
        },

        deletePostComment(state, action) {
            const { commentID, postID } = action.payload;

            const post = state.postData.find((p) => p._id === postID);
            if (!post) return;

            function deleteComment(comments, commentID) {
                for (let i = 0; i < comments.length; i++) {
                    const comment = comments[i];

                    if (comment._id === commentID) {
                        comments.splice(i, 1);
                        return true;
                    }

                    if (comment.replies?.length) {
                        const deleted = deleteComment(comment.replies, commentID);
                        if (deleted) return true;
                    }
                }
                return false;
            }

            const deleted = deleteComment(post.comments, commentID);

            if (deleted) {
                localStorage.setItem("postData", JSON.stringify(state.postData));
            }
        },

        editCommentData(state, action) {

            const { commentID, postID, comment } = action.payload

            const post = state.postData.find((p) => p._id === postID);

            function updateComment(comments, commentID, newText) {

                for (let c of comments) {

                    if (c._id === commentID) {
                        c.comment = newText
                        return true
                    }

                    if (c.replies?.length) {
                        const updated = updateComment(c.replies, commentID, newText)
                        if (updated) return true

                    }

                }
                return false

            }

            const updated = updateComment(post?.comments, commentID, comment)

            if (updated) {
                localStorage.setItem("postData", JSON.stringify(state.postData));
            }

        },

        updateLikeInComment(state, action) {
            const { postID, commentID, like } = action.payload

            const post = state.postData.find((p) => p._id === postID);
            if (!post) return

            function addlike(comments, commentID, newLikes) {

                for (let comment of comments) {
                    if (commentID === comment._id) {
                        comment.likes = [...newLikes]
                        return true
                    }

                    if (comment.replies.length) {
                        const updated = addlike(comment.replies, commentID, newLikes)
                        if (updated) return true
                    }
                }
                false
            }

            const updated = addlike(post.comments, commentID, like)
            if (updated) {
                localStorage.setItem("postData", JSON.stringify(state.postData));
            }
        },

        addReplay(state, action) {
            const { commentID, postID, comments } = action.payload

            const post = state.postData.find((p) => p._id === postID)
            if (!post) {
                return
            }

            post.comments = [...comments]
            localStorage.setItem("postData", JSON.stringify(state.postData));
        },
    },
});

export const { setPostData, addOnePost, toggleCreatePost, updatePostLikes, updatePostCommentsCount, editPostData, deletePostData, deletePostComment, editCommentData, updateLikeInComment, addReplay } = postSlice.actions;
export default postSlice.reducer;













// editCommentData(state, action) {
//     const { postID, commentID, comment } = action.payload;

//     const post = state.postData.find((p) => p._id === postID);
//     if (!post) return;

//     const commentToEdit = post.comments.find((c) => c._id === commentID);
//     if (!commentToEdit) return;

//     commentToEdit.comment = comment;
//     localStorage.setItem("postData", JSON.stringify(state.postData));
// },



// deletePostComment(state, action) {
//     const { commentID, postID } = action.payload;

//     const post = state.postData.find((p) => p._id === postID);
//     if (!post) return;

//     post.comments = post.comments.filter((c) => c._id !== commentID);

//     localStorage.setItem("postData", JSON.stringify(state.postData));
// },

// the above code worked cuz of redux other wise we have to do this below approach
// state.postData = state.postData.map(post => {
//     if (post._id !== postID) return post;

//     return {
//         ...post,
//         comments: post.comments.filter(c => c._id !== commentID)
//     };
// });
