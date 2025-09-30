
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    const storedUserProfile = localStorage.getItem("userProfile");
    
    if (token) {
      setUser({ token });
      setIsAdmin(adminStatus);
      
      if (storedUserProfile) {
        setUserProfile(JSON.parse(storedUserProfile));
      }
    }
  }, []);

  const login = (tokenOrOptions, navigate, adminStatus = false, name = "", email = "") => {
    let token, profile, isAdmin;
    
    // Handle both object and parameter-based calls
    if (typeof tokenOrOptions === 'object' && tokenOrOptions !== null) {
      // New format: login({ token, name, email, adminStatus }, navigate)
      const options = tokenOrOptions;
      token = options.token;
      name = options.name || name;
      email = options.email || email;
      isAdmin = options.adminStatus || adminStatus;
    } else {
      // Old format: login(token, navigate, adminStatus, name, email)
      token = tokenOrOptions;
      isAdmin = adminStatus;
    }
    
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", isAdmin);
    
    // Debug: Log the parameters received
    console.log("Login called with:", { name, email, adminStatus: isAdmin });
    
    // Create user profile with proper name and email
    profile = { 
      name: name || (email ? email.split("@")[0] : ""), // Use provided name or extract from email
      email: email || (name ? name + "@gmail.com" : "") // Use provided email or construct from name
    };
    
    // If name is just the email prefix, try to format it better
    if (profile.name && email && profile.name === email.split("@")[0] && email.includes("@")) {
      // Convert email prefix to a more readable name (capitalize first letter)
      profile.name = profile.name.charAt(0).toUpperCase() + profile.name.slice(1).replace(/[._]/g, " ");
    }
    
    // Debug: Log the profile being created
    console.log("Profile being created:", profile);
    
    localStorage.setItem("userProfile", JSON.stringify(profile));
    
    setUser({ token });
    setIsAdmin(isAdmin);
    setUserProfile(profile);
    
    if (navigate) {
      if (isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const logout = (navigate) => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userProfile");
    setUser(null);
    setIsAdmin(false);
    setUserProfile(null);
    if (navigate) navigate("/login");
  };

  const updateProfile = (profileData) => {
    const updatedProfile = { ...userProfile, ...profileData };
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, userProfile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};