import React, { useState, useContext, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "animate.css";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://owl-task3.onrender.com/auth/login", {
        email,
        password,
      });
      if (res.data.token) {
        const name = res.data.name || email.split('@')[0];
        const userEmail = res.data.email || email;
        console.log("Backend response:", res.data);
        login(res.data.token, navigate, false, name, userEmail);
      } else {
        alert("Login failed. Check credentials!");
      }
    } catch (err) {
      alert("Login failed. Check credentials!");
    }
  };

  /** --- Constellation particle config --- */
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (init) return;
    
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particleOptions = useMemo(
    () => ({
      background: { color: { value: "#0B0F19" } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
          onClick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: { distance: 180, links: { opacity: 0.6 } },
          push: { quantity: 3 },
        },
      },
      particles: {
        number: { value: 120, density: { enable: true, area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.8,
          random: true,
          animation: { enable: true, speed: 0.6, minimumValue: 0.3 },
        },
        size: {
          value: { min: 1, max: 3 },
          random: true,
        },
        links: {
          enable: true,
          distance: 150,
          color: "#60A5FA",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "out" },
          attract: { enable: true, rotateX: 600, rotateY: 1200 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <div style={styles.container}>
      {/* Constellation Background */}
      <Particles
        id="tsparticles"
        init={loadSlim}
        options={particleOptions}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />

      {/* Glass Login Card */}
      <motion.div
        className="animate__animated animate__fadeInUp"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={styles.glassCard}
      >
        <h2 style={{ marginBottom: "20px" }}>🦉 Owl AI Login</h2>
        <form style={styles.form} onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label
              style={{
                ...styles.label,
                top: email ? "-10px" : "12px",
                fontSize: email ? "0.8rem" : "1rem",
                color: email ? "#60A5FA" : "rgba(255,255,255,0.6)",
              }}
            >
              Email
            </label>
          </div>
          <div style={styles.inputGroup}>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label
              style={{
                ...styles.label,
                top: password ? "-10px" : "12px",
                fontSize: password ? "0.8rem" : "1rem",
                color: password ? "#60A5FA" : "rgba(255,255,255,0.6)",
              }}
            >
              Password
            </label>
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="animate__animated animate__pulse animate__infinite animate__slow"
            style={styles.button}
          >
            Login
          </motion.button>
        </form>
        <p style={styles.text}>
          No account?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "#0B0F19", // fallback for first load
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    padding: "40px",
    width: "340px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    color: "#fff",
    textAlign: "center",
    zIndex: 1,
  },
  form: { display: "flex", flexDirection: "column" },
  inputGroup: { position: "relative", marginBottom: "25px" },
  input: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid rgba(255,255,255,0.4)",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
  },
  label: {
    position: "absolute",
    left: "0",
    transition: "0.3s",
    pointerEvents: "none",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
  text: { marginTop: "15px", fontSize: "0.9rem", color: "#D1D5DB" },
  link: { color: "#60A5FA", textDecoration: "none", fontWeight: "bold" },
};
