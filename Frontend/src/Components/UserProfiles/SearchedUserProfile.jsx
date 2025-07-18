import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import LoggedInUserProfile from "./LoggedInUserProfile"
import { Navigate } from "react-router-dom"
import { LikeButton, CommentComponent } from "../Body"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { formatTimeAgo } from "../../utils/formatDate"




const SearchedUserProfile = () => {

  const [searchedUserData, setSearchedUserData] = useState([])
  const [followData, setFollowData] = useState({})
  const loggedInuserData = JSON.parse(localStorage.getItem("userData"))
  const { id } = useParams()

  const postData = useSelector((state) => state.posts.postData)
  const searchUserPosts = postData.filter((post) => post?.creator?._id === id);
  const userData = useSelector((state) => state.user.userData);
  const token = localStorage.getItem("token")


  if (!userData || !token) {
    return <Navigate to="/home" replace />;
  }




  async function getSearchedUser() {

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`)
      const data = response?.data
      setSearchedUserData(data)

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

  useEffect(() => {
    getSearchedUser()
  }, [id])




  const followUser = async (userToFollowID) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/follow/${userToFollowID}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data
      toast.success(data?.message)
      setFollowData(data)

    } catch (error) {
      if (error.response) {
        toast.error(error.data?.message || "Something went wrong on the server.");
      } else if (error.request) {
        toast.error("No response from the server. Please try again later.");
      } else {
        toast.error("An error occurred: " + error.message);
      }
    }
  };


  useEffect(() => {
    if (!followData) return;

    setSearchedUserData((prev) => {
      if (!prev || !prev.user) return prev;

      const isFollowing = prev.user.followers.some(f => f._id === userData._id);

      let updatedFollowers;
      if (isFollowing) {
        updatedFollowers = prev.user.followers.filter(f => f._id !== userData._id);
      } else {
        updatedFollowers = [...prev.user.followers, { _id: userData._id }];
      }

      return {
        ...prev,
        user: {
          ...prev.user,
          followers: updatedFollowers
        }
      };
    });
  }, [followData]);


  return (
    <div className="w-full">
      {loggedInuserData?._id === searchedUserData?.user?._id ? (
        <LoggedInUserProfile />
      ) : (
        <>
          <div className="w-full flex flex-col items-center md:flex md:flex-row md:justify-center md:items-start md:gap-10 my-10 mx-auto">

            <div className="w-50 h-50">
              <img className="w-full h-full object-cover rounded-full" src={searchedUserData?.user?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              } alt="" />
            </div>
            <div className="">
              <div className="flex justify-center gap-2 my-5">
                <p className="text-xl md:text-2xl font-semibold">{searchedUserData?.user?.name}</p>
                <button onClick={() => { followUser(searchedUserData?.user._id) }} className="h-8 px-4 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100  cursor-pointer hover:scale-90 duration-100">

                  {
                    (searchedUserData?.user?.followers || [])
                      .map(f => f._id?.toString())
                      .includes(userData?._id?.toString())
                      ? "following"
                      : "follow"
                  }
                </button>
              </div>
              <div className="flex justify-center gap-6 text-sm md:text-base text-gray-700">
                <p><span className="font-semibold">{searchUserPosts?.length}</span> posts</p>
                <p><span className="font-semibold">{searchedUserData?.user?.followers?.length}</span> followers</p>
                <p><span className="font-semibold">{searchedUserData?.user?.following?.length}</span> following</p>
              </div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
                {searchedUserData?.user?.bio}
              </p>
            </div>
          </div>

          {searchedUserData?.user?.blogs?.length === 0 ? (
            <h1 className="flex justify-center">No Posts</h1>
          ) : (
            searchUserPosts.map((post) => (
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
                    <div className='py-1 pl-12 ml-1 xl:gap-3'>
                      <h1 className='text-xs md:text-sm xl:text-base font-bold hover:text-[#ff11a4] cursor-pointer'>{post?.creator?.name}</h1>
                      {post.createdAt && (
                        <p className='text-xs text-gray-500 whitespace-nowrap'>
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className=''>
                    <div className='text-xs mb-2 text-[#454545] xl:text-sm'>
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
                    <div className='text-sm text-[#ADAFB1] hover:underline' >
                      {post.comments ? <p>{post.comments.length} comments</p> : <p>0 Comments</p>}
                    </div>
                  </div>

                  <CommentComponent post={post}> </CommentComponent>

                </div>
              </div>
            )
            )
          )}

        </>
      )}
    </div>
  );
}

export default SearchedUserProfile

