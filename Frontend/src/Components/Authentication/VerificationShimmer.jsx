import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const VerificationShimmer = () => {
  const userData = useSelector((state) => state.user.userData) || null;

  if (userData) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col justify-center items-center">
      <motion.div
        className="text-lg md:text-xl font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        Verifying... Please Wait
      </motion.div>

      <motion.div
        className="mt-4 w-32 h-1 bg-white rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
};

export default VerificationShimmer;
