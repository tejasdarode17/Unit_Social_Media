import { useState, } from 'react'
import axios from "axios"
import { Navigate, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../../utils/Slices/userSlice';
import { useGoogleSignIn } from '../../Hooks/useGoogleSignIn';


const Login = () => {

    const userData = useSelector((state) => state.user.userData) || null
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    })
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { handleGoogleSignIn, loading: googleLoading } = useGoogleSignIn();

    if (userData) {
        return <Navigate to="/home" replace />;
    }

    const onGoogleClick = async () => {
        await handleGoogleSignIn();
    }

    if (googleLoading) navigate('/verify');

    async function handelUserLogin() {

        try {
            setLoading(true)
            if (!loginData.email || !loginData.password) {
                return alert("Please fill the data")
            }
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, loginData)
            const data = await response.data

            dispatch(addUser(data?.user || null))
            localStorage.setItem("token", data?.token || null)
            toast.success(data?.message)

            setLoginData({
                email: "",
                password: ""
            })

            navigate("/home")

        } catch (error) {
            if (error.response) {
                toast.error(error.response?.data?.message || "Login failed.");
                setLoginData({
                    email: "",
                    password: ""
                })

            } else if (error.request) {
                toast.error("No response from the server. Please try again later.");
                setLoginData({
                    email: "",
                    password: ""
                })

            } else {
                toast.error("An error occurred: " + error.message);
                setLoginData({
                    email: "",
                    password: ""
                })

            }
        } finally {
            setLoading(false)
        }

    }


    return (
        <div className='w-full bg-[#F2F4F7] min-h-screen flex justify-center items-center'>
            <div className='flex flex-col w-full md:w-[50%] lg:w-[50%] xl:w-[30%] xl:shadow-2xl rounded-2xl p-6'>

                {/* Logo */}
                <div className='w-full flex justify-center items-center mb-6'>
                    <img className='w-50 h-auto logo' src='/logo.png' alt="Logo" />
                </div>

                {/* Form */}
                <div className='flex flex-col gap-4'>
                    <input
                        value={loginData.email}
                        onChange={(e) =>
                            setLoginData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className='border p-4 rounded-2xl'
                        type="text"
                        placeholder='Please Enter your Email'
                    />
                    <input
                        value={loginData.password}
                        onChange={(e) =>
                            setLoginData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        className='border p-4 rounded-2xl'
                        type="password"
                        placeholder='Please Enter your Password'
                    />

                    {/* Buttons */}
                    <div className='flex flex-col  gap-4 mt-4'>


                        {
                            loading ? (
                                <button
                                    className='w-full p-3 rounded-2xl border cursor-pointer text-white bg-[#ff11a4] hover:scale-95 duration-100'
                                >
                                    <span className="create-post"></span>
                                </button>
                            ) : (

                                <button
                                    onClick={handelUserLogin}
                                    className='w-full p-3 rounded-2xl border cursor-pointer text-white bg-[#ff11a4] hover:scale-95 duration-100'
                                >
                                    Log In
                                </button>
                            )
                        }
                        <p className='text-center'>or</p>

                        <button
                            onClick={onGoogleClick}
                            className='w-full flex items-center justify-center gap-3 p-3 rounded-2xl border cursor-pointer hover:scale-95 duration-100'
                        >
                            <img src="/google.png" alt="Google" className='w-6 h-6 logo' />
                            Continue with Google
                        </button>

                    </div>


                    <div>
                        <Link to={"/signup"} className='w-full flex justify-center mt-5'>
                            <button className='cursor-pointer hover:underline'>
                                Don't have an Have an <span className='text-[#ff11a4]'>Account</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Login


