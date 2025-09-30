import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const API_BASE = 'https://owl-task3.onrender.com';

const hasSubmissionData = (app) => {
  const submission = app?.submission || {};
  return submission.github_url || submission.live_url || submission.docs_url || submission.notes || app.githubLink || app.liveLink;
};

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  // FIXED: Changed the default active tab from "applications" to "projects"
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [projectApplications, setProjectApplications] = useState([]);
  const [viewAppModal, setViewAppModal] = useState(null);
  const [viewUserModal, setViewUserModal] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingInternship, setEditingInternship] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    icon: "🔧",
    features: "",
    tech_stack: "",
    how_to_do: "",
    how_to_submit: "",
    timeline_start: "",
    timeline_milestone: "",
    timeline_final: ""
  });
  const [newInternship, setNewInternship] = useState({
    title: "",
    description: "",
    duration: "",
    mode: "",
    skills: "",
    projects: "",
    features: "",
    tech_stack: "",
    how_to_do: "",
    timeline_start: "",
    timeline_milestone: "",
    timeline_final: ""
  });

  const toInputDate = (dmy) => {
    if (!dmy || typeof dmy !== 'string') return "";
    const parts = dmy.split('/');
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  };

  const fromInputDate = (ymd) => {
    if (!ymd || typeof ymd !== 'string') return "";
    const parts = ymd.split('-');
    if (parts.length !== 3) return "";
    const [yyyy, mm, dd] = parts;
    return `${String(dd).padStart(2, '0')}/${String(mm).padStart(2, '0')}/${yyyy}`;
  };

  useEffect(() => {
    if (editingInternship) {
      setNewInternship({
        title: editingInternship.title || "",
        description: editingInternship.description || "",
        duration: editingInternship.duration || "",
        mode: editingInternship.mode || "",
        skills: Array.isArray(editingInternship.skills) ? editingInternship.skills.join(', ') : (editingInternship.skills || ""),
        projects: Array.isArray(editingInternship.projects) ? editingInternship.projects.join(', ') : (editingInternship.projects || ""),
        features: Array.isArray(editingInternship.features) ? editingInternship.features.join(', ') : (editingInternship.features || ""),
        tech_stack: Array.isArray(editingInternship.tech_stack) ? editingInternship.tech_stack.join(', ') : (editingInternship.tech_stack || ""),
        how_to_do: editingInternship.how_to_do || "",
        timeline_start: editingInternship.timeline?.start || "",
        timeline_milestone: editingInternship.timeline?.milestone || "",
        timeline_final: editingInternship.timeline?.final || ""
      });
    } else {
      setNewInternship({ title: "", description: "", duration: "", mode: "", skills: "", projects: "", features: "", tech_stack: "", how_to_do: "", timeline_start: "", timeline_milestone: "", timeline_final: "" });
    }
  }, [editingInternship]);
  
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  const particleOptions = useMemo(() => ({
      background: { color: { value: "#0B0F19" } },
      fpsLimit: 60,
      interactivity: { events: { onHover: { enable: true, mode: "repulse" } }, modes: { repulse: { distance: 120, duration: 0.4 } } },
      particles: { number: { value: 150, density: { enable: true, area: 800 } }, color: { value: ["#ffffff", "#aaaaff", "#ccccff"] }, shape: { type: "circle" }, opacity: { value: 0.8, random: true, animation: { enable: true, speed: 0.5, minimumValue: 0.3 } }, size: { value: { min: 1, max: 3 }, random: true }, links: { enable: false }, move: { enable: true, speed: 0.2, random: true, straight: false, outModes: { default: "out" } } },
      detectRetina: true,
  }), []);

  useEffect(() => {
    if (!isAdmin) navigate("/admin");
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const options = { headers, withCredentials: true };
        
        const [projectsResponse, internshipsResponse, usersResponse, applicationsResponse, projectAppsResponse] = await Promise.all([
          axios.get(`${API_BASE}/api/projects`, options).catch(e => ({ data: [] })),
          axios.get(`${API_BASE}/api/internships`, options).catch(e => ({ data: [] })),
          axios.get(`${API_BASE}/api/users`, options).catch(e => ({ data: [] })),
          axios.get(`${API_BASE}/api/internship_applications`, { ...options, params: { user_id: 'all' } }).catch(e => ({ data: [] })),
          axios.get(`${API_BASE}/api/project_applications`, { ...options, params: { user_id: 'all' } }).catch(e => ({ data: [] }))
        ]);

        setProjects(Array.isArray(projectsResponse?.data) ? projectsResponse.data : []);
        setInternships(Array.isArray(internshipsResponse?.data) ? internshipsResponse.data : []);
        setUsers(Array.isArray(usersResponse?.data) ? usersResponse.data : []);
        setApplications(Array.isArray(applicationsResponse?.data) ? applicationsResponse.data : []);
        setProjectApplications(Array.isArray(projectAppsResponse?.data) ? projectAppsResponse.data : []);
      } catch (error) {
        setErrorMsg(`Failed to load dashboard: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleLogout = () => logout(navigate);

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const parseList = (s) => (s || "").toString().split(/\r?\n|,/).map((x) => x.trim()).filter(Boolean);
      const featuresArray = parseList(newProject.features);
      const techArray = parseList(newProject.tech_stack);
      
      const projectData = {
        ...newProject,
        features: featuresArray,
        tech_stack: techArray,
        timeline: { start: newProject.timeline_start, milestone: newProject.timeline_milestone, final: newProject.timeline_final }
      };

      if (editingProject) {
        await axios.put(`${API_BASE}/api/projects/${editingProject.id || editingProject._id}`, projectData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true });
        setProjects(projects.map(p => (p.id === editingProject.id || p._id === editingProject._id) ? { ...projectData, id: editingProject.id, _id: editingProject._id } : p));
        setToast("Project updated successfully");
      } else {
        const newId = newProject.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const projectToAdd = { ...projectData, id: newId };
        await axios.post(`${API_BASE}/api/projects`, projectToAdd, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true });
        setProjects([...projects, projectToAdd]);
        setToast("Project added successfully");
      }
      
      setEditingProject(null);
      setNewProject({ name: "", description: "", icon: "🔧", features: "", tech_stack: "", how_to_do: "", how_to_submit: "", timeline_start: "", timeline_milestone: "", timeline_final: "" });
    } catch (error) {
      console.error("Error adding/updating project:", error);
    }
  };

  const handleAddInternship = async (e) => {
    e.preventDefault();
    const splitList = (s) => (s || "").toString().split(/\r?\n|,/).map(v => v.trim()).filter(Boolean);
    const internshipData = {
      ...newInternship,
      skills: splitList(newInternship.skills),
      projects: splitList(newInternship.projects),
      features: splitList(newInternship.features),
      tech_stack: splitList(newInternship.tech_stack),
      timeline: { start: newInternship.timeline_start, milestone: newInternship.timeline_milestone, final: newInternship.timeline_final }
    };

    try {
      if (editingInternship) {
        await axios.put(`${API_BASE}/api/internships/${editingInternship.id || editingInternship._id}`, internshipData, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true });
        setInternships(internships.map(i => (i.id === editingInternship.id || i._id === editingInternship._id) ? { ...internshipData, id: editingInternship.id, _id: editingInternship._id } : i));
        setToast("Internship updated successfully");
      } else {
        const newId = newInternship.title.toLowerCase().replace(/\s+/g, "");
        const internshipToAdd = { ...internshipData, id: newId };
        await axios.post(`${API_BASE}/api/internships`, internshipToAdd, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true });
        setInternships([...internships, internshipToAdd]);
        setToast("Internship added successfully");
      }
      
      setEditingInternship(null);
      setNewInternship({ title: "", description: "", duration: "", mode: "", skills: "", projects: "", features: "", tech_stack: "", how_to_do: "", timeline_start: "", timeline_milestone: "", timeline_final: "" });
    } catch (error) {
      console.error("Error adding/updating internship:", error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/projects/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true });
      setProjects(projects.filter((project) => (project.id || project._id) !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDeleteInternship = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/internships/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true });
      setInternships(internships.filter((internship) => (internship.id || internship._id) !== id));
    } catch (error) {
      console.error("Error deleting internship:", error);
    }
  };

  if (errorMsg) return <div style={{color: 'red', background: '#fff3f3', padding: 24, borderRadius: 12, margin: 32, textAlign: 'center'}}><h2>Dashboard Error</h2><p>{errorMsg}</p><p>Please log out and log in with an admin account.</p></div>;

  return (
    <div style={styles.container}>
      {toast && <div style={styles.toast} onAnimationEnd={() => setToast("")}>{toast}</div>}
      {particlesReady && <Particles id="tsparticles" options={particleOptions} style={{ position: "absolute", zIndex: -1, top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}/>}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleContainer}><span style={styles.logoEmoji}>🦉</span><h1 style={styles.headerTitle}>Owl AI Admin Dashboard</h1></div>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </div>
        <div style={styles.tabs}><div style={styles.tabsContainer}>
          <button style={{...styles.tabButton, ...(activeTab === "projects" ? styles.activeTab : {})}} onClick={() => setActiveTab("projects")}>Projects</button>
          <button style={{...styles.tabButton, ...(activeTab === "internships" ? styles.activeTab : {})}} onClick={() => setActiveTab("internships")}>Internships</button>
          <button style={{...styles.tabButton, ...(activeTab === "users" ? styles.activeTab : {})}} onClick={() => setActiveTab("users")}>Users</button>
          <button style={{...styles.tabButton, ...(activeTab === "applications" ? styles.activeTab : {})}} onClick={() => setActiveTab("applications")}>Applications</button>
        </div></div>
      </header>

      <div style={styles.content}>{loading ? <p>Loading...</p> : <>
        {viewAppModal && <div style={styles.modalOverlay} onClick={() => setViewAppModal(null)}><div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ marginTop: 0, color: '#fff' }}>{viewAppModal.type === 'internship' ? 'Internship Application' : 'Project Application'}</h3>
          <div style={{ color: '#E5E7EB', marginBottom: 16, lineHeight: 1.6 }}>
            <div><strong>Applicant:</strong> {viewAppModal.app.applicant || viewAppModal.app.name}</div>
            <div><strong>Email:</strong> {viewAppModal.app.email}</div>
            <div><strong>{viewAppModal.type === 'internship' ? 'Internship' : 'Project'}:</strong>{' '}{viewAppModal.type === 'internship' ? viewAppModal.app.internshipTitle : viewAppModal.app.projectTitle}</div>
            <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{viewAppModal.app.status || 'in_process'}</span></div>
            {(viewAppModal.app.resume || viewAppModal.app.resumeName) && (
              <div style={{ marginTop: 8 }}>
                <a href={`${API_BASE}/uploads/${encodeURIComponent(viewAppModal.app.resume || viewAppModal.app.resumeName)}`} target="_blank" rel="noreferrer" style={styles.modalLink}>
                  Open Resume
                </a>
              </div>
            )}
          </div>
          {hasSubmissionData(viewAppModal.app) && (() => {
              const submission = viewAppModal.app.submission || {};
              const githubLink = submission.github_url || viewAppModal.app.githubLink;
              const liveLink = submission.live_url || viewAppModal.app.liveLink;
              const docsLink = submission.docs_url || viewAppModal.app.docsLink;
              const notes = submission.notes || viewAppModal.app.notes;
              return (<div style={styles.submissionSection}><h4 style={styles.submissionTitle}>📋 Submitted Work</h4><div style={styles.submissionGrid}>
                  {githubLink && <div style={styles.submissionItem}><div style={styles.submissionItemHeader}><span style={styles.submissionIcon}>🔗</span><strong style={styles.submissionLabel}>GitHub Repository</strong></div><a href={githubLink} target="_blank" rel="noreferrer" style={styles.submissionLink}>{githubLink}</a></div>}
                  {liveLink && <div style={styles.submissionItem}><div style={styles.submissionItemHeader}><span style={styles.submissionIcon}>🌐</span><strong style={styles.submissionLabel}>Live Demo</strong></div><a href={liveLink} target="_blank" rel="noreferrer" style={styles.submissionLink}>{liveLink}</a></div>}
                  {docsLink && <div style={styles.submissionItem}><div style={styles.submissionItemHeader}><span style={styles.submissionIcon}>📚</span><strong style={styles.submissionLabel}>Documentation</strong></div><a href={docsLink} target="_blank" rel="noreferrer" style={styles.submissionLink}>{docsLink}</a></div>}
                  {notes && <div style={styles.submissionItem}><div style={styles.submissionItemHeader}><span style={styles.submissionIcon}>📝</span><strong style={styles.submissionLabel}>Notes</strong></div><p style={styles.submissionNotes}>{notes}</p></div>}
              </div></div>)
          })()}
          <div style={{ display: 'flex', gap: 8, marginTop: '20px' }}>
            {(!viewAppModal.app.status || ['pending', 'in_process', 'submitted'].includes(viewAppModal.app.status)) && <>
              <button style={styles.approveButton} onClick={async ()=>{ try{ const endpoint = viewAppModal.type === 'internship' ? `${API_BASE}/api/internship_applications/${viewAppModal.app.id}/status` : `${API_BASE}/api/project_applications/${viewAppModal.app.id}/status`; await axios.put(endpoint, {status:'approved'}, { headers:{ Authorization: `Bearer ${localStorage.getItem('token')}` }, withCredentials:true }); if(viewAppModal.type === 'internship') setApplications(applications.map(a=>a.id===viewAppModal.app.id?{...a,status:'approved'}:a)); else setProjectApplications(projectApplications.map(a=>a.id===viewAppModal.app.id?{...a,status:'approved'}:a)); setViewAppModal(null); }catch(err){ console.error(err); } }}>Approve</button>
              <button style={styles.rejectButton} onClick={async ()=>{ try{ const endpoint = viewAppModal.type === 'internship' ? `${API_BASE}/api/internship_applications/${viewAppModal.app.id}/status` : `${API_BASE}/api/project_applications/${viewAppModal.app.id}/status`; await axios.put(endpoint, {status:'rejected'}, { headers:{ Authorization: `Bearer ${localStorage.getItem('token')}` }, withCredentials:true }); if(viewAppModal.type === 'internship') setApplications(applications.map(a=>a.id===viewAppModal.app.id?{...a,status:'rejected'}:a)); else setProjectApplications(projectApplications.map(a=>a.id===viewAppModal.app.id?{...a,status:'rejected'}:a)); setViewAppModal(null); }catch(err){ console.error(err); } }}>Reject</button>
            </>}
            <button onClick={()=>setViewAppModal(null)} style={{...styles.actionButton, backgroundColor:'#374151', marginLeft: 'auto'}}>Close</button>
          </div>
        </div></div>}
        
        {activeTab === "projects" && <div>
          <h2 style={styles.sectionTitle}>Manage Projects</h2>
          <div style={styles.formContainer}><h3 style={styles.formTitle}>Add New Project</h3>
            <form onSubmit={handleAddProject} style={styles.form}>
              <div style={styles.formGroup}><label style={styles.label}>Project Name:</label><input type="text" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required style={styles.input}/></div>
              <div style={styles.formGroup}><label>Description:</label><textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} required style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>Icon (emoji):</label><input type="text" value={newProject.icon} onChange={(e) => setNewProject({ ...newProject, icon: e.target.value })} style={styles.input}/></div>
              <div style={styles.formGroup}><label>Features:</label><textarea value={newProject.features} onChange={e => setNewProject({ ...newProject, features: e.target.value })} placeholder="Enter features in paragraph form." style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>Tech Stack:</label><textarea value={newProject.tech_stack} onChange={e => setNewProject({ ...newProject, tech_stack: e.target.value })} placeholder="Enter tech stack in paragraph form." style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>How To Do:</label><textarea value={newProject.how_to_do} onChange={e => setNewProject({ ...newProject, how_to_do: e.target.value })} placeholder="Instructions or steps for the project" style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>How to Submit:</label><textarea value={newProject.how_to_submit} onChange={e => setNewProject({ ...newProject, how_to_submit: e.target.value })} placeholder="How should the user submit the project?" style={styles.textarea}/></div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'10px'}}>
                <div style={styles.formGroup}><label>Timeline - Start:</label><input type="date" value={toInputDate(newProject.timeline_start)} onChange={e=>setNewProject({...newProject, timeline_start: fromInputDate(e.target.value)})} style={styles.input}/></div>
                <div style={styles.formGroup}><label>Timeline - Milestone:</label><input type="date" value={toInputDate(newProject.timeline_milestone)} onChange={e=>setNewProject({...newProject, timeline_milestone: fromInputDate(e.target.value)})} style={styles.input}/></div>
                <div style={styles.formGroup}><label>Timeline - Final:</label><input type="date" value={toInputDate(newProject.timeline_final)} onChange={e=>setNewProject({...newProject, timeline_final: fromInputDate(e.target.value)})} style={styles.input}/></div>
              </div>
              <button type="submit" style={styles.addButton}>{editingProject ? 'Update Project' : 'Add Project'}</button>
              {editingProject && <button type="button" onClick={() => { setEditingProject(null); setNewProject({ name: "", description: "", icon: "🔧", features: "", tech_stack: "", how_to_do: "", how_to_submit: "", timeline_start: "", timeline_milestone: "", timeline_final: "" }); }} style={{...styles.addButton, backgroundColor: '#6B7280', marginLeft: '10px'}}>Cancel</button>}
            </form>
          </div>
          <h3 style={{marginBottom: '20px'}}>Current Projects</h3>
          <div style={styles.grid}>{projects.map((project) => (
            <motion.div key={project.id || project._id} style={styles.cardAlt} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>{project.icon}</span><h3>{project.name}</h3>
                <div><span style={styles.applicationCount}>{projectApplications.filter(app => app.projectId === (project.id || project._id)).length} Applications</span>
                  <button onClick={() => { setEditingProject(project); setNewProject({ name: project.name || "", description: project.description || "", icon: project.icon || "🔧", features: Array.isArray(project.features) ? project.features.join('\n') : (project.features || ""), tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join('\n') : (project.tech_stack || ""), how_to_do: project.how_to_do || "", how_to_submit: project.how_to_submit || "", timeline_start: project.timeline?.start || "", timeline_milestone: project.timeline?.milestone || "", timeline_final: project.timeline?.final || "" }); }} style={{...styles.actionButton, marginRight: '5px'}}>Edit</button>
                  <button onClick={() => handleDeleteProject(project.id || project._id)} style={styles.deleteButton}>×</button>
                </div>
              </div>
              <div style={styles.projectDetailsContainer}>
                <div style={styles.detailSection}><strong>Description:</strong><div style={styles.descriptionText}>{project.description}</div></div>
                {project.features && project.features.length > 0 && <div style={styles.detailSection}><strong>✨ Features:</strong><div style={styles.badgeContainer}>{(Array.isArray(project.features) ? project.features : []).map((f, i) => <span key={i} style={styles.featureBadge}>{f.trim()}</span>)}</div></div>}
                {project.tech_stack && project.tech_stack.length > 0 && <div style={styles.detailSection}><strong>🛠️ Tech Stack:</strong><div style={styles.badgeContainer}>{(Array.isArray(project.tech_stack) ? project.tech_stack : []).map((t, i) => <span key={i} style={styles.techBadgeAdmin}>{t.trim()}</span>)}</div></div>}
                {project.how_to_do && <div style={styles.detailSection}><strong>📋 Implementation:</strong><div style={styles.implementationText}>{project.how_to_do}</div></div>}
              </div>
            </motion.div>
          ))}</div>
        </div>}
        
        {activeTab === "internships" && <div>
          <h2>Manage Internships</h2>
          <div style={styles.formContainer}><h3>{editingInternship ? 'Edit Internship' : 'Add New Internship'}</h3>
            <form onSubmit={handleAddInternship} style={styles.form}>
              <div style={styles.formGroup}><label>Internship Title:</label><input type="text" value={newInternship.title} onChange={(e) => setNewInternship({ ...newInternship, title: e.target.value })} required style={styles.input}/></div>
              <div style={styles.formGroup}><label>Description:</label><textarea value={newInternship.description} onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })} required style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>Duration:</label><input type="text" value={newInternship.duration} onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })} placeholder="e.g., 3 months" required style={styles.input}/></div>
              <div style={styles.formGroup}><label>Mode:</label><input type="text" value={newInternship.mode} onChange={(e) => setNewInternship({ ...newInternship, mode: e.target.value })} placeholder="e.g., Remote, Hybrid, On-site" required style={styles.input}/></div>
              <div style={styles.formGroup}><label>Skills:</label><textarea value={newInternship.skills} onChange={e => setNewInternship({ ...newInternship, skills: e.target.value })} placeholder="Enter skills in paragraph form." style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>Projects:</label><textarea value={newInternship.projects} onChange={e => setNewInternship({ ...newInternship, projects: e.target.value })} placeholder="Enter projects in paragraph form." style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>Features:</label><textarea value={newInternship.features} onChange={e => setNewInternship({ ...newInternship, features: e.target.value })} placeholder={"Enter features in paragraph form."} style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>Tech Stack:</label><textarea value={newInternship.tech_stack} onChange={e => setNewInternship({ ...newInternship, tech_stack: e.target.value })} placeholder={"Enter tech stack in paragraph form."} style={styles.textarea}/></div>
              <div style={styles.formGroup}><label>How To Do:</label><textarea value={newInternship.how_to_do} onChange={e => setNewInternship({ ...newInternship, how_to_do: e.target.value })} placeholder="Instructions or steps for the internship" style={styles.textarea}/></div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'10px'}}>
                <div style={styles.formGroup}><label>Timeline - Start:</label><input type="date" value={toInputDate(newInternship.timeline_start)} onChange={e => setNewInternship({...newInternship, timeline_start: fromInputDate(e.target.value)})} style={styles.input}/></div>
                <div style={styles.formGroup}><label>Timeline - Milestone:</label><input type="date" value={toInputDate(newInternship.timeline_milestone)} onChange={e => setNewInternship({...newInternship, timeline_milestone: fromInputDate(e.target.value)})} style={styles.input}/></div>
                <div style={styles.formGroup}><label>Timeline - Final:</label><input type="date" value={toInputDate(newInternship.timeline_final)} onChange={e => setNewInternship({...newInternship, timeline_final: fromInputDate(e.target.value)})} style={styles.input}/></div>
              </div>
              <button type="submit" style={styles.addButton}>{editingInternship ? 'Update Internship' : 'Add Internship'}</button>
              {editingInternship && <button type="button" onClick={() => { setEditingInternship(null); setNewInternship({ title: "", description: "", duration: "", mode: "", skills: "", projects: "", features: "", tech_stack: "", how_to_do: "", timeline_start: "", timeline_milestone: "", timeline_final: "" }); }} style={{...styles.addButton, backgroundColor: '#6B7280', marginLeft: '10px'}}>Cancel</button>}
            </form>
          </div>
          <h3 style={{marginBottom: '20px'}}>Current Internships</h3>
          <div style={styles.grid}>{internships.map((internship) => (
            <motion.div key={internship.id || internship._id} style={styles.cardAlt} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <div style={styles.cardHeader}><span style={styles.cardIcon}>💼</span><h3>{internship.title}</h3>
                <div>
                  <button onClick={() => { setEditingInternship(internship); }} style={{...styles.actionButton, marginRight: '5px'}}>Edit</button>
                  <button onClick={() => handleDeleteInternship(internship.id || internship._id)} style={styles.deleteButton}>×</button>
                </div>
              </div>
              <div style={styles.internshipDetailsContainer}>
                <div style={styles.detailSection}><strong>Description:</strong><div style={styles.descriptionText}>{internship.description}</div></div>
                <div style={styles.basicInfoGrid}>
                  <div style={styles.infoItem}><span style={styles.infoLabel}>⏱️ Duration:</span><span style={styles.infoValue}>{internship.duration}</span></div>
                  <div style={styles.infoItem}><span style={styles.infoLabel}>🌍 Mode:</span><span style={styles.infoValue}>{internship.mode}</span></div>
                </div>
                {internship.skills && internship.skills.length > 0 && <div style={styles.detailSection}><strong>🎯 Skills:</strong><div style={styles.badgeContainer}>{(Array.isArray(internship.skills) ? internship.skills : internship.skills.split(',')).map((skill, index) => <span key={index} style={styles.skillBadgeAdmin}>{skill.trim()}</span>)}</div></div>}
                {internship.projects && internship.projects.length > 0 && <div style={styles.detailSection}><strong>🚀 Sample Projects:</strong><div style={styles.badgeContainer}>{(Array.isArray(internship.projects) ? internship.projects : internship.projects.split(',')).map((project, index) => <span key={index} style={styles.projectBadgeAdmin}>{project.trim()}</span>)}</div></div>}
                {internship.features && internship.features.length > 0 && <div style={styles.detailSection}><strong>✨ Features:</strong><div style={styles.badgeContainer}>{(Array.isArray(internship.features) ? internship.features : internship.features.split(',')).map((f, i) => <span key={i} style={styles.featureBadge}>{f.trim()}</span>)}</div></div>}
                {internship.tech_stack && internship.tech_stack.length > 0 && <div style={styles.detailSection}><strong>🛠️ Tech Stack:</strong><div style={styles.badgeContainer}>{(Array.isArray(internship.tech_stack) ? internship.tech_stack : internship.tech_stack.split(',')).map((t, i) => <span key={i} style={styles.techBadgeAdmin}>{t.trim()}</span>)}</div></div>}
                {internship.how_to_do && <div style={styles.detailSection}><strong>📋 Implementation Guide:</strong><div style={styles.implementationText}>{internship.how_to_do}</div></div>}
                <div style={styles.applicationCount}><strong>📊 Applications:</strong> {applications.filter(app => app.internshipId === (internship.id || internship._id)).length}</div>
              </div>
            </motion.div>
          ))}</div>
        </div>}
        
        {activeTab === "users" && <div><h2>Registered Users</h2>
          <table style={styles.table}><thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Join Date</th><th>Actions</th></tr></thead>
            <tbody>{users.map((user) => (
              <tr key={user.id || user._id}><td>{user.id}</td><td>{user.email}</td><td>{user.name}</td><td>{user.joinDate}</td><td><button style={styles.actionButton} onClick={() => setViewUserModal(user)}>View</button></td></tr>
            ))}</tbody>
          </table>
        </div>}
        
        {viewUserModal && <div style={styles.modalOverlay} onClick={() => setViewUserModal(null)}><div style={{...styles.modal, maxWidth: 520}} onClick={(e)=>e.stopPropagation()}>
          <h3 style={{marginTop: 0}}>User Details</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {viewUserModal.profilePicture ? <img src={viewUserModal.profilePicture} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#fff', fontWeight: 700 }}>{(viewUserModal.name || viewUserModal.email || 'U').split(' ').map(s=>s[0]).join('').toUpperCase()}</span>}
            </div>
            <div>
              <div><strong>ID:</strong> {viewUserModal.id}</div><div><strong>Name:</strong> {viewUserModal.name || '-'}</div><div><strong>Email:</strong> {viewUserModal.email}</div><div><strong>Joined:</strong> {viewUserModal.joinDate}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button style={styles.actionButton} onClick={()=> setViewUserModal(null)}>Close</button></div>
        </div></div>}
        
        {activeTab === "applications" && <div>
          <h2 style={styles.sectionTitle}>Internship Applications</h2>
          <table style={styles.table}><thead><tr><th>ID</th><th>Internship</th><th>Applicant</th><th>Email</th><th>Resume</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{applications.map((app) => (
              <tr key={app.id || app._id}>
                <td>{app.id}</td><td>{app.internshipTitle}</td><td>{app.applicant}</td><td>{app.email}</td><td>{app.resume}</td><td>{new Date(app.date).toLocaleDateString('en-GB')}</td>
                <td><span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "capitalize",
                  backgroundColor: app.status === "completed" ? "#10b98120" : app.status === "approved" ? "#10b98120" : app.status === "rejected" ? "#ef444420" : app.status === "submitted" ? "#3b82f620" : "#fcd34d20",
                  color: app.status === "completed" ? "#10B981" : app.status === "approved" ? "#10B981" : app.status === "rejected" ? "#EF4444" : app.status === "submitted" ? "#60A5FA" : "#FCD34D"
                }}>{app.status || "pending"}</span></td>
                <td><div style={{ display: "flex", gap: "5px" }}>
                  <button style={styles.actionButton} onClick={() => setViewAppModal({ type: 'internship', app })}>View</button>
                  {(!app.status || ['pending', 'in_process', 'submitted'].includes(app.status)) && <>
                    <button style={styles.approveButton} onClick={async () => { try { await axios.put(`${API_BASE}/api/internship_applications/${app._id || app.id}/status`, { status: "approved" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}, withCredentials: true }); setApplications(applications.map(a => (a._id === app._id || a.id === app.id) ? {...a, status: "approved"} : a)); } catch (error) { console.error("Error updating status:", error); } }}>Approve</button>
                    <button style={styles.rejectButton} onClick={async () => { try { await axios.put(`${API_BASE}/api/internship_applications/${app._id || app.id}/status`, { status: "rejected" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true }); setApplications(applications.map(a => (a._id === app._id || a.id === app.id) ? {...a, status: "rejected"} : a)); } catch (error) { console.error("Error updating status:", error); } }}>Reject</button>
                  </>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
          <h2 style={{...styles.sectionTitle, marginTop: '40px'}}>Project Applications</h2>
          <table style={styles.table}><thead><tr><th>ID</th><th>Project</th><th>Applicant</th><th>Email</th><th>Resume</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{projectApplications.map((app) => (
              <tr key={app.id || app._id}>
                <td>{app.id || app._id || '-'}</td><td>{app.projectTitle}</td><td>{app.applicant}</td><td>{app.email}</td><td>{app.resumeName || app.resume || '-'}</td><td>{app.date ? new Date(app.date).toLocaleDateString('en-GB') : '-'}</td>
                <td><span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "capitalize",
                  backgroundColor: app.status === "completed" ? "#10b98120" : app.status === "approved" ? "#10b98120" : app.status === "rejected" ? "#ef444420" : app.status === "submitted" ? "#3b82f620" : "#fcd34d20",
                  color: app.status === "completed" ? "#10B981" : app.status === "approved" ? "#10B981" : app.status === "rejected" ? "#EF4444" : app.status === "submitted" ? "#60A5FA" : "#FCD34D"
                }}>{app.status || "pending"}</span></td>
                <td><div style={{ display: "flex", gap: "5px" }}>
                  <button style={styles.actionButton} onClick={() => setViewAppModal({ type: 'project', app })}>View</button>
                  {(!app.status || ['pending', 'submitted', 'in_process'].includes(app.status)) && <>
                    <button style={styles.approveButton} onClick={async () => { try { await axios.put(`${API_BASE}/api/project_applications/${app._id || app.id}/status`, { status: "approved" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true }); setProjectApplications(projectApplications.map(p => (p._id === app._id || p.id === app.id) ? {...p, status: "approved"} : p)); } catch (error) { console.error("Error updating status:", error); } }}>Approve</button>
                    <button style={styles.rejectButton} onClick={async () => { try { await axios.put(`${API_BASE}/api/project_applications/${app._id || app.id}/status`, { status: "rejected" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, withCredentials: true }); setProjectApplications(projectApplications.map(p => (p._id === app._id || p.id === app.id) ? {...p, status: "rejected"} : p)); } catch (error) { console.error("Error updating status:", error); } }}>Reject</button>
                  </>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
      </>}</div>
    </div>
  );
}

// Styles object is assumed to be complete and correct. No changes needed.
const styles = {
  container: { minHeight: "100vh", backgroundColor: "transparent", color: "#fff", padding: "0", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden", width: "100%" },
  internshipDetails: { marginTop: "15px", padding: "10px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "8px" },
  skillsList: { display: "flex", flexWrap: "wrap", gap: "5px", listStyle: "none", padding: "0", margin: "5px 0 15px 0" },
  skillItem: { backgroundColor: "rgba(139, 92, 246, 0.3)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem" },
  header: { width: "100%", backgroundColor: "rgba(26, 27, 38, 0.9)", padding: "10px 0 0 0", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", position: "sticky", top: 0, zIndex: 100 },
  headerContent: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", maxWidth: "1200px", margin: "0 auto" },
  titleContainer: { display: "flex", alignItems: "center", gap: "10px" },
  logoEmoji: { fontSize: "2.2rem", color: "#7F5AF0", marginRight: "10px" },
  headerTitle: { fontSize: "1.5rem", margin: 0, color: "#fff", fontWeight: "600", letterSpacing: "0.5px" },
  logoutButton: { padding: "6px 12px", backgroundColor: "transparent", border: "1px solid #7F5AF0", borderRadius: "4px", color: "#7F5AF0", cursor: "pointer", transition: "all 0.3s", fontSize: "14px" },
  tabs: { width: "100%", backgroundColor: "rgba(26, 27, 38, 0.8)", marginTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" },
  tabsContainer: { display: "flex", maxWidth: "1200px", margin: "0 auto", paddingLeft: "20px" },
  tabButton: { padding: "12px 24px", backgroundColor: "transparent", border: "none", borderBottom: "3px solid transparent", color: "#fff", fontSize: "16px", fontWeight: "500", cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.5px" },
  activeTab: { borderBottom: "3px solid #7F5AF0", fontWeight: "bold", backgroundColor: "rgba(127, 90, 240, 0.1)" },
  content: { padding: "30px 20px", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", maxWidth: "1200px", margin: "20px auto", backgroundColor: "rgba(11, 15, 25, 0.4)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" },
  sectionTitle: { fontSize: "24px", fontWeight: "600", marginBottom: "20px", color: "#fff", borderBottom: "2px solid rgba(127, 90, 240, 0.5)", paddingBottom: "10px", display: "inline-block" },
  formTitle: { fontSize: "18px", fontWeight: "500", marginBottom: "15px", color: "#fff" },
  label: { display: "block", marginBottom: "5px", fontSize: "14px", color: "#ccc" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" },
  card: { backgroundColor: "rgba(35, 36, 58, 0.8)", borderRadius: "10px", padding: "20px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  cardIcon: { fontSize: "24px", marginRight: "10px" },
  deleteButton: { backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#FCA5A5", border: "none", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px" },
  cardAlt: { backgroundColor: "rgba(35, 36, 58, 0.6)", borderRadius: "10px", padding: "20px", marginBottom: "20px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
  formContainer: { backgroundColor: "rgba(35, 36, 58, 0.8)", borderRadius: "10px", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", border: "1px solid rgba(255, 255, 255, 0.1)" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.1)", backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#fff", width: "100%", fontSize: "14px" },
  textarea: { padding: "10px", borderRadius: "4px", border: "1px solid rgba(255, 255, 255, 0.1)", backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#fff", width: "100%", minHeight: "100px", resize: "vertical", fontSize: "14px" },
  addButton: { padding: "8px 16px", backgroundColor: "#7F5AF0", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500", marginTop: "10px", alignSelf: "flex-start", fontSize: "14px" },
  toast: { position: "fixed", top: "20px", right: "20px", backgroundColor: "#10B981", color: "#fff", padding: "10px 14px", borderRadius: "6px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", zIndex: 1000, animation: "fadeout 2.2s forwards" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "20px", backgroundColor: "rgba(35, 36, 58, 0.6)", borderRadius: "10px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", overflow: "hidden" },
  actionButton: { padding: "5px 10px", backgroundColor: "#7F5AF0", border: "none", borderRadius: "4px", color: "#fff", cursor: "pointer", fontSize: "12px", transition: "background-color 0.2s" },
  applicationCount: { fontSize: "0.8rem", color: "#ccc", marginRight: "10px" },
  approveButton: { backgroundColor: "#10B981", color: "#fff", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background-color 0.2s" },
  rejectButton: { backgroundColor: "#EF4444", color: "#fff", padding: "5px 10px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", transition: "background-color 0.2s" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalCard: { backgroundColor: "rgba(26, 27, 38, 0.95)", color: "#fff", padding: "24px", borderRadius: "12px", width: "520px", maxWidth: "95vw", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", border: "1px solid rgba(255, 255, 255, 0.15)", backdropFilter: "blur(10px)" },
  projectDetailsContainer: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" },
  internshipDetailsContainer: { display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" },
  detailSection: { display: "flex", flexDirection: "column", gap: "8px" },
  descriptionText: { color: "#e2e8f0", fontSize: "0.9rem", lineHeight: "1.5", padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" },
  basicInfoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  infoItem: { display: "flex", flexDirection: "column", gap: "4px", padding: "10px", background: "rgba(127,90,240,0.1)", borderRadius: "8px", border: "1px solid rgba(127,90,240,0.2)" },
  infoLabel: { fontSize: "0.8rem", color: "#a5b4fc", fontWeight: "500" },
  infoValue: { fontSize: "0.9rem", color: "#fff", fontWeight: "600" },
  badgeContainer: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" },
  skillBadgeAdmin: { padding: "6px 12px", background: "linear-gradient(135deg, rgba(127,90,240,0.2), rgba(95,187,252,0.2))", borderRadius: "16px", border: "1px solid rgba(127,90,240,0.3)", color: "#e2e8f0", fontSize: "0.8rem", fontWeight: "500", whiteSpace: "nowrap" },
  projectBadgeAdmin: { padding: "6px 12px", background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.2))", borderRadius: "16px", border: "1px solid rgba(34,197,94,0.3)", color: "#d1fae5", fontSize: "0.8rem", fontWeight: "500", whiteSpace: "nowrap" },
  featureBadge: { padding: "6px 12px", background: "linear-gradient(135deg, rgba(245,101,101,0.2), rgba(251,146,60,0.2))", borderRadius: "16px", border: "1px solid rgba(245,101,101,0.3)", color: "#fed7d7", fontSize: "0.8rem", fontWeight: "500", whiteSpace: "nowrap" },
  techBadgeAdmin: { padding: "6px 12px", background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2))", borderRadius: "16px", border: "1px solid rgba(59,130,246,0.3)", color: "#bfdbfe", fontSize: "0.8rem", fontWeight: "500", whiteSpace: "nowrap" },
  implementationText: { color: "#e2e8f0", fontSize: "0.9rem", lineHeight: "1.5", padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "pre-wrap" },
  modalLink: { color: '#60A5FA', textDecoration: 'none', fontWeight: '500' },
  submissionSection: { marginTop: '20px', padding: '16px', backgroundColor: 'rgba(95, 187, 252, 0.05)', borderRadius: '8px', border: '1px solid rgba(95, 187, 252, 0.2)' },
  submissionTitle: { margin: '0 0 16px 0', color: '#60A5FA', fontSize: '1.1rem', fontWeight: '600', borderBottom: '1px solid rgba(95, 187, 252, 0.2)', paddingBottom: '8px' },
  submissionGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  submissionItem: { padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' },
  submissionItemHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  submissionIcon: { fontSize: '1.2rem', color: '#93C5FD' },
  submissionLabel: { color: '#E5E7EB', fontWeight: '500' },
  submissionLink: { color: '#93C5FD', textDecoration: 'none', fontSize: '0.9rem', wordBreak: 'break-all', transition: 'color 0.2s', },
  submissionNotes: { color: '#D1D5DB', fontSize: '0.9rem', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5, paddingTop: '4px' },
};
