import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

export const useNotifications = () => {
    const { user } = useSelector((state) => state.auth);
    const token = sessionStorage.getItem('token');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user && token) {
            const fetchUnreadCount = async () => {
                try {
                    const res = await axios.get('http://localhost:5000/api/users/notifications/unread-count', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.success) {
                        setUnreadCount(res.data.count);
                    }
                } catch (error) {
                    console.error('Failed to fetch notifications');
                }
            };
            
            fetchUnreadCount();
            
            const interval = setInterval(fetchUnreadCount, 60000); // 1 minute
            return () => clearInterval(interval);
        }
    }, [user, token]);

    return { unreadCount };
};
