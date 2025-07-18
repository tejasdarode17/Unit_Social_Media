import axios from "axios";
import { useEffect } from "react";
import { useDispatch , useSelector} from "react-redux";
import { useNavigate, useParams ,Navigate} from "react-router-dom"
import { addUser } from "../../utils/Slices/userSlice";
import toast from "react-hot-toast";

const Verification = () => {

    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch()

    if (!token) return;
    const userData = useSelector((state) => state.user.userData) || null
    
    if (userData) {
        return <Navigate to="/home" replace />;
    }

    async function verifyEmail() {


        //mail me token bheja hai backend me jabtak user click nahi karega tab tak is page pe nahi ayege apan 
        //is page pe ate hi wohi token wapis bhejna hai aur phir usi token se user ki info niklegi aur is niche ki api se apne ko milegi 
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verify-email/${token}`);

            const data = response?.data



            localStorage.setItem("token", data?.token)
            dispatch(addUser(data?.user))
            navigate("/")

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
        verifyEmail()
    }, [token])


    return (
        <div className="w-screen h-screen bg-black text-white flex justify-center items-center">
            <p>Verifying Please Wait............. !</p>
        </div>
    )
}

export default Verification
