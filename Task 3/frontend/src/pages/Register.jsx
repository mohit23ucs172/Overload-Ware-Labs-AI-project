import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "animate.css";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const registrationData = {
        name,
        email,
        password,
      };
      console.log("Sending registration data:", registrationData);
      
      const res = await axios.post("https://owl-task3.onrender.com/auth/register", registrationData);
      if (res.data.msg === "Registration successful") {
        try {
          const loginRes = await axios.post("https://owl-task3.onrender.com/auth/login", {
            email,
            password,
          });
          if (loginRes.data.token) {
            login(loginRes.data.token, navigate, false, name, email);
          } else {
            alert("Registration successful! Please log in.");
            navigate("/login");
          }
        } catch (loginErr) {
          alert("Registration successful! Please log in.");
          navigate("/login");
        }
      } else {
        alert("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      alert("Registration failed. Try again!");
    }
  };

  return (
    <div style={styles.container}>
      <Particles
        options={{
          background: { color: "#0B0F19" },
          particles: {
            color: { value: "#60A5FA" },
            links: { enable: true, color: "#8B5CF6" },
            move: { enable: true, speed: 1 },
            size: { value: 2 },
            opacity: { value: 0.6 },
          },
        }}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      />

      <motion.div
        className="animate__animated animate__fadeInUp"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={styles.glassCard}
      >
        <h2 style={{ marginBottom: "20px" }}>🦉 Create an Account</h2>
        <form style={styles.form} onSubmit={handleRegister}>
          <div style={styles.inputGroup}>
            <input
              style={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label
              style={{
                ...styles.label,
                top: name ? "-10px" : "12px",
                fontSize: name ? "0.8rem" : "1rem",
                color: name ? "#60A5FA" : "rgba(255,255,255,0.6)",
              }}
            >
              Full Name
            </label>
          </div>
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
            Register
          </motion.button>
        </form>
        <p style={styles.text}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(135deg, #1E1B4B, #0B0F19)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    padding: "40px",
    width: "360px",
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
    borderBottom: "2px solid rgba(255,255,255,0.5)",
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
