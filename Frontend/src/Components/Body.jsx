import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { BiLike } from "react-icons/bi";
import toast from "react-hot-toast"
import { AddPost, AddPostDummy } from './AddPost';
import { CiSignpostR1 } from "react-icons/ci";
import { HiDotsHorizontal } from "react-icons/hi";
import { useSelector, useDispatch } from 'react-redux';
import { setPostData, updatePostLikes, updatePostCommentsCount, deletePostComment, editCommentData, updateLikeInComment, addReplay } from '../utils/Slices/postSlice';
import { GrLike } from "react-icons/gr";
import { Navigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { MainShimmer } from '../Animations/MainShimmer';
import { formatTimeAgo } from '../utils/formatDate';


const Body = () => {

    const dispatch = useDispatch()
    const postData = useSelector((state) => state.posts.postData)
    const isCreatePost = useSelector((state) => state.posts.isCreatePost)
    const userData = useSelector((state) => state.user.userData);
    const token = localStorage.getItem("token")
    const [loading, setLoading] = useState(false)

    if (!userData || !token) {
        return <Navigate to="/" replace></Navigate>
    }

    async function getAllPosts() {
        try {
            setLoading(true)
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`)

            const data = await response.data

            dispatch(setPostData(data?.blogs))

        } catch (error) {
            if (error.response) {
                toast.error(error.data?.message || "Something went wrong on the server.");
            } else if (error.request) {
                toast.error("No response from the server. Please try again later.");
            } else {
                toast.error("An error occurred: " + error.message);
            }
        } finally {
            setLoading(false)
        }

    }




    useEffect(() => {
        getAllPosts()
    }, [])

    useEffect(() => {
        if (isCreatePost) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isCreatePost]);



    return loading ? <MainShimmer></MainShimmer> : (
        <div className='w-full relative my-5 bg-[#F2F4F7]'>
            <AddPostDummy></AddPostDummy>
            {
                (postData || []).map((post) => (
                    <div key={post?._id}>
                        <div className='max-w-[80%] md:max-w-[50%] lg:max-w-[50%] xl:max-w-[40%] mx-auto shadow-2xl p-3 mb-5 bg-[#FFFFFF] rounded-2xl'>
                            <div className='relative mb-2'>
                                <div className='absolute'>
                                    <div className='w-10 h-10'>
                                        <img
                                            className='w-full h-full object-cover rounded-full border'
                                            src={post?.creator?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="Profile"
                                        />
                                    </div>
                                </div>
                                <div className='py-1 pl-12 ml-1'>
                                    <Link to={`/profile/${post?.creator?._id}`}>
                                        <h1 className='text-xs md:text-sm xl:text-base font-bold hover:text-[#ff11a4]  cursor-pointer'>{post?.creator?.name}</h1>
                                    </Link>
                                    {post.createdAt && (
                                        <p className='text-xs text-gray-500 whitespace-nowrap'>
                                            {formatTimeAgo(post.createdAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className=''>
                                <div className='text-xs mb-1 text-[#454545] xl:text-sm'>
                                    <p>{post.description}</p>
                                </div>
                                <div className='w-full h-fit xl:text-sm'>
                                    <img className='overflow-hidden' src={post?.image} alt="" />
                                </div>
                            </div>
                            <div className='flex justify-between  items-center p-2 gap-2 border-b border-[#acabab]  mb-2'>
                                <div className='flex items-center gap-2'>

                                    <LikeButton post={post} ></LikeButton>

                                    <span className='text-sm cursor-pointer text-[#ADAFB1]'>
                                        {post?.likes ? <p className='hover:underline'>{post?.likes?.length}</p> : <p>No likes</p>}
                                    </span>
                                </div>
                                <div className='text-sm text-[#ADAFB1] hover:underline'>
                                    {post.comments ? <p>{post.comments.length} comments</p> : <p>0 Comments</p>}
                                </div>
                            </div>

                            <CommentComponent post={post}> </CommentComponent>

                        </div>
                    </div>
                ))
            }

            {
                isCreatePost && <AddPost></AddPost>
            }

        </div >
    )
}


export const LikeButton = ({ post }) => {
    const userData = useSelector((state) => state.user.userData);
    const token = localStorage.getItem("token");
    const dispatch = useDispatch();

    const currentPost = useSelector(state =>
        state.posts.postData.find(p => p._id === post._id) || post
    );
    const hasLiked = (currentPost?.likes || []).some((like) => like._id === userData._id);  //some check at least one item in the array passed the condition and return boolean 

    const [isliked, setIsLiked] = useState(hasLiked);

    const postLikesRef = useRef(
        debounce(async (id) => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/like/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                dispatch(updatePostLikes({
                    id,
                    likes: response.data?.updatedBlog?.likes
                }));
            } catch (error) {
                setIsLiked(prev => !prev);
            }
        }, 500)
    );

    const handleLikeClick = () => {
        setIsLiked(prev => !prev);
        postLikesRef.current(post._id);
    };

    return (
        <button onClick={handleLikeClick}>
            <BiLike className={`cursor-pointer w-10 h-5 xl:h-10 ${isliked ? "text-[#ff11a4]" : ""}`} />
        </button>
    );
};

export const CommentComponent = ({ post }) => {

    const [commentInput, setCommentInput] = useState("")


    const token = localStorage.getItem("token")
    const userData = useSelector((state) => state.user.userData);

    const dispatch = useDispatch()

    async function postComment(id) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${id}`, { comment: commentInput }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const data = response?.data
            setCommentInput("")
            toast.success(data?.message)

            dispatch(updatePostCommentsCount({
                id,
                comments: data?.updatedBlog?.comments
            }))

        } catch (error) {
            if (error.response) {
                toast.error(error.data?.message || "Something went wrong on the server.");
            } else if (error.request) {
                toast.error("No response from the server. Please try again later.");
            } else {
                toast.error("An error occurred: " + error.message);
            }
        }

    }

    return (
        <>
            <div className='relative w-full flex gap-2  justify-center'>
                <div className='w-11 h-10'>
                    <img
                        className='w-full h-full object-cover rounded-full border'
                        src={userData?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt="Profile"
                    />
                </div>
                <input
                    type="text"
                    className='w-full bg-[#F0F2F5] p-2 pr-10 rounded-2xl focus:outline-none'
                    onChange={(e) => setCommentInput(e.target.value)}
                    value={commentInput}
                    placeholder='write a commnet'
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            postComment(post?._id)
                        }
                    }}
                />
                <button
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xl 
                      ${commentInput === "" ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-gray-600"}`}
                    onClick={() => postComment(post?._id)}
                    disabled={commentInput === ""}
                >
                    <CiSignpostR1 className={`${commentInput === "" ? "text-gray-400" : "text-[#ff11a4]"}`} />
                </button>
            </div>
            <div className='p-2'>
                <DisplayComments post={post}  ></DisplayComments>
            </div>
        </>
    )
}

