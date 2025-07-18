import axios from 'axios';
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { updateUser } from '../../utils/Slices/userSlice';

const EditProfile = () => {

  const { id } = useParams()
  const userData = useSelector((state) => state.user.userData);
  const token = localStorage.getItem("token")
  const [userInput, setUserInput] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    image: null
  })

  const [loading, setLoading] = useState(false)

  if (!userData || !token) {
    return <Navigate to="/home" replace />;
  }


  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    if (userData) {
      setUserInput({
        name: userData.name || "",
        bio: userData.bio || "",
        profilePhoto: userData.profilePhoto || null
      });
    }
  }, [userData]);


  async function editUserData(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("name", userInput.name);
      formData.append("bio", userInput.bio);
      if (userInput.password) {
        formData.append("password", userInput.password);
      }
      formData.append("profilePhoto", userInput.profilePhoto);

      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = response?.data

      toast.success(data?.message)

      dispatch(updateUser(data.updatedUser))
      navigate(`/profile/${id}`)
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
    <div className="flex mt-5 flex-col sm:flex-row gap-8 items-start p-4 sm:p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Profile Picture Upload */}
      <div className="w-full sm:w-auto flex flex-col items-center">
        <label
          htmlFor="image"
          className="relative group cursor-pointer w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden hover:shadow-md transition-all duration-300"
        >
          {userInput.profilePhoto ? (
            <img
              className="w-full h-full object-cover"
              src={
                typeof userInput.profilePhoto === "string"
                  ? userInput.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  : URL.createObjectURL(userInput.profilePhoto)
              }
              alt="Profile preview"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ff11a4] to-[#ff6bae] flex items-center justify-center text-white">
              <span className="text-4xl font-bold">
                {userInput.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <span className="text-white font-medium text-sm">Change Photo</span>
          </div>
        </label>
        <input
          type="file"
          id="image"
          className="hidden"
          accept="image/*"
          onChange={(e) => setUserInput(prev => ({ ...prev, profilePhoto: e.target.files[0] }))}
        />

      </div>

      {/* Edit Form */}
      <form
        onSubmit={(e) => editUserData(e)}
        className="flex-1 w-full space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#ff11a4] focus:ring-2 focus:ring-[#ff11a4]/20 transition-all duration-200"
            type="text"
            value={userInput.name}
            onChange={(e) => setUserInput(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea
            className="w-full h-32 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#ff11a4] focus:ring-2 focus:ring-[#ff11a4]/20 transition-all duration-200 resize-none"
            value={userInput.bio}
            placeholder="Tell us about yourself..."
            onChange={(e) => setUserInput(prev => ({ ...prev, bio: e.target.value }))}
          />
        </div>

        {loading ? (
          <button
            className="w-full py-3 px-4 bg-[#ff11a4] hover:bg-[#e01090] text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
            disabled
          >
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </button>
        ) : (
          <button
            className="w-full py-3 px-4 bg-[#ff11a4] hover:bg-[#e01090] text-white font-medium rounded-lg transition-all duration-200 cursor-pointer"
            type="submit"
          >
            Save Changes
          </button>
        )}
      </form>
    </div>
  )
}

export default EditProfile
