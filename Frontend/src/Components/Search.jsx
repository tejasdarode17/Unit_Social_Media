import { useState } from 'react';
import { FaSearch } from "react-icons/fa";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSelector } from 'react-redux';




const Search = () => {
    const [userSearch, setUserSearch] = useState("");
    const [searchUserData, setSearchUserData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const userData = useSelector((state) => state.user.userData);
    const token = localStorage.getItem("token")


    if (!userData || !token) {
        return <Navigate to="/home" replace />;
    }


    async function searchUser() {
        if (!userSearch.trim()) {
            setSearchUserData([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/searchuser/${userSearch.trim()}`);
            setSearchUserData(response.data?.users || []);
        } catch (error) {
            setSearchUserData([]);
            toast.error(error.response?.data?.message || "Search failed");
        } finally {
            setIsSearching(false);
        }
    }

    return (
        <div className='w-full my-5'>
            <div className="w-[50%] relative mx-auto shadow">
                <input
                    type="text"
                    placeholder="Search for the User"
                    className="pl-10 pr-4 py-2 bg-[#F0F2F5] rounded-2xl w-[200px] sm:w-[200px] md:w-[250px] focus:outline-none text-sm"
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchUser()}
                    value={userSearch}
                />
                <FaSearch
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-Color text-sm cursor-pointer hover:text-[#ff11a4] transition-colors"
                    onClick={searchUser}
                />
            </div>

            {/* Loading State */}
            {isSearching && (
                <div className="text-center mt-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ff11a4]"></div>
                </div>
            )}


            {/* No Results State */}
            {!isSearching && searchUserData?.length === 0 && (
                <div className="text-center mt-8">
                    <h1 className="text-gray-500">No users found for "{userSearch}"</h1>
                    <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
            )}

            {!isSearching && searchUserData?.length > 0 && (
                <div className="max-w-md mx-auto mt-8 space-y-4">
                    {searchUserData.map((user) => (
                        <Link
                            to={`/profile/${user?._id}`}
                            key={user._id}
                            className="block relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="p-6 flex items-center space-x-4">
                                <div className="relative group">
                                    <img
                                        src={user?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                        alt={user.name}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-semibold text-gray-800 truncate">{user.name}</h2>
                                    <p className="text-sm text-gray-500 mt-1 truncate">
                                        @{user.username || user.name.replace(/\s+/g, '').toLowerCase()}
                                    </p>
                                </div>
                                <div
                                    onClick={(e) => e.stopPropagation()} // Prevent Link navigation when button is clicked
                                    className="z-10" // Ensure button stays above the Link
                                >
                                    <button className="px-4 py-2 bg-[#ff11a4] text-white rounded-lg text-sm font-medium hover:bg-[#e01090] transition-colors duration-200">
                                        View
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}


export default Search