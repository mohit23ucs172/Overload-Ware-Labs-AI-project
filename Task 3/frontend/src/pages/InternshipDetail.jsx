// src/pages/InternshipDetail.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "https://owl-task3.onrender.com";

const formatDate = (dmyString) => {
  if (!dmyString || typeof dmyString !== 'string') return 'Not set';
  
  const parts = dmyString.split('/');
  if (parts.length !== 3) {
    const date = new Date(dmyString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : 'Invalid Date';
  }
  
  const [day, month, year] = parts;
  // Note: month is 0-indexed in JavaScript's Date constructor
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-GB');
};

const formatUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

const parseStringList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
        return data.filter(item => item && typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof data === 'string') {
        return data.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
    }
    return [];
};


function InternshipDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [application, setApplication] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", resume: null });
  const [submitted, setSubmitted] = useState(false);

  const [links, setLinks] = useState({ 
    github_url: "", 
    live_url: "", 
    docs_url: "", 
    notes: "" 
  });

  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      if (location.state) {
        const stateData = location.state;
        setData({
          ...stateData,
          skills: parseStringList(stateData.skills),
          projects: parseStringList(stateData.projects),
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/internships`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch internships list: ${response.status}`);
        }

        const internships = await response.json();
        const internship = internships.find(item => 
          String(item.id) === String(id) || 
          String(item._id) === String(id)
        );
        
        if (internship) {
          setData({
            ...internship,
            skills: parseStringList(internship.skills),
            projects: parseStringList(internship.projects),
          });
        } else {
            throw new Error("Internship not found.");
        }
      } catch (err) {
        console.error("Error fetching internship details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipDetails();
  }, [id, location.state]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!data) return;
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const currentInternshipId = data._id || data.id;

      try {
        const res = await fetch(`${API_BASE}/api/my_applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
           throw new Error(`Failed to fetch applications: ${res.status}`);
        }
        
        const allApps = await res.json();
        const currentApp = allApps.find(app => {
            const internshipIdInApp = app.internshipId || app.internship_id || app.internship?._id || app.internship?.id;
            return String(internshipIdInApp) === String(currentInternshipId);
        });

        if (currentApp) {
          const currentStatus = currentApp.status?.toLowerCase();
          const isAppApproved = currentStatus === 'approved' || currentStatus === 'resubmit';
          const isAppCompleted = currentStatus === 'completed';

          setApplication(currentApp);
          setHasApplied(true);
          setIsApproved(isAppApproved);
          setIsCompleted(isAppCompleted);
          
          if(currentApp.submission) {
            setLinks({
              github_url: currentApp.submission.github_url || "",
              live_url: currentApp.submission.live_url || "",
              docs_url: currentApp.submission.docs_url || "",
              notes: currentApp.submission.notes || ""
            });
          }

        } else {
            setApplication(null);
            setHasApplied(false);
            setIsApproved(false);
            setIsCompleted(false);
        }

      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };
    
    checkApplicationStatus();
  }, [data]);

  const handleApplyClick = () => setShowModal(true);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const token = localStorage.getItem("token");
    const currentInternshipId = data?._id || data?.id;

    if (!token || !currentInternshipId || !form.resume) {
        alert('Missing required information. Please try again.');
        setSubmitted(false);
        return;
    }

    const fd = new FormData();
    fd.append('internshipId', currentInternshipId);
    fd.append('internshipTitle', data.title);
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('resume', form.resume);

    try {
        const res = await fetch(`${API_BASE}/api/apply_internship`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'An unknown error occurred.' }));
            throw new Error(errorData.message || `HTTP error ${res.status}`);
        }

        await res.json();
        setShowModal(false);
        navigate('/dashboard');
    } catch (error) {
        console.error('Application submission error:', error);
        alert(`Failed to submit application: ${error.message}`);
    } finally {
        setSubmitted(false);
    }
  };

  const handleWorkSubmission = async (e) => {
    e.preventDefault();
    setIsSubmittingWork(true);

    if (!application || (!links.github_url.trim() && !links.live_url.trim())) {
      alert('Please provide at least a GitHub URL or a Live Demo URL.');
      setIsSubmittingWork(false);
      return;
    }

    const applicationId = application._id || application.id;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE}/api/internship_applications/${applicationId}/submission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          githubLink: formatUrl(links.github_url),
          liveLink: formatUrl(links.live_url),
          docsLink: formatUrl(links.docs_url),
          notes: links.notes
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      alert('Submission saved successfully!');
    } catch (error) {
      console.error('Work submission error:', error);
      alert(`Failed to save submission: ${error.message}`);
    } finally {
        setIsSubmittingWork(false);
    }
  };


  const particleOptions = useMemo(() => ({
      background: { color: { value: "#0B0F19" } },
      fpsLimit: 60,
      interactivity: { events: { onHover: { enable: true, mode: "repulse" }, resize: true }, modes: { repulse: { distance: 120, duration: 0.4 } } },
      particles: { number: { value: 100, density: { enable: true, area: 800 } }, color: { value: "#ffffff" }, shape: { type: "circle" }, opacity: { value: { min: 0.3, max: 0.8 }, animation: { enable: true, speed: 0.5 } }, size: { value: { min: 1, max: 2.5 } }, links: { enable: false }, move: { enable: true, speed: 0.3, direction: "none", random: true, straight: false, outModes: { default: "out" } } },
      detectRetina: true,
  }), []);

  if (loading) return <div style={styles.container}><div style={styles.loadingContainer}><div style={styles.loadingSpinner}></div><p>Loading internship details...</p></div></div>;
  if (error) return <div style={styles.container}><div style={styles.errorContainer}><h2>Error</h2><p>{error}</p><Link to="/dashboard" style={styles.back}>← Back to Dashboard</Link></div></div>;

  const renderListSection = (title, items, styleConfig) => {
    const parsedItems = parseStringList(items);
    if (parsedItems.length === 0) return null;
    return (
      <><h3 style={styles.subhead}>{styleConfig.icon} {title}:</h3><div style={styles.gridContainer}>{parsedItems.map((item, i) => (<div key={i} style={styleConfig.badge}><span style={styleConfig.itemIcon}>{styleConfig.itemEmoji}</span>{item}</div>))}</div></>
    );
  };

  const renderProjectSection = (projects) => {
    const parsedProjects = parseStringList(projects);
    if (parsedProjects.length === 0) return null;
     return (
        <><h3 style={styles.subhead}>🚀 Sample Projects:</h3><div style={styles.projectsContainer}>{parsedProjects.map((project, i) => (<div key={i} style={styles.projectCard}><div style={styles.projectIcon}>🚀</div><div style={styles.projectText}>{project}</div></div>))}</div></>
     );
  };


  return (
    <div style={styles.container}>
      {particlesReady && <Particles id="tsparticles" options={particleOptions} style={styles.particles} />}
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={styles.glassCard}>
        <h1 style={styles.title}>{data?.title || 'Internship'}</h1>
        <p style={styles.desc}>{data?.description || 'No description available'}</p>
        <div style={styles.infoGrid}>
            <h3 style={styles.subhead}>📌 Duration: <span style={styles.info}>{data?.duration || 'Unknown'}</span></h3>
            <h3 style={styles.subhead}>🌍 Mode: <span style={styles.info}>{data?.mode || 'Unknown'}</span></h3>
        </div>
        {renderListSection("Skills You'll Gain", data?.skills, { icon: '🛠️', title: "Skills You'll Gain", badge: styles.skillBadge, itemIcon: styles.skillIcon, itemEmoji: '⚡' })}
        {renderProjectSection(data?.projects)}
        {renderListSection("Key Features", data?.features, { icon: '✨', title: "Key Features", badge: styles.featureBadge, itemIcon: styles.featureIcon, itemEmoji: '✨' })}
        {renderListSection("Tech Stack", data?.tech_stack, { icon: '💻', title: "Tech Stack", badge: styles.techBadge, itemIcon: styles.techIcon, itemEmoji: '💻' })}
        {data?.how_to_do && <><h3 style={styles.subhead}>📝 Implementation Guide:</h3><div style={styles.howToDoContainer}><div style={styles.howToDoContent}>{parseStringList(data.how_to_do).map((step, i) => (<div key={i} style={styles.stepItem}><div style={styles.stepNumber}>{i + 1}</div><div style={styles.stepText}>{step}</div></div>))}</div></div></>}
        
        {data?.timeline && (
          <><h3 style={styles.subhead}>📅 Timeline:</h3><div style={styles.timelineContainer}>
              {data.timeline.start && (<div style={styles.timelineCard}><div style={styles.timelineIcon}>🚀</div><div style={styles.timelineText}>Start: {formatDate(data.timeline.start)}</div></div>)}
              {data.timeline.milestone && (<div style={styles.timelineCard}><div style={styles.timelineIcon}>🎯</div><div style={styles.timelineText}>Milestone: {formatDate(data.timeline.milestone)}</div></div>)}
              {data.timeline.final && (<div style={styles.timelineCard}><div style={styles.timelineIcon}>🏆</div><div style={styles.timelineText}>Final: {formatDate(data.timeline.final)}</div></div>)}
          </div></>
        )}

        <div style={styles.actionContainer}>
          {!hasApplied ? (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={styles.button} onClick={handleApplyClick}>Apply Now</motion.button>) 
          : isCompleted ? (<div style={styles.statusBoxCompleted}>🎉 Internship Completed! 🎉</div>) 
          : !isApproved ? (<div style={styles.statusBoxPending}>✓ Application Submitted - Pending Approval</div>) 
          : (<div style={styles.submissionContainer}><h3 style={styles.subhead}>Submit Your Work</h3><p style={styles.subtext}>Your application has been approved! Please submit your project links below.</p>
            <form onSubmit={handleWorkSubmission} style={styles.submissionForm}>
              <input style={styles.input} type="text" placeholder="GitHub Repository URL (e.g., github.com/username/repo)" value={links.github_url} onChange={(e) => setLinks({ ...links, github_url: e.target.value })}/>
              <input style={styles.input} type="text" placeholder="Live Demo URL (e.g., yoursite.netlify.app)" value={links.live_url} onChange={(e) => setLinks({ ...links, live_url: e.target.value })}/>
              <input style={styles.input} type="text" placeholder="Documentation URL (optional)" value={links.docs_url} onChange={(e) => setLinks({ ...links, docs_url: e.target.value })}/>
              <textarea style={{ ...styles.input, minHeight: 80 }} placeholder="Notes (optional)" value={links.notes} onChange={(e) => setLinks({ ...links, notes: e.target.value })}/>
              <button type="submit" style={styles.button} disabled={isSubmittingWork}>{isSubmittingWork ? 'Saving...' : 'Save Submission'}</button>
            </form>
          </div>)}
        </div>
        <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
      </motion.div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <motion.div style={styles.modal} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <h2 style={{ marginBottom: 24, color: "#fff", textAlign: 'center' }}>Apply for {data?.title}</h2>
            <form onSubmit={handleApplicationSubmit}>
              <div style={{ marginBottom: 20 }}><label style={styles.label}>Full Name</label><input type="text" name="name" value={form.name} onChange={handleFormChange} required style={styles.modalInput} placeholder="Enter your full name"/></div>
              <div style={{ marginBottom: 20 }}><label style={styles.label}>Email Address</label><input type="email" name="email" value={form.email} onChange={handleFormChange} required style={styles.modalInput} placeholder="Enter your email"/></div>
              <div style={{ marginBottom: 25 }}><label style={styles.label}>Resume (PDF only)</label><input type="file" name="resume" accept=".pdf" onChange={handleFormChange} required style={{ ...styles.modalInput, padding: '10px' }}/>{form.resume && (<div style={styles.fileNameDisplay}>Selected file: {form.resume.name || form.resume}</div>)}</div>
              <div style={{ display: "flex", gap: 12, justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                <motion.button type="button" onClick={() => setShowModal(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...styles.modalButton, background: 'rgba(255, 255, 255, 0.1)'}}>Cancel</motion.button>
                <motion.button type="submit" disabled={submitted} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...styles.modalButton, background: submitted ? "#7f5af080" : "linear-gradient(90deg, #7f5af0, #5fbbfc)"}}>{submitted ? "Submitting..." : "Submit Application"}</motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", width: "100%", margin: 0, padding: "40px 0", boxSizing: "border-box", background: "linear-gradient(-45deg, #181a20, #1f2230, #23243a, #181a20)", backgroundSize: "400% 400%", animation: "gradientFlow 20s ease infinite", fontFamily: "'Inter', sans-serif", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflowX: "hidden" },
  particles: { position: "absolute", inset: 0, zIndex: 0 },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" },
  loadingSpinner: { width: "40px", height: "40px", border: "4px solid #7f5af0", borderTop: "4px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" },
  errorContainer: { textAlign: "center", padding: "2rem", maxWidth: "600px", margin: "0 auto" },
  glassCard: { background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(16px)", borderRadius: "20px", padding: "40px 32px 32px 32px", width: "90%", maxWidth: "900px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", color: "#fff", textAlign: "center", zIndex: 1, margin: "40px 0" },
  title: { fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 800, marginBottom: "18px", background: "linear-gradient(90deg, #7f5af0 30%, #5fbbfc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 2px 16px rgba(127,90,240,0.12)" },
  desc: { color: "#a5b4fc", fontSize: "clamp(1rem, 2.5vw, 1.1rem)", marginBottom: "24px", fontWeight: 500, lineHeight: 1.6 },
  infoGrid: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "20px" },
  subhead: { margin: "24px 0 10px 0", fontSize: "1.2rem", fontWeight: 700, color: "#fff", textAlign: "left" },
  info: { color: "#5fbbfc", fontWeight: 600 },
  gridContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", padding: "16px 0" },
  skillBadge: { background: "rgba(127, 90, 240, 0.1)", border: "1px solid #7f5af0", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", transition: "transform 0.2s" },
  skillIcon: { color: "#7f5af0" },
  projectsContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", padding: "16px 0" },
  projectCard: { background: "rgba(95, 187, 252, 0.1)", border: "1px solid #5fbbfc", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px", textAlign: 'left' },
  projectIcon: { fontSize: "1.5rem", marginTop: '2px' },
  projectText: { flex: 1, color: "#fff", fontSize: "0.95rem", lineHeight: 1.5 },
  featureBadge: { background: "rgba(127, 90, 240, 0.1)", border: "1px solid #7f5af0", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" },
  featureIcon: { color: "#7f5af0" },
  techBadge: { background: "rgba(95, 187, 252, 0.1)", border: "1px solid #5fbbfc", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" },
  techIcon: { color: "#5fbbfc" },
  howToDoContainer: { background: "rgba(35,36,58,0.85)", borderRadius: "12px", padding: "16px", margin: "8px 0", textAlign: "left" },
  howToDoContent: { display: "flex", flexDirection: "column", gap: "12px" },
  stepItem: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" },
  stepNumber: { background: "#7f5af0", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "600", flexShrink: 0 },
  stepText: { color: "#fff", fontSize: "0.9rem", lineHeight: 1.5 },
  timelineContainer: { display: "flex", flexDirection: "column", gap: "12px", padding: "16px 0" },
  timelineCard: { background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", gap: "12px" },
  timelineIcon: { fontSize: "1.2rem" },
  timelineText: { color: "#fff", fontSize: "0.9rem" },
  actionContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: '30px 0', borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "30px" },
  button: { padding: "12px 24px", background: "linear-gradient(90deg, #7f5af0, #5fbbfc)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "600", minWidth: '200px', margin: '0 auto', fontSize: '1rem', transition: 'opacity 0.2s', },
  statusBoxPending: { padding: '12px 24px', background: 'rgba(95, 187, 252, 0.1)', color: '#5fbbfc', borderRadius: '10px', fontWeight: 600, textAlign: 'center', border: '2px solid #5fbbfc', margin: '0 auto', maxWidth: '90%' },
  statusBoxCompleted: { padding: '12px 24px', background: 'rgba(52, 211, 153, 0.1)', color: '#34D399', borderRadius: '10px', fontWeight: 600, textAlign: 'center', border: '2px solid #34D399', margin: '0 auto', maxWidth: '90%' },
  submissionContainer: { marginTop: 20, textAlign: 'left', width: '100%', maxWidth: '600px', margin: '0 auto' },
  submissionForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  subtext: { fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '16px', textAlign: 'center' },
  input: { width: "100%", padding: "12px", background: "rgba(0, 0, 0, 0.2)", boxSizing: 'border-box', border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "0.9rem", outline: "none", transition: "border-color 0.3s", },
  backLink: { display: 'block', textAlign: 'center', margin: '30px auto 0 auto', padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', textDecoration: 'none', color: '#fff', transition: 'all 0.3s ease', maxWidth: '200px' },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: "rgba(30, 33, 45, 0.95)", borderRadius: "16px", padding: "30px", width: "90%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box", border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' },
  label: { display: "block", marginBottom: "8px", color: "#e0e0e0", fontWeight: "600", fontSize: '0.95rem' },
  modalInput: { width: "100%", padding: "12px 16px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", boxSizing: "border-box", marginBottom: '5px', transition: 'all 0.3s ease', outline: 'none' },
  modalButton: { padding: "12px 24px", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "0.95rem", transition: 'all 0.2s ease', minWidth: '120px', textAlign: 'center' },
  fileNameDisplay: { marginTop: '5px', color: '#a5b4fc', fontSize: '0.85rem', fontStyle: 'italic' }
};

const styleTag = document.getElementById('dynamic-styles') || document.createElement("style");
styleTag.id = 'dynamic-styles';
if (!styleTag.innerHTML.includes('@keyframes spin')) {
    styleTag.innerHTML += `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`;
    document.head.appendChild(styleTag);
}

export default InternshipDetail;
