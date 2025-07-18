import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

import { addUser } from '../utils/Slices/userSlice';
import googleAuth from '../utils/firebase';

export const useGoogleSignIn = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const handleGoogleSignIn = useCallback(async () => {
        setLoading(true);
        try {
            const { user } = await googleAuth();
            const idToken = await user.getIdToken();

            const { data } = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/google-auth/`,
                { idToken }
            );

            dispatch(addUser(data.user));
            localStorage.setItem('token', data.token);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                toast.error(err.response.data?.message ?? 'Something went wrong on the server.');
            } else if (axios.isAxiosError(err) && err.request) {
                toast.error('No response from the server. Please try again later.');
            } else {
                toast.error('An error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    return { handleGoogleSignIn, loading };
};
