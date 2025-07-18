import { useRef, useState, useEffect } from 'react';
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../utils/Slices/userSlice'


const Nav = () => {

    const [isOpenHamburgur, setHamburgur] = useState(false);
    const userData = useSelector((state) => state.user.userData)
    const menuRef = useRef(null); // ref to menu
    const avatarRef = useRef(null);

    function handelHamburgur() {
        setHamburgur(!isOpenHamburgur)
    }



    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                avatarRef.current &&
                !avatarRef.current.contains(event.target)
            ) {
                setHamburgur(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <header className="w-full bg-white shadow-md px-4">
            <nav className="flex items-center justify-between py-4 md:py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Logo */}
                    <Link
                        to="/home"
                        className="flex items-center space-x-2 group"
                    >
                        <div className="w-10 h-10 p-1.5 rounded-lg bg-gradient-to-r from-[#ff11a4] to-[#ff6bae] group-hover:rotate-[15deg] transition-transform duration-300">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="hidden sm:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ff11a4] to-[#ff6bae]">
                            Unit
                        </span>
                    </Link>

                    {/* Search Bar */}
                    <Link
                        to="/search"
                        className="relative p-2 rounded-full hover:bg-gray-100 transition duration-200 group"
                        title="Search"
                    >
                        <FaSearch className="text-gray-600 text-lg group-hover:text-black" />
                        <span className="sr-only">Search</span>
                    </Link>
                </div>

                {/* Right Section: Profile Avatar */}
                <div className="relative">
                    <button
                        onClick={handelHamburgur}
                        ref={avatarRef}
                        className="flex items-center space-x-2 focus:outline-none group cursor-pointer"
                    >
                        <div className="relative">
                            <img
                                src={userData?.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                alt="User"
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-[#ff11a4] transition-all duration-200"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        </div>
                        <span className="hidden md:block font-medium text-gray-700 group-hover:text-[#ff11a4]">
                            {userData?.name || "User"}
                        </span>
                    </button>

                    {isOpenHamburgur && (
                        <div className="absolute right-0 mt-2 z-50" ref={menuRef}>
                            <HamburgerMenu userData={userData} onClose={handelHamburgur} />
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}





const HamburgerMenu = ({ userData, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch()

    function handleLogout() {
        dispatch(logOut());
        navigate("/")
    }

    return (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-md rounded-md p-4 z-50 ">
            <nav className="flex flex-col gap-3 font-semibold text-base">
                {userData ? (
                    <Link to={`/profile/${userData._id}`} onClick={onClose} className="hover:text-gray-700">Profile</Link>
                ) : (
                    <Link to="/signIn" onClick={onClose} className="hover:text-gray-700">Log In</Link>
                )}
                <button onClick={() => { handleLogout(), onClose() }} className="text-left hover:text-gray-700 cursor-pointer">Log Out</button>
            </nav>
        </div>
    );
}




export default Nav