import axios from "axios";
import { AddPost, AddPostDummy } from "../AddPost";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { LikeButton, CommentComponent } from "../Body";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { editPostData, deletePostData } from "../../utils/Slices/postSlice";
import { formatTimeAgo } from "../../utils/formatDate"



const LoggedInUserProfile = () => {
    const loggedInuserData = useSelector((state) => state.user.userData);  //this is from the localstorage wich only update once we login 
    const isCreatePost = useSelector((state) => state.posts.isCreatePost);
    const token = localStorage.getItem("token")

    const postData = useSelector((state) => state.posts.postData);
    const loggedInUserPost = (postData || []).filter(
        (post) => post.creator?._id === loggedInuserData?._id
    );
    const [openPostHamburger, setOpenPostHamburgur] = useState(false);
    const [openEditPostHamburger, setOpenEditPostHamburgur] = useState(false);


    function toggleOpenPostHamburgurMenu(postID) {
        if (postID) {
            setOpenPostHamburgur((prev) => (prev === postID ? null : postID));
        } else {
            setOpenPostHamburgur((prev) => !prev);
        }
    }

    function toggleOpenEditPostHamburgurMenu(post) {
        if (post) {
            setOpenEditPostHamburgur((prev) => (prev === post._id ? null : post._id));
        } else {
            setOpenEditPostHamburgur((prev) => !prev);
        }
    }


    if (!loggedInuserData || !token) {
        return <Navigate to="/home" replace />;
    }



    return (
        <>
            <UserDetails loggedInuserData={loggedInuserData} ></UserDetails>
            <div className="mx-auto my-5">
                <AddPostDummy></AddPostDummy>
                {isCreatePost && <AddPost></AddPost>}
                {postData?.length === 0 ? (
                    <h1 className="text-center text-gray-400">No Post</h1>
                ) : (
                    loggedInUserPost.map((post) => (
                        <div key={post?._id}>
                            <div className="max-w-[80%] md:max-w-[50%] lg:max-w-[50%] xl:max-w-[40%] mx-auto shadow-2xl p-3 mb-5 bg-[#FFFFFF] rounded-2xl">
                                <div className="relative flex items-center justify-between mb-2">
                                    <div>
                                        <div className="absolute">
                                            <div className="w-10 h-10">

                                                {
                                                    loggedInuserData?.profilePhoto ? (
                                                        <img
                                                            className="w-full h-full object-cover rounded-full border"
                                                            src={loggedInuserData?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                                            alt="Profile"
                                                        />
                                                    ) : (
                                                        <img src="https://i.sstatic.net/MeQxk.png" className="image-shimmer" />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="py-1 pl-12 ml-1">
                                            <h1 className="text-xs md:text-sm xl:text-base font-bold hover:text-[#ff11a4]  cursor-pointer">
                                                {post?.creator?.name}
                                            </h1>
                                            {post.createdAt && (
                                                <p className='text-xs text-gray-500 whitespace-nowrap'>
                                                    {formatTimeAgo(post.createdAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-4">
                                        <button
                                            onClick={() => toggleOpenPostHamburgurMenu(post._id)}
                                            className="p-2 hover:bg-[#828282] rounded-full cursor-pointer"
                                        >
                                            <HiDotsHorizontal />
                                        </button>
                                    </div>
                                    {openPostHamburger == post._id && (
                                        <HamburgurForPost
                                            toggleOpenEditPostHamburgurMenu={toggleOpenEditPostHamburgurMenu}
                                            toggleOpenPostHamburgurMenu={toggleOpenPostHamburgurMenu}
                                            loggedInuserData={loggedInuserData}
                                            post={post}
                                        >
                                        </HamburgurForPost>
                                    )}
                                </div>
                                <div className="">
                                    <div className="text-xs mb-2 text-[#454545] xl:text-sm">
                                        <p>{post.description}</p>
                                    </div>
                                    <div className="w-full h-fit xl:text-sm">
                                        <img className="overflow-hidden" src={post?.image} alt="" />
                                    </div>
                                </div>
                                <div className="flex justify-between  items-center p-2 gap-2 border-b border-[#acabab]  mb-2">
                                    <div className="flex items-center gap-2">
                                        <LikeButton post={post}></LikeButton>
                                        <span className="text-sm cursor-pointer text-[#ADAFB1]">
                                            {post?.likes ? (
                                                <p className="hover:underline">{post?.likes?.length}</p>
                                            ) : (
                                                <p>No likes</p>
                                            )}
                                        </span>
                                    </div>
                                    <div className="text-sm text-[#ADAFB1] hover:underline">
                                        {post.comments ? <p>{post.comments.length} comments</p> : <p>0 Comments</p>}
                                    </div>
                                </div>

                                <CommentComponent post={post}> </CommentComponent>

                                {openEditPostHamburger === post._id && (
                                    <EditLoginUserPost
                                        toggleOpenEditPostHamburgurMenu={toggleOpenEditPostHamburgurMenu}
                                        toggleOpenPostHamburgurMenu={toggleOpenPostHamburgurMenu}
                                        loggedInuserData={loggedInuserData}
                                        post={post}

                                    >
                                    </EditLoginUserPost>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};





const HamburgurForPost = ({ toggleOpenEditPostHamburgurMenu, toggleOpenPostHamburgurMenu, loggedInuserData, post }) => {

    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false)

    const dropdownRef = useRef(null);
    const dispatch = useDispatch()

    async function deletePost(post) {

        try {
            setLoading(true)
            const id = post._id
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data
            toast.success(data.message)
            dispatch(deletePostData({
                id
            }))

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
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                toggleOpenPostHamburgurMenu(null);  // this closes the menu
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <>
            <div ref={dropdownRef} className="w-50 h-50 overflow-x-hidden overflow-y-auto rounded bg-[#ffff] absolute top-10 right-5 shadow text-left font-semibold p-2">
                <button
                    onClick={() => { toggleOpenPostHamburgurMenu(), toggleOpenEditPostHamburgurMenu(post) }}
                    className=" w-full h-10 text-left rounded hover:bg-[#F2F2F2] cursor-pointer p-2"
                >
                    Edit Post
                </button>
                {
                    loading ? (
                        <button className="w-full h-10  rounded  bg-[#797474] text-white cursor-pointer p-2">
                            <span className="create-post"></span>
                        </button>

                    ) : (
                        <button onClick={() => deletePost(post)} className=" w-full h-10 text-left rounded hover:bg-[#F2F2F2] cursor-pointer p-2">
                            Delete Post
                        </button>
                    )
                }
                <button onClick={() => toast.success("😁😁😁")} className=" w-full h-10 text-left rounded hover:bg-[#F2F2F2] cursor-pointer p-2">
                    Save Post
                </button>
                <button onClick={() => toast.success("😁😁😁")} className=" w-full h-10 text-left rounded hover:bg-[#F2F2F2] cursor-pointer p-2">
                    Pin Post
                </button>
                <button onClick={() => toast.success("😁😁😁")} className=" w-full h-10 text-left rounded hover:bg-[#F2F2F2] cursor-pointer p-2">
                    Hide Post
                </button>

            </div>
        </>
    )
}

const EditLoginUserPost = ({ toggleOpenEditPostHamburgurMenu, toggleOpenPostHamburgurMenu, loggedInuserData, post }) => {

    const token = localStorage.getItem("token");
    const [userInput, setUserInput] = useState({
        description: "",
        image: null,
    });

    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        if (post) {
            setUserInput({
                description: post.description || "",
                image: post.image || null,
            });
        }
    }, [post]);

    async function editPost(id) {

        try {
            setLoading(true)
            const formData = new FormData();
            formData.append("description", userInput.description);
            formData.append("image", userInput.image);

            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`, formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = response?.data
            toast.success("Post Updated Sucessfully");

            dispatch(editPostData({
                id,
                description: data.blogs.description,
                image: data.blogs.image
            }))

            toggleOpenEditPostHamburgurMenu()
            toggleOpenPostHamburgurMenu()
            setLoading(false)

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

    function removeExistingImage(e) {
        e.preventDefault();
        setUserInput((prev) => ({ ...prev, image: null }));
    }


    return (
        <>
            <div
                className="fixed inset-0 bg-white/50 cursor-pointer z-40"
                onClick={() => {
                    toggleOpenEditPostHamburgurMenu(),
                        toggleOpenPostHamburgurMenu();
                }}
            ></div>
            <div className="fixed left-1/2 top-[10%] -translate-x-1/2 z-50 w-[90%] md:w-[60%] lg:w-[40%] xl:w-[35%] p-4 shadow-2xl bg-[#ffff] rounded-2xl flex flex-col">
                <div className="relative flex items-center justify-center py-2 border-b border-[#E7E9EB]">
                    <h1 className="text-lg font-semibold">Edit Post</h1>
                    <button
                        onClick={toggleOpenEditPostHamburgurMenu}
                        className="absolute right-0 cursor-pointer"
                    >
                        <IoMdClose className="bg-gray-400 rounded-full text-black/50 xl:text-2xl hover:bg-gray-500" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 my-2 ">
                        <img
                            className=" w-[100%] h-[100%] rounded-full object-cover "
                            src={loggedInuserData?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                            alt=""
                        />
                    </div>
                    <div>
                        <p>{loggedInuserData?.name}</p>
                    </div>
                </div>

                <div>
                    <div>
                        <input
                            className="w-full p-2 rounded focus:outline-none"
                            type="text"
                            value={userInput.description}
                            onChange={(e) =>
                                setUserInput((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="">
                        <label
                            htmlFor="image"
                            className="block cursor-pointer w-full"
                        >
                            {userInput.image ? (
                                <div className="relative overflow-x-hidden overflow-y-auto h-[50vh] rounded-xl p-4">
                                    <img
                                        src={
                                            typeof userInput.image === "string"
                                                ? userInput.image
                                                : URL.createObjectURL(userInput.image)
                                        }
                                        alt="preview"
                                    />
                                    <IoMdClose
                                        onClick={(e) => removeExistingImage(e)}
                                        className="absolute right-5 top-5 bg-gray-400 rounded-full text-black/50 xl:text-2xl hover:bg-gray-500"
                                    />
                                </div>
                            ) : (
                                <div className="h-[40vh] flex justify-center items-center">
                                    <h1>Please Uplaod image</h1>
                                </div>
                            )}
                        </label>
                        <input
                            onChange={(e) =>
                                setUserInput((prev) => ({
                                    ...prev,
                                    image: e.target.files[0],
                                }))
                            }
                            className="hidden"
                            id="image"
                            type="file"
                        />
                    </div>
                </div>
                <div className="w-full my-2 px-3 rounded text-center">
                    {
                        loading ? (
                            <button
                                className='w-20  p-2 mt-2 mx-auto rounded-2xl border cursor-pointer text-white bg-color'
                            >
                                <span className="create-post"></span>
                            </button>
                        ) : (
                            <button onClick={() => editPost(post._id)} className="w-full bg-[#ff11a4] text-[#fff] rounded p-2 cursor-pointer">
                                Save
                            </button>

                        )
                    }
                </div>
            </div >
        </>
    )
}


const UserDetails = ({ loggedInuserData }) => {
    return (
        <div className="w-full flex flex-col items-center md:flex md:flex-row md:justify-center md:items-start md:gap-10 my-10 mx-auto">

            <div className="w-50 h-50">
                <img className="w-full h-full object-cover rounded-full" src={loggedInuserData?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                } alt="" />
            </div>
            <div className="">
                <div className="flex gap-2 my-5 justify-center md:justify-start">
                    <Link to={`/profile/edit/${loggedInuserData._id}`}>
                        <button className="text-sm bg-[#D6D9DD] rounded px-2 py-1 mt-1 hover:bg-[#969a9f] cursor-pointer ">Edit Profile</button>
                    </Link>

                </div>
                <div className="flex justify-center gap-6 text-sm md:text-base text-gray-700">
                    <p><span className="font-semibold">{loggedInuserData?.blogs?.length}</span> posts</p>
                    <p><span className="font-semibold">{loggedInuserData?.followers?.length}</span> followers</p>
                    <p><span className="font-semibold">{loggedInuserData?.following?.length}</span> following</p>
                </div>
                <p className="mt-3 text-sm text-gray-600 max-w-50 whitespace-pre-line">
                    {loggedInuserData?.bio}
                </p>
            </div>
        </div>
    )
}


export default LoggedInUserProfile;
