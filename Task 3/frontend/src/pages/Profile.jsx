import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { userProfile, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState(userProfile?.name || "");
  const [email, setEmail] = useState(userProfile?.email || "");

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setEmail(userProfile.email || "");
    }
  }, [userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      ...userProfile,
      name,
      email,
    });
    alert("Profile updated successfully!");
    navigate("/dashboard");
  };

  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const particleOptions = useMemo(
    () => ({
      background: {
        color: { value: "#0a0a0f" },
        image:
          "radial-gradient(circle at 20% 50%, #141E30 0%, #0f2027 50%, #000000 100%)",
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
          onClick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 200, links: { opacity: 0.5 } },
          push: { quantity: 4 },
        },
      },
      particles: {
        number: { value: 120, density: { enable: true, area: 1200 } },
        color: { value: "#64ffda" },
        shape: { type: "circle" },
        opacity: {
          value: 0.6,
          random: true,
          animation: { enable: true, speed: 1, minimumValue: 0.2 },
        },
        size: {
          value: { min: 1, max: 4 },
          random: true,
          animation: { enable: true, speed: 2, minimumValue: 0.5 },
        },
        links: {
          enable: true,
          distance: 150,
          color: "#64ffda",
          opacity: 0.3,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "out" },
          attract: { enable: false },
        },
      },
      detectRetina: true,
    }),
    []
  );

  // Styles
  const styles = {
    container: {
      width: "100vw",
      minHeight: "100vh",
      position: "relative",
      margin: 0,
      padding: 0,
      overflow: "auto",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    heroSection: {
      textAlign: "center",
      marginBottom: "2rem",
      padding: "1rem",
      zIndex: 10,
      position: "relative",
    },
    heroTitle: {
      fontSize: isMobile ? "2.5rem" : "3.5rem",
      fontWeight: "700",
      background: "linear-gradient(90deg, #64ffda 0%, #48c9b0 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "1rem",
      letterSpacing: "-0.02em",
    },
    heroSubtitle: {
      fontSize: isMobile ? "1.1rem" : "1.3rem",
      color: "#c7d2fe",
      fontWeight: "300",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: "1.6",
    },
    card: {
      position: "relative",
      backgroundColor: "rgba(10, 10, 15, 0.85)",
      padding: "2.5rem",
      borderRadius: "20px",
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
      width: "90%",
      maxWidth: "500px",
      zIndex: 10,
      backdropFilter: "blur(25px)",
      border: "1px solid rgba(100, 255, 218, 0.2)",
    },
    title: {
      color: "white",
      textAlign: "center",
      marginBottom: "2rem",
      fontSize: "1.8rem",
      fontWeight: "600",
      letterSpacing: "0.5px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      marginBottom: "1.5rem",
    },
    label: {
      color: "white",
      marginBottom: "0.5rem",
      fontSize: "1rem",
      fontWeight: "500",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      marginTop: "8px",
      border: "none", 
      borderRadius: "8px",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      color: "white",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      boxSizing: "border-box",
      outline: "none",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
      gap: "15px",
    },
    button: {
      flex: 1,
      padding: "14px",
      background: "linear-gradient(90deg, #64ffda 0%, #48c9b0 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "500",
      transition: "all 0.3s ease, transform 0.1s ease",
      boxShadow: "0 4px 15px rgba(100, 255, 218, 0.3)",
    },
    cancelButton: {
      background: "linear-gradient(90deg, #6b7280 0%, #9ca3af 100%)",
      boxShadow: "0 4px 15px rgba(107, 114, 128, 0.3)",
    },
    profileImageContainer: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "2rem",
    },
    profileInitials: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #64ffda 0%, #48c9b0 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontSize: "2rem",
      fontWeight: "bold",
      boxShadow: "0 8px 25px rgba(100, 255, 218, 0.4)",
    },
    profileImage: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      objectFit: "cover",
      boxShadow: "0 8px 25px rgba(100, 255, 218, 0.4)",
      border: "none",
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
  };

  return (
    <div style={styles.container}>
      <Particles
        id="constellation"
        options={particleOptions}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
        }}
      />

      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Your Profile</h1>
        <p style={styles.heroSubtitle}>
          Manage your personal information and preferences
        </p>
      </div>

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div style={styles.profileImageContainer}>
          {userProfile?.profilePicture ? (
            <img
              src={userProfile.profilePicture}
              alt="Profile"
              style={styles.profileImage}
            />
          ) : (
            <div style={styles.profileInitials}>
              {userProfile?.name
                ? userProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
          )}
        </div>
        {userProfile?.profilePicture && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={async ()=>{
                try { await fetch(`${(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://127.0.0.1:5000'}/api/profile/avatar`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); } catch {}
                updateProfile({ ...userProfile, profilePicture: undefined });
              }}
              style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              Remove Picture
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              Cancel
            </button>
            <button type="submit" style={styles.button}>
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
