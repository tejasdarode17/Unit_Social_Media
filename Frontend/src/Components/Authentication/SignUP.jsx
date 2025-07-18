import { useState , useEffect} from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGoogleSignIn } from '../../Hooks/useGoogleSignIn';

const SignUP = () => {

    const userData = useSelector((state) => state.user.userData) || null
    const [userSignInData, setUserSignInData] = useState({
        name: "",
        email: "",
        password: "",
    })
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();


    const { handleGoogleSignIn, googleLoding } = useGoogleSignIn();


    if (userData) {
        return <Navigate to="/home" replace />;
    }


    useEffect(() => {
        if (googleLoding) {
            navigate("/verify");
        }
    }, [googleLoding, navigate]);

    async function handelUserSignIN() {
        try {
            setLoading(true)

            if (!userSignInData.email || !userSignInData.name || !userSignInData.password) {
                return toast.error("Please fill all fields");
            }

            if (!/^\S+@\S+\.\S+$/.test(userSignInData.email)) {
                toast.error("Please enter a valid email address");
                return;
            }

            if (userSignInData.password.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
            }


            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, userSignInData);
            const data = response?.data
            toast.success(data?.message)
            setUserSignInData("");
            navigate("/verify")

        } catch (error) {
            toast.error("Google Sign In Failed")
        } finally {
            setLoading(false)
        }
    }


    const onGoogleClick = async () => {
        await handleGoogleSignIn();
    }


    return (
        <div className='w-full bg-[#F2F4F7] min-h-screen flex justify-center items-center'>
            <div className='flex flex-col w-full md:w-[50%] lg:w-[50%] xl:w-[30%] xl:shadow-2xl rounded-2xl p-6'>


                <div className='w-full flex justify-center items-center mb-6'>
                    <img className='w-50 h-auto logo' src="logo.png" alt="Logo" />
                </div>


                <div className='text-xl font-bold text-center mb-6'>
                    <h1>Create an Account</h1>
                </div>


                <div className='flex flex-col gap-4'>
                    <input
                        onChange={(e) =>
                            setUserSignInData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className='border p-3 rounded-2xl'
                        type="text"
                        placeholder='Please Enter your Name'
                    />
                    <input
                        onChange={(e) =>
                            setUserSignInData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className='border p-3 rounded-2xl'
                        type="text"
                        placeholder='Please Enter your Email'
                    />
                    <input
                        onChange={(e) =>
                            setUserSignInData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        className='border p-3 rounded-2xl'
                        type="password"
                        placeholder='Please Enter your Password'
                    />
                </div>


                <div className='flex flex-col gap-4 mt-6'>
                    {
                        loading ? (
                            <button
                                className='w-full p-3 rounded-2xl border cursor-pointer text-white bg-[#ff11a4] hover:scale-95 duration-100'
                            >
                                <span className="create-post"></span>
                            </button>
                        ) : (

                            <button
                                onClick={handelUserSignIN}
                                className='w-full p-3 rounded-2xl border cursor-pointer text-white bg-[#ff11a4] hover:scale-95 duration-100'
                            >
                                Sign In
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
                    <Link to={"/"} className='w-full flex justify-center mt-5'>
                        <button className='cursor-pointer hover:underline'>
                            Already Have an <span className='text-[#ff11a4]'>Account</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SignUP


