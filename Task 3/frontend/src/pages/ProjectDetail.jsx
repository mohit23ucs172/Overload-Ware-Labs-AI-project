import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";

const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "https://owl-task3.onrender.com";

const formatUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
};

const formatDate = (dmyString) => {
  if (!dmyString || typeof dmyString !== 'string') return 'Not set';
  
  const parts = dmyString.split('/');
  if (parts.length !== 3) {
    const date = new Date(dmyString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString('en-GB') : 'Invalid Date';
  }
  
  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-GB');
};


export default function ProjectDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", resume: null });
  const [submitted, setSubmitted] = useState(false);
  
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null); 
  const [application, setApplication] = useState(null);
  const [links, setLinks] = useState({ github_url: "", live_url: "", docs_url: "", notes: "" });
  
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (location.state) {
          setProject(location.state);
          return;
        }
        const token = localStorage.getItem("token");
        if (!token) throw new Error('No authentication token found.');
        const response = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(id)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Project not found. Status: ${response.status}`);
        setProject(await response.json());
      } catch (err) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProjectDetails();
    } else {
      setError('No project ID provided');
      setLoading(false);
    }
  }, [id, location.state]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!project) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/my_applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const apps = await res.json();
          const currentApp = apps.find(app => {
              if (app.type !== 'project') return false;
              const projectIdInApp = app.projectId || app.project?._id;
              if (projectIdInApp && project._id && String(projectIdInApp) === String(project._id)) {
                  return true;
              }
              const projectTitle = project.title || project.name;
              const appTitle = app.projectTitle;
              if (projectTitle && appTitle && projectTitle.trim().toLowerCase() === appTitle.trim().toLowerCase()) {
                  return true;
              }
              return false;
          });

          if (currentApp) {
            setHasApplied(true);
            setApplicationStatus(currentApp.status);
            setApplication(currentApp);
            if (currentApp.submission) {
                setLinks({
                  github_url: currentApp.submission.github_url || "",
                  live_url: currentApp.submission.live_url || "",
                  docs_url: currentApp.submission.docs_url || "",
                  notes: currentApp.submission.notes || ""
                });
            }
          } else {
            setHasApplied(false);
            setApplicationStatus(null);
            setApplication(null);
          }
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };

    checkApplicationStatus();
  }, [project]);
  
  const handleApply = () => setShowModal(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file for your resume.");
        e.target.value = null;
        return;
      }
      setForm((prev) => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resume) {
        alert("Please upload your resume as a PDF file.");
        return;
    }
    setSubmitted(true);
    
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append('projectId', id); 
    fd.append('projectTitle', project?.title || project?.name || 'Unknown Project');
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('resume', form.resume);

    try {
        const res = await fetch(`${API_BASE}/api/apply_project/${id}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        alert('Application submitted successfully!');
        setShowModal(false);
        setHasApplied(true);
        setApplicationStatus('in_process');
        navigate('/dashboard');
    } catch (error) {
        console.error('Application submission error:', error);
        alert('Failed to submit application. Please try again.');
    } finally {
        setSubmitted(false);
    }
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    if (!links.github_url.trim() && !links.live_url.trim()) {
      alert('Please provide at least a GitHub URL or Live Demo URL');
      return;
    }
    if (!application || !application.id) {
        alert('Could not find your application details. Please refresh the page.');
        return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/project_applications/${application.id}/submission`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          githubLink: formatUrl(links.github_url),
          liveLink: formatUrl(links.live_url),
          docsLink: formatUrl(links.docs_url),
          notes: links.notes
        })
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      alert('Submission saved successfully!');
      setApplicationStatus('submitted');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to save submission: ${error.message}`);
    }
  };

  const particleOptions = useMemo(() => ({
      background: { color: { value: "#0B0F19" } },
      fpsLimit: 60,
      interactivity: { events: { onHover: { enable: true, mode: "repulse" } } },
      particles: { number: { value: 100 }, color: { value: "#ffffff" }, move: { enable: true, speed: 0.3 } },
  }), []);

  if (loading) return <div style={styles.container}><div style={styles.loadingContainer}><div style={styles.spinner}></div><p>Loading project...</p></div></div>;
  if (error || !project) return <div style={styles.container}><div style={styles.errorContainer}><h2>Project Not Found</h2><p>{error}</p><Link to="/dashboard" style={styles.backButton}>← Back</Link></div></div>;

  const renderActionArea = () => {
    if (!hasApplied) {
        return <motion.button whileHover={{ scale: 1.05 }} style={styles.button} onClick={handleApply}>Apply Now</motion.button>;
    }
    switch(applicationStatus) {
        case 'approved':
        case 'resubmit':
            return (
                <div style={{ marginTop: 20, textAlign: 'left', width: '100%' }}>
                    <h3 style={styles.subhead}>Submit Your Work</h3>
                    {applicationStatus === 'resubmit' && <div style={styles.resubmitMessage}>Submission rejected. Please re-submit.</div>}
                    <form onSubmit={handleWorkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 520, margin: '0 auto' }}>
                        <input style={styles.input} type="text" placeholder="GitHub URL" value={links.github_url} onChange={(e) => setLinks({ ...links, github_url: e.target.value })} required/>
                        <input style={styles.input} type="text" placeholder="Live Demo URL" value={links.live_url} onChange={(e) => setLinks({ ...links, live_url: e.target.value })} required/>
                        <input style={styles.input} type="text" placeholder="Docs URL (optional)" value={links.docs_url} onChange={(e) => setLinks({ ...links, docs_url: e.target.value })}/>
                        <textarea style={{ ...styles.input, minHeight: 80 }} placeholder="Notes (optional)" value={links.notes} onChange={(e) => setLinks({ ...links, notes: e.target.value })}/>
                        <button type="submit" style={styles.button}>{applicationStatus === 'resubmit' ? 'Re-submit Work' : 'Save Submission'}</button>
                    </form>
                </div>
            );
        case 'completed': 
            return <div style={styles.completedMessage}>🎉 Project Completed! 🎉</div>;
        default: 
            return <div style={styles.pendingMessage}>✓ Application Submitted - Pending Approval</div>;
    }
  };

  return (
    <div style={styles.container}>
      {particlesReady && <Particles id="tsparticles" options={particleOptions} style={{ position: "absolute", inset: 0, zIndex: 0 }} />}
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={styles.glassCard}>
        <h1 style={styles.title}>{project?.title || project?.name || 'Project'}</h1>
        <p style={styles.desc}>{project?.description || 'No description'}</p>
        {project?.tech_stack?.length > 0 && <><h3 style={styles.subhead}>💻 Tech Stack:</h3><div style={styles.skillsGrid}>{project.tech_stack.map((tech, i) => (<div key={i} style={styles.techBadge}><span style={styles.techIcon}>💻</span>{tech.trim()}</div>))}</div></>}
        {project?.features?.length > 0 && <><h3 style={styles.subhead}>✨ Features:</h3><div style={styles.skillsGrid}>{project.features.map((feature, i) => (<div key={i} style={styles.featureBadge}><span style={styles.featureIcon}>✨</span>{feature.trim()}</div>))}</div></>}
        {project?.how_to_do && <><h3 style={styles.subhead}>📝 Guide:</h3><div style={styles.howToDoContainer}>{project.how_to_do.split('\n').filter(Boolean).map((step, i) => (<div key={i} style={styles.stepItem}><div style={styles.stepNumber}>{i + 1}</div><div style={styles.stepText}>{step.trim()}</div></div>))}</div></>}
        {project?.how_to_submit && <><h3 style={styles.subhead}>📤 Submit:</h3><div style={styles.howToDoContainer}>{project.how_to_submit.split('\n').filter(Boolean).map((step, i) => (<div key={`submit-${i}`} style={styles.stepItem}><div style={styles.stepNumber}>{i + 1}</div><div style={styles.stepText}>{step.trim()}</div></div>))}</div></>}
        
        {/* FIXED: Correctly access nested project.timeline object */}
        {project?.timeline && (project.timeline.start || project.timeline.milestone || project.timeline.final) && (
            <><h3 style={styles.subhead}>📅 Timeline:</h3>
            <div style={styles.timelineContainer}>
                {project.timeline.start && (<div style={styles.timelineCard}><div style={styles.timelineIcon}>🚀</div><div style={styles.timelineText}>Start: {formatDate(project.timeline.start)}</div></div>)}
                {project.timeline.milestone && (<div style={styles.timelineCard}><div style={styles.timelineIcon}>🎯</div><div style={styles.timelineText}>Milestone: {formatDate(project.timeline.milestone)}</div></div>)}
                {project.timeline.final && (<div style={styles.timelineCard}><div style={styles.timelineIcon}>🏆</div><div style={styles.timelineText}>Final: {formatDate(project.timeline.final)}</div></div>)}
            </div></>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: '20px 0' }}>{renderActionArea()}</div>
        <Link to="/dashboard" style={styles.backButton}>← Back to Dashboard</Link>
      </motion.div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.modal}>
            <h2 style={{ marginBottom: 24, color: "#fff", textAlign: 'center' }}>Apply for {project?.title || project?.name}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label style={styles.label}>Full Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required style={styles.modalInput} placeholder="Enter your full name"/>
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label style={styles.label}>Email Address</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required style={styles.modalInput} placeholder="Enter your email"/>
                </div>
                <div style={{ marginBottom: 25 }}>
                    <label style={styles.label}>Resume (PDF only)</label>
                    <input type="file" name="resume" accept="application/pdf" onChange={handleFileChange} required style={{ ...styles.modalInput, padding: '10px' }}/>
                    {form.resume && (<div style={styles.fileNameDisplay}>Selected file: {form.resume.name}</div>)}
                </div>
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
  container: { minHeight: "100vh", width: "100%", margin: 0, padding: "40px", boxSizing: 'border-box', background: "linear-gradient(-45deg, #181a20, #1f2230, #23243a, #181a20)", backgroundSize: "400% 400%", animation: "gradientFlow 20s ease infinite", fontFamily: "Inter, sans-serif", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflowX: "hidden" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" },
  spinner: { width: "40px", height: "40px", border: "4px solid #7f5af0", borderTop: "4px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" },
  errorContainer: { textAlign: "center", padding: "2rem", maxWidth: "600px", margin: "0 auto" },
  glassCard: { background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(16px)", borderRadius: "20px", padding: "40px 32px 32px 32px", width: "100%", maxWidth: "900px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", color: "#fff", textAlign: "center", zIndex: 1, margin: "40px 0" },
  title: { fontSize: "2.2rem", fontWeight: 800, letterSpacing: "1.2px", marginBottom: "18px", background: "linear-gradient(90deg, #7f5af0 30%, #5fbbfc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 2px 16px rgba(127,90,240,0.12)" },
  desc: { color: "#a5b4fc", fontSize: "1.1rem", marginBottom: "24px", fontWeight: 500, letterSpacing: "0.5px" },
  subhead: { margin: "24px 0 10px 0", fontSize: "1.1rem", fontWeight: 700, color: "#fff", textAlign: "left" },
  skillsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px", padding: "16px 0" },
  techBadge: { background: "rgba(95, 187, 252, 0.1)", border: "1px solid #5fbbfc", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" },
  techIcon: { color: "#5fbbfc" },
  featureBadge: { background: "rgba(127, 90, 240, 0.1)", border: "1px solid #7f5af0", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" },
  featureIcon: { color: "#7f5af0" },
  howToDoContainer: { background: "rgba(35,36,58,0.85)", borderRadius: "12px", padding: "16px", margin: "8px 0", textAlign: "left" },
  stepItem: { display: "flex", alignItems: "flex-start", gap: "12px", padding: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" },
  stepNumber: { background: "#7f5af0", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "600", flexShrink: 0 },
  stepText: { color: "#fff", fontSize: "0.9rem", lineHeight: 1.5 },
  timelineContainer: { display: "flex", flexDirection: "column", gap: "12px", padding: "16px 0" },
  timelineCard: { background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", gap: "12px" },
  timelineIcon: { fontSize: "1.2rem" },
  timelineText: { color: "#fff", fontSize: "0.9rem" },
  backButton: { display: 'block', textAlign: 'center', margin: '30px auto 0 auto', padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', textDecoration: 'none', color: '#fff', transition: 'all 0.3s ease', maxWidth: '200px' },
  button: { marginTop: "10px", padding: "12px 24px", background: "linear-gradient(90deg, #7f5af0, #5fbbfc)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: '1rem' },
  input: { width: "100%", padding: "12px", background: "rgba(0,0,0,0.2)", boxSizing: 'border-box', border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "0.9rem", outline: "none" },
  pendingMessage: { padding: '12px 24px', background: 'rgba(95, 187, 252, 0.1)', color: '#5fbbfc', borderRadius: '10px', fontWeight: 600, textAlign: 'center', border: '2px solid #5fbbfc' },
  completedMessage: { padding: '12px 24px', background: 'rgba(52, 211, 153, 0.1)', color: '#34D399', borderRadius: '10px', fontWeight: 600, textAlign: 'center', border: '2px solid #34D399' },
  resubmitMessage: { padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center', fontWeight: 500 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: "rgba(30, 33, 45, 0.95)", borderRadius: "16px", padding: "30px", width: "90%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box", border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', color: '#fff' },
  label: { display: "block", marginBottom: "8px", color: "#e0e0e0", fontWeight: "600", fontSize: '0.95rem' },
  modalInput: { width: "100%", padding: "12px 16px", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "#fff", fontSize: "0.95rem", boxSizing: "border-box", marginBottom: '5px', transition: 'all 0.3s ease', outline: 'none' },
  modalButton: { padding: "12px 24px", border: "none", borderRadius: "8px", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "0.95rem", transition: 'all 0.2s ease', minWidth: '120px', textAlign: 'center' },
  fileNameDisplay: { marginTop: '5px', color: '#a5b4fc', fontSize: '0.85rem', fontStyle: 'italic' }
};

const styleTag = document.getElementById('dynamic-styles-project-detail') || document.createElement("style");
if (!styleTag.isConnected) {
    styleTag.id = 'dynamic-styles-project-detail';
    styleTag.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`;
    document.head.appendChild(styleTag);
}
