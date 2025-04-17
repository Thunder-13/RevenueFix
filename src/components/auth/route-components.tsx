"use client"

import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({ Component }: { Component: () => JSX.Element }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    
    useEffect(() => {
        // Check if user is authenticated
        const authStatus = localStorage.getItem("isAuthenticated") === "true";
        setIsAuthenticated(authStatus);
    }, []);
    
    // Show loading state while checking authentication
    if (isAuthenticated === null) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    return isAuthenticated ? <Component /> : <Navigate to='/login' />;
};