import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react'
import axios from 'axios';
import toast from 'react-hot-toast';
import { CiVideoOn } from "react-icons/ci";
import { IoIosImages } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { toggleCreatePost } from '../utils/Slices/postSlice';
import { IoMdCloudUpload } from 'react-icons/io';
import { addOnePost } from '../utils/Slices/postSlice';



export const AddPostDummy = () => {

    const userData = useSelector((state) => state.user.userData)
    const dispatch = useDispatch()

    return (
        <div className='relative w-[95%] sm:w-[90%] md:max-w-[50%] lg:max-w-[50%] xl:max-w-[40%] mx-auto bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md p-3 sm:p-4 mb-4 sm:mb-5 transition-all duration-200 hover:shadow-md sm:hover:shadow-lg'>
            <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-10 h-10 sm:w-12 sm:h-12'>
                    <Link to={`/profile/${userData._id}`} className="group">
                        <img
                            className='w-full h-full object-cover rounded-full border border-gray-200 sm:border-2 group-hover:border-[#ff11a4] transition-all duration-200'
                            src={userData?.profilePhoto || '"https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                            alt="Profile"
                        />
                    </Link>
                </div>
                <div className='flex-1'>
                    <input
                        onClick={() => dispatch(toggleCreatePost())}
                        className='w-full text-sm sm:text-base bg-[#F0F2F5] px-3 sm:px-4 py-2 sm:py-3 rounded-full sm:rounded-xl focus:outline-none cursor-pointer placeholder-gray-500 transition-all duration-200 hover:bg-gray-100 focus:ring-1 sm:focus:ring-2 focus:ring-[#ff11a4]/30'
                        type="text"
                        placeholder={`What's on your mind, ${userData?.name.split(" ")[0]}?`}
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 space-x-1">
                <button
                    onClick={() => {
                        toast.error("This feature is currently unavailable", {
                            position: "top-center",
                            duration: 1000,
                        });
                    }}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 hover:bg-gray-50 rounded-lg py-1 sm:py-2 px-1 cursor-pointer transition-all duration-200 group"
                >
                    <div className="p-1 sm:p-2 rounded-full bg-red-50 group-hover:bg-red-100 transition">
                        <CiVideoOn className="text-red-600 text-lg sm:text-xl md:text-2xl" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Live</span>
                </button>

                <button
                    onClick={() => dispatch(toggleCreatePost())}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 hover:bg-gray-50 rounded-lg py-1 sm:py-2 px-1 cursor-pointer transition-all duration-200 group"
                >
                    <div className="p-1 sm:p-2 rounded-full bg-green-50 group-hover:bg-green-100 transition">
                        <IoIosImages className="text-green-600 text-lg sm:text-xl md:text-2xl" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Photo</span>
                </button>
            </div>
        </div>
    )
}



export const AddPost = () => {

    const [userInputPost, setUserInputPostData] = useState({
        description: "",
        image: null
    })
    const [loading, setLoading] = useState(false)

    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData"))

    const dispatch = useDispatch()


    useEffect(() => {
        return () => {
            if (userInputPost.image) {
                URL.revokeObjectURL(userInputPost.image);
            }
        };
    }, [userInputPost.image]);

    async function createPost() {
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append("description", userInputPost.description);
            formData.append("image", userInputPost.image);

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response?.data;

            toast.success(data?.message);

            setUserInputPostData({
                description: "",
                image: null,
            });

            dispatch(toggleCreatePost(false))
            
            dispatch(addOnePost(data?.blog))
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

    return (
        <>
            {/* BACKDROP */}
            <div className="fixed inset-0 bg-white/70 bg-opacity-20 z-40" onClick={() => dispatch(toggleCreatePost(false))} ></div>

            <div className="fixed left-1/2 top-[10%] -translate-x-1/2 z-50 w-[90%] md:w-[60%] lg:w-[40%] xl:w-[35%] p-4 shadow-2xl bg-[#ffff] rounded-2xl flex flex-col">
                <div className='relative flex items-center justify-center py-2 border-b border-[#E7E9EB]'>
                    <h1 className='text-lg font-semibold'>Create Post</h1>
                    <button onClick={() => dispatch(toggleCreatePost())} className='absolute right-0 cursor-pointer'>
                        <IoMdClose className='bg-gray-400 rounded-full text-black/50 xl:text-2xl hover:bg-gray-500' />
                    </button>
                </div>

                <div className='flex items-center gap-3 p-4'>
                    <div className='w-10 h-10'>
                        <img
                            className='w-full h-full object-cover rounded-full border border-gray-200'
                            src={userData?.profilePhoto || '"https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                            alt="Profile"
                        />
                    </div>
                    <p className='font-medium text-gray-800 truncate'>{userData?.name}</p>
                </div>
                <div className='w-full flex flex-col gap-2'>
                    <input
                        className='p-4 focus:outline-none'
                        value={userInputPost.description}
                        onChange={(e) =>
                            setUserInputPostData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        type="text"
                        placeholder="What's on your Mind ..."
                    />
                    <div className='w-full flex justify-center'>
                        <label htmlFor="image" className='block w-full bg-[#EBECEE] rounded-2xl border border-[#E7E9EB] cursor-pointer'>
                            {
                                userInputPost.image ? (
                                    <div className='overflow-x-hidden overflow-y-auto h-[50vh] rounded-xl p-4'>
                                        <img
                                            src={URL.createObjectURL(userInputPost.image)}
                                            alt="Preview"
                                            className='w-full object-contain rounded-lg'
                                        />
                                    </div>
                                ) : (
                                    <div className='w-full h-70 flex flex-col justify-center items-center'>
                                        <IoMdCloudUpload className='text-3xl mb-2' /> {/* Using IoMdCloudUpload instead */}
                                        <p>Click to upload photo</p>
                                        <p className='text-xs mt-1'>PNG, JPG</p>
                                    </div>
                                )
                            }
                        </label>
                        <input
                            id='image'
                            className='hidden'
                            accept='.png, .jpeg, .jpg'
                            onChange={(e) =>
                                setUserInputPostData((prev) => ({ ...prev, image: e.target.files[0] }))
                            }
                            type="file"
                        />
                    </div>
                </div>
                <div className='flex justify-end p-2'>
                    {

                        loading ? (
                            <button
                                className='w-20  p-2 mt-2 mx-auto rounded-2xl border cursor-pointer text-white bg-color'
                            >
                                <span className="create-post"></span>
                            </button>

                        ) : (

                            <button
                                className={`w-20 p-2 mt-2 mx-auto rounded-2xl border text-white ${userInputPost.description === "" && !userInputPost.image
                                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                                    : "bg-color cursor-pointer"
                                    }`}
                                onClick={
                                    userInputPost.description === "" && !userInputPost.image
                                        ? null
                                        : createPost
                                }
                                disabled={userInputPost.description === "" && !userInputPost.image}
                            >
                                Post
                            </button>

                        )

                    }
                </div>
            </div>
        </>
    )
}