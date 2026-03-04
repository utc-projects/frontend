import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set token in axios headers
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    const loadUser = async () => {
        if (token) {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data.user);

                // Fetch permissions
                try {
                    const permResponse = await api.get('/permissions/my-permissions');
                    setPermissions(permResponse.data.data);
                } catch (permErr) {
                    console.error('Failed to load permissions:', permErr);
                    setPermissions({ role: response.data.user.role, resources: {} });
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                setToken(null);
                setUser(null);
                setPermissions(null);
            }
        } else {
            setUser(null);
            setPermissions(null);
        }

        setLoading(false);
    };

    // Load user on mount and when token changes
    useEffect(() => {
        setLoading(true);
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        setToken(response.data.token);
        setUser(response.data.user);
        sessionStorage.setItem('justLoggedIn', 'true');
        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        setToken(response.data.token);
        setUser(response.data.user);
        sessionStorage.setItem('justLoggedIn', 'true');
        return response.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setPermissions(null);
    };

    const updateProfile = async (data) => {
        const response = await api.put('/auth/profile', data);
        setUser(response.data.user);
        return response.data;
    };

    const checkPermission = (resource, action) => {
        if (!user) return false;
        if (user.role === 'admin') return true;

        if (!permissions || !permissions.resources) return false;

        const resourcePerms = permissions.resources[resource];
        if (!resourcePerms) return false;

        return !!resourcePerms[action];
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLecturer: user?.role === 'lecturer',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        loadUser,
        updateProfile,
        permissions,
        checkPermission,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
