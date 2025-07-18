import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <motion.h1
        className="text-6xl md:text-8xl font-extrabold text-gray-800 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        404
      </motion.h1>

      <motion.p
        className="text-xl md:text-2xl text-gray-600 mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Oops! The page you're looking for doesn't exist.
      </motion.p>

      <motion.button
        onClick={() => navigate("/home")}
        className="bg-color text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all cursor-pointer"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        Home
      </motion.button>
    </div>
  );
}
