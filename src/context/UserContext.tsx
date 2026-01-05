import React, {createContext, useContext, useRef, useState, useEffect } from "react";
import Usuario from "../types/Usuario";
import { getUser } from "../controller/Usuario";

interface UserContextProps {
    user: Usuario | null;
    loading: boolean;
    error: string | null;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ email: string; children: React.ReactNode }> = ({email, children}) => {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetchedData = useRef(false);

    useEffect(() => {
        if (hasFetchedData.current) return; 
        hasFetchedData.current = true;

        const fetchUser = async (email: string) => {
            if (email) {
                try {
                    const res = await getUser(email)
                    setUser(res);
                } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Um erro inesperado ocorreu.');
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUser(email);
    }, [email]);

    return (
        <UserContext.Provider value={{ user, loading, error }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserContext = (): UserContextProps => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};