const DisplayComments = ({ post, comments = post?.comments }) => {


    const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentText, setEditedCommentText] = useState("");
    const [isReplayID, setisReplayID] = useState(false);
    const [replayInput, setReplayInput] = useState("");

    const token = localStorage.getItem("token")
    const userData = useSelector((state) => state?.user?.userData);
    const inputRef = useRef(null);
    const replayRef = useRef(null);

    const dispatch = useDispatch()


    const hasUserLikedComment = (comment) => {
        return comment?.likes?.some(like => like?._id === userData?._id);
    }

    async function deleteComment(commentID, postID) {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/blogs/deleteComment/${commentID}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data
            toast.success(data.message)

            dispatch(deletePostComment({
                commentID,
                postID
            }))

        } catch (error) {
            if (error.response) {
                toast.error(error.data?.message || "Something went wrong on the server.");
            } else if (error.request) {
                toast.error("No response from the server. Please try again later.");
            } else {
                toast.error("An error occurred: " + error.message);
            }
        }
    }

    async function editComment(commentID, postID) {
        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/blogs/editComment/${commentID}`, { comment: editedCommentText }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data
            toast.success(data.message)

            dispatch(editCommentData({
                commentID,
                postID,
                "comment": data?.comment?.comment
            }))
            setEditingCommentId(null)

        } catch (error) {
            if (error.response) {
                toast.error(error.data?.message || "Something went wrong on the server.");
            } else if (error.request) {
                toast.error("No response from the server. Please try again later.");
            } else {
                toast.error("An error occurred: " + error.message);
            }
        }
    }

    async function likeComment(commentID, postID) {

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/likeComment/${commentID}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response?.data


            dispatch(updateLikeInComment({
                postID,
                commentID,
                like: data.comment.likes
            }))

        } catch (error) {
            if (error.response) {
                toast.error(error.data?.message || "Something went wrong on the server.");
            } else if (error.request) {
                toast.error("No response from the server. Please try again later.");
            } else {
                toast.error("An error occurred: " + error.message);
            }
        }
    }

    async function postReplay(commentID, postID) {

        try {

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${commentID}/${postID}`, { replay: replayInput }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response?.data


            dispatch(addReplay({
                postID,
                commentID,
                comments: data?.updatedBlog?.comments
            }))

            setReplayInput("")

        } catch (error) {
            if (error.response) {
                toast.error(error.data?.message || "Something went wrong on the server.");
            } else if (error.request) {
                toast.error("No response from the server. Please try again later.");
            } else {
                toast.error("An error occurred: " + error.message);
            }
        }
    }

    function toggleCommentHamburger(commentId) {
        if (commentId) {
            setOpenCommentMenuId(prev => prev === commentId ? null : commentId);
        } else {
            setOpenCommentMenuId(prev => !prev)
        }
    }

    function toggleCommentReplay(commentID) {
        if (commentID) {
            setisReplayID((prev) => prev === commentID ? null : commentID)
        } else (
            setisReplayID((prev) => !prev)
        )

    }

    useEffect(() => {
        const handleClickOutsideMenu = (e) => {
            const menuBtns = document.querySelectorAll(".comment-menu");
            let isInsideAny = false;

            menuBtns.forEach(btn => {
                if (btn.contains(e.target)) {
                    isInsideAny = true;
                }
            });

            if (!isInsideAny) {
                setOpenCommentMenuId(null);
            }
        };

        if (openCommentMenuId) {
            document.addEventListener("mousedown", handleClickOutsideMenu);
        }

        return () => document.removeEventListener("mousedown", handleClickOutsideMenu);
    }, [openCommentMenuId]);



    useEffect(() => {
        function handleClickOutside(event) {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setEditingCommentId(null);  // Exit edit mode
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editingCommentId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (replayRef.current && !replayRef.current.contains(event.target)) {
                setisReplayID(null);  // Exit edit mode
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isReplayID]);


    return (
        <>
            {
                (comments || []).map((comment) => (
                    <div className='relative' key={comment._id}>
                        <div className='flex items-center gap-3 group' >
                            <div className='w-8 h-8'>
                                <Link to={`/profile/${comment?.creator?._id}`}>
                                    <img className='h-full w-full rounded-full object-cover' src={comment?.creator?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="" />
                                </Link>
                            </div>

                            <div className='flex mt-2 bg-[#F0F2F5] rounded-xl w-full px-2 py-1' ref={editingCommentId === comment._id ? inputRef : null}>
                                <div className='flex flex-col w-full'>
                                    <Link to={`/profile/${comment?.creator?._id}`}>
                                        <h1 className='text-sm'>{comment?.creator?.name}</h1>
                                    </Link>
                                    {
                                        editingCommentId === comment._id ? (
                                            <input
                                                className='w-full  text-xs text-[#424243] mb-1 px-2 py-1 rounded border border-gray-300 focus:outline-none bg-white'
                                                type="text"
                                                value={editedCommentText}
                                                onChange={(e) => setEditedCommentText(e.target.value)}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        editComment(comment._id, post._id)
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <p className=' flex justify-between text-xs text-[#424243] mb-1 px-2'>{comment?.comment}

                                                {
                                                    comment?.likes?.length > 0 &&
                                                    <span className='flex items-center gap-2 top-4 right-0'><GrLike className='text-[#ff11a4]' /> {comment?.likes?.length}</span>
                                                }
                                            </p>
                                        )
                                    }
                                </div>
                            </div>


                            <button
                                onClick={() => toggleCommentHamburger(comment._id)}
                                className='p-2 hover:bg-[#828282] rounded-full cursor-pointer xl:hidden xl:group-hover:block'
                            >
                                <HiDotsHorizontal />
                            </button>

                        </div>
                        <div className='relative flex gap-2 left-15'>
                            <button
                                className={`text-xs hover:underline cursor-pointer ${hasUserLikedComment(comment) ? "text-[#ff11a4]" : ""}`}
                                onClick={() => likeComment(comment._id, post._id)}
                            >
                                Like
                            </button>

                            <button onClick={() => toggleCommentReplay(comment._id)} className='text-xs hover:underline cursor-pointer'>Replay</button>

                            {
                                isReplayID === comment._id && (
                                    <div className="flex items-center gap-3 mt-2 ml-10" ref={isReplayID === comment._id ? replayRef : null}>
                                        <div className="w-8 h-8 flex-shrink-0">
                                            <img
                                                className="w-full h-full rounded-full object-cover"
                                                src={userData?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                                alt="Your profile"
                                            />
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                className="w-full bg-[#F0F2F5] p-2 pr-10 rounded-2xl focus:outline-none text-sm"
                                                type="text"
                                                placeholder="Write a reply..."
                                                onChange={(e) => setReplayInput(e.target.value)}
                                                value={replayInput}
                                                onKeyDown={(e) => e.key === 'Enter' && postReplay(comment._id, post._id) && toggleCommentReplay()}
                                            />
                                            <button
                                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                                                ${replayInput === "" ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-[#ff11a4] cursor-pointer"}`}
                                                onClick={() => postReplay(comment._id, post._id)}
                                                disabled={replayInput === ""}
                                            >
                                                <CiSignpostR1 className={`text-xl ${replayInput === "" ? "text-gray-400" : "text-[#ff11a4]"}`} />
                                            </button>


                                        </div>
                                    </div>
                                )
                            }

                        </div>

                        {
                            comment?.replies?.length > 0 && (
                                <div className='pl-10'>
                                    <DisplayComments post={post} comments={comment?.replies} ></DisplayComments>
                                </div>
                            )
                        }

                        {openCommentMenuId === comment._id && (

                            <div className='comment-menu'>
                                <div className='w-40 absolute z-10 flex flex-col left-[30%] top-10 bg-[#ffff] p-2 shadow rounded-xl'>
                                    <button className='w-full cursor-pointer text-left text-sm px-3 py-2 font-semibold hover:bg-[#F0F2F5]'>Hide Comment</button>
                                    <button className='w-full cursor-pointer text-left text-sm px-3 py-2 font-semibold hover:bg-[#F0F2F5]'>Report Comment</button>

                                    {
                                        userData?._id === comment?.creator?._id &&
                                        <button onClick={() => { setEditingCommentId(comment?._id), setEditedCommentText(comment?.comment), toggleCommentHamburger() }} className='w-full cursor-pointer text-left text-sm px-3 py-2 font-semibold hover:bg-[#F0F2F5]'>Edit Comment</button>

                                    }

                                    {
                                        (userData?._id === comment?.creator?._id || userData?._id === post?.creator?._id) ?
                                            <button onClick={() => { deleteComment(comment?._id, post?._id), toggleCommentHamburger() }} className='w-full cursor-pointer text-left text-sm px-3 py-2 font-semibold hover:bg-[#F0F2F5]'>Delete Comment</button>
                                            : null
                                    }

                                </div>
                            </div>
                        )}
                    </div>
                ))
            }

        </>
    )
}



export default Body

















