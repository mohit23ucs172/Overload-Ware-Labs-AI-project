import React, { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import ProfilePictureModal from "../components/ProfilePictureModal";
import { motion } from "framer-motion";

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(part => part[0]).join("").toUpperCase();
};

const API_BASE = "https://owl-task3.onrender.com";

export default function Dashboard() {
  const { logout, userProfile, updateProfile, setUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appliedItems, setAppliedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState(null);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");
        const headers = { Authorization: `Bearer ${token}` };

        const [projectsRes, internshipsRes, appliedRes] = await Promise.all([
          fetch(`${API_BASE}/api/projects`, { headers }),
          fetch(`${API_BASE}/api/internships`, { headers }),
          fetch(`${API_BASE}/api/my_applications`, { headers }),
        ]);

        if (!projectsRes.ok) throw new Error(`Failed to fetch projects: ${projectsRes.statusText}`);
        if (!internshipsRes.ok) throw new Error(`Failed to fetch internships: ${internshipsRes.statusText}`);
        if (!appliedRes.ok) throw new Error(`Failed to fetch applications: ${appliedRes.statusText}`);
        
        setProjects(await projectsRes.json());
        setInternships(await internshipsRes.json());
        setAppliedItems(await appliedRes.json());

      } catch (error) {
        console.error("Error fetching data:", error);
        setErrMsg("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('[data-profile-container]')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const particleOptions = useMemo(() => ({
      background: { color: { value: "#0B0F19" } },
      fpsLimit: 60,
      interactivity: { events: { onHover: { enable: true, mode: "repulse" }}},
      particles: { number: { value: 100 }, color: { value: "#ffffff" }, shape: { type: "circle" }, opacity: { value: 0.8, random: true }, size: { value: { min: 1, max: 2.5 } }, move: { enable: true, speed: 0.3, random: true }},
    }),[]
  );

  const getInternshipCardStatus = (status) => {
    switch (status) {
      case 'completed': return { text: 'Finished', color: '#34D399' };
      case 'approved': return { text: 'Approved', color: '#10B981' };
      case 'resubmit': return { text: 'Resubmit', color: '#F59E0B' };
      default: return { text: 'Applied', color: '#5fbbfc' };
    }
  };

  return (
    <div style={styles.container}>
      {particlesReady && <Particles id="tsparticles" options={particleOptions} style={{ position: "absolute", inset: 0, zIndex: 0 }} />}
      
      {showPictureModal && (
        <ProfilePictureModal
          isOpen={showPictureModal}
          onClose={() => setShowPictureModal(false)}
          onSave={async (imageData) => {
            try {
              await updateProfile({ ...userProfile, profilePicture: imageData.image });
              setUserProfile(prev => ({ ...prev, profilePicture: imageData.image }));
              setShowPictureModal(false);
            } catch (error) {
              console.error('Error updating profile picture:', error);
            }
          }}
          currentPicture={userProfile?.profilePicture}
        />
      )}
      
      {showProjectModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProjectModal(null)}>
          <div style={styles.modalContentCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ color: '#333', margin: 0 }}>Application Details</h2>
                <button onClick={() => setShowProjectModal(null)} style={styles.closeButton}>&times;</button>
            </div>
            <div style={styles.modalBody}>
                <p><strong>Title:</strong> {showProjectModal.internshipTitle || showProjectModal.projectTitle}</p>
                <p><strong>Type:</strong> {showProjectModal.type === 'internship' ? 'Internship' : 'Project'}</p>
                <p><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: '#10B981', fontWeight: 'bold' }}>{showProjectModal.status}</span></p>
                <p><strong>Applied On:</strong> {new Date(showProjectModal.date).toLocaleDateString()}</p>
                <hr style={styles.modalDivider} />
                <h3 style={{ color: '#333' }}>Your Submission</h3>
                <p><strong>GitHub:</strong> {showProjectModal.githubLink ? <a href={showProjectModal.githubLink} target="_blank" rel="noopener noreferrer">{showProjectModal.githubLink}</a> : 'Not submitted'}</p>
                <p><strong>Live URL:</strong> {showProjectModal.liveLink ? <a href={showProjectModal.liveLink} target="_blank" rel="noopener noreferrer">{showProjectModal.liveLink}</a> : 'Not submitted'}</p>
                <p><strong>Notes:</strong> {showProjectModal.notes || 'No notes provided.'}</p>
            </div>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={styles.glassCard}>
        
        <div style={styles.headerSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ width: "48px" }}></div>
            <h1 style={styles.title}>🦉 Welcome to Owl AI Dashboard</h1>
            <div style={styles.profileContainer} data-profile-container>
              <div 
                style={{
                  ...styles.profileCircle,
                  ...(isProfileHovered ? styles.profileCircleHover : {}),
                  ...(userProfile?.profilePicture ? {
                    backgroundImage: `url(${userProfile.profilePicture})`,
                  } : {})
                }}
                onClick={() => setShowProfileDropdown(prev => !prev)}
                onMouseEnter={() => setIsProfileHovered(true)}
                onMouseLeave={() => setIsProfileHovered(false)}
              >
                {!userProfile?.profilePicture && (
                  <span style={styles.profileInitial}>
                    {userProfile?.name ? getInitials(userProfile.name) : "U"}
                  </span>
                )}
              </div>
              {showProfileDropdown && (
                <div style={styles.profileDropdown}>
                  <button style={{...styles.dropdownItem, ...(hoveredDropdownItem === 'profile' ? styles.dropdownItemHover : {})}} onMouseEnter={() => setHoveredDropdownItem('profile')} onMouseLeave={() => setHoveredDropdownItem(null)} onClick={() => { setShowProfileDropdown(false); navigate("/profile"); }}>
                    View Profile
                  </button>
                  <button style={{...styles.dropdownItem, ...(hoveredDropdownItem === 'picture' ? styles.dropdownItemHover : {})}} onMouseEnter={() => setHoveredDropdownItem('picture')} onMouseLeave={() => setHoveredDropdownItem(null)} onClick={() => { setShowProfileDropdown(false); setShowPictureModal(true); }}>
                    Change Picture
                  </button>
                  <button style={{...styles.dropdownItem, ...styles.dropdownItemLogout, ...(hoveredDropdownItem === 'logout' ? styles.dropdownItemHover : {})}} onMouseEnter={() => setHoveredDropdownItem('logout')} onMouseLeave={() => setHoveredDropdownItem(null)} onClick={() => { setShowProfileDropdown(false); logout(navigate); }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={styles.glowrodDivider} />
          <p style={styles.subtitle}>
            Track your internships, projects, and learning journey
          </p>
        </div>

        <div style={styles.gridSection}>
          <div>
            <h2 style={styles.sectionTitle}>🎓 Internships & Projects Applied</h2>
            <div style={styles.glowrodDivider} />
            {loading ? <p>Loading applications...</p> : appliedItems.length > 0 ? (
              appliedItems.map((application) => {
                const status = application.status || "in_process";
                
                const statusConfig = {
                  in_process: { text: "Submitted", color: "#FCD34D" },
                  submitted: { text: "Submitted", color: "#60A5FA" },
                  approved: { text: "Approved", color: "#10B981" },
                  rejected: { text: "Rejected", color: "#EF4444" },
                  completed: { text: "Successfully Finished 🎉", color: "#34D399" },
                  resubmit: { text: "Rejected - Re-submit", color: "#F59E0B" },
                };
                
                const currentStatus = statusConfig[status] || statusConfig.in_process;
                const isInternship = application.type === 'internship';
                const title = isInternship ? application.internshipTitle : application.projectTitle;
                const id = isInternship ? application.internshipId : application.projectId;
                const link = isInternship ? `/internship/${id}` : `/project/${id}`;

                return (
                    <div key={application.id || application._id} style={{ ...styles.appliedCard, boxShadow: `0 2px 24px ${currentStatus.color}22`, border: `1px solid ${currentStatus.color}25` }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 10, justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: "1.5rem" }}>{isInternship ? '🎓' : '🚀'}</span>
                                <h3 style={styles.appliedTitle}>{title}</h3>
                            </div>
                            <div style={{ backgroundColor: `${currentStatus.color}20`, color: currentStatus.color, ...styles.statusBadge }}>
                                {currentStatus.text}
                            </div>
                        </div>
                        <p style={styles.appliedMeta}>Applied on: {application.date ? new Date(application.date).toLocaleDateString('en-GB') : 'N/A'}</p>
                        <p style={styles.appliedMeta}>Resume: {application.resumeName || "-"}</p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                            <button style={styles.smallButton} onClick={() => navigate(link)}>
                                {status === 'completed' ? 'View Submission' : `View ${isInternship ? 'Internship' : 'Project'}`}
                            </button>
                            {status === "approved" && (
                                <button style={{ ...styles.smallButton, background: "linear-gradient(90deg, #10B981, #059669)" }} onClick={() => setShowProjectModal(application)}>
                                    View Details
                                </button>
                            )}
                        </div>
                    </div>
                );
              })
            ) : (
              <div style={styles.appliedCard}><p>You haven't applied to any internships or projects yet.</p></div>
            )}
          </div>

          <div style={styles.glowrodDivider} />

          <div>
            <h2 style={styles.sectionTitle}>📚 Internships</h2>
            <div style={styles.glowrodDivider} />
            <div style={styles.gridCards}>
              {loading ? <p>Loading internships...</p> : internships.map((internship) => {
                const internshipObjectId = internship.id || internship._id;

                // FIXED: Robust matching logic. It first tries to match by ID,
                // and if that fails, it falls back to matching by title.
                const applied = appliedItems.find(app => {
                    if (app.type !== 'internship') return false;
                    
                    // Primary Match: By ID
                    const internshipIdInApp = app.internshipId || app.internship_id;
                    if (internshipIdInApp && String(internshipIdInApp) === String(internshipObjectId)) {
                        return true;
                    }

                    // Fallback Match: By Title (handles data inconsistency)
                    const internshipTitle = internship.title;
                    const appTitle = app.internshipTitle;
                    if (internshipTitle && appTitle && internshipTitle.trim().toLowerCase() === appTitle.trim().toLowerCase()) {
                        return true;
                    }

                    return false;
                });

                return (
                  <motion.div key={internshipObjectId} whileHover={{ scale: 1.05, y: -6 }} style={{...styles.card, display: 'flex', flexDirection: 'column'}}>
                    <span style={styles.cardEmoji}>{internship.icon || "💻"}</span>
                    <h3 style={{ marginBottom: 12, fontWeight: 700 }}>{internship.title}</h3>
                    <p style={styles.meta}>{internship.description}</p>
                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                      <p style={styles.meta}><strong>Duration:</strong> {internship.duration}</p>
                      <p style={styles.meta}><strong>Mode:</strong> {internship.mode}</p>
                      {applied ? (
                          <div style={{...styles.statusLabel, color: getInternshipCardStatus(applied.status).color}}>
                              {getInternshipCardStatus(applied.status).text}
                          </div>
                      ) : (
                          <Link to={`/internship/${internshipObjectId}`} state={{ ...internship }} style={{ textDecoration: 'none' }}>
                              <button style={styles.button}>View Details</button>
                          </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div style={styles.glowrodDivider} />
          
          <div>
            <h2 style={styles.sectionTitle}>🚀 Projects</h2>
            <div style={styles.glowrodDivider} />
            <div style={styles.gridCards}>
                {loading ? <p>Loading projects...</p> : projects.map((proj) => {
                    const projectId = proj.id || proj._id;
                    const applied = appliedItems.find(app => {
                        if (app.type !== 'project') return false;

                        // Primary Match: By ID
                        if (app.projectId && String(app.projectId) === String(projectId)) {
                            return true;
                        }

                        // Fallback Match: By Title
                        const projectTitle = proj.title || proj.name;
                        const appTitle = app.projectTitle;
                        if (projectTitle && appTitle && projectTitle.trim().toLowerCase() === appTitle.trim().toLowerCase()) {
                            return true;
                        }

                        return false;
                    });
                    
                    return (
                        <motion.div key={projectId} whileHover={{ scale: 1.05, y: -6 }} style={{...styles.card, display: 'flex', flexDirection: 'column'}} onClick={() => navigate(`/project/${projectId}`, { state: { ...proj } })}>
                            <span style={styles.cardEmoji}>{proj.icon || "🔧"}</span>
                            <h3 style={{ marginBottom: 12, fontWeight: 700 }}>{proj.name || proj.title}</h3>
                            <p style={styles.meta}>{proj.description}</p>
                            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                                {applied ? (
                                    <div style={{...styles.statusLabel, color: applied.status === 'completed' ? '#34D399' : '#5fbbfc'}}>
                                        {applied.status === 'completed' ? 'Finished' : 'Applied'}
                                    </div>
                                ) : (
                                    <button style={styles.button} onClick={(e) => { e.stopPropagation(); navigate(`/project/${projectId}`, { state: { ...proj } }); }}>
                                        Open
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modalContentCard: { background: "#fff", color: "#333", borderRadius: 12, padding: "20px 25px", width: "90%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto", fontFamily: "Inter, sans-serif", textAlign: 'left'},
    modalBody: { lineHeight: 1.6, fontSize: '1rem' },
    modalDivider: { border: 'none', borderTop: '1px solid #eee', margin: '15px 0' },
    closeButton: { background: 'transparent', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#888' },
    glowrodDivider: { width: "100%", height: 2, background: "linear-gradient(90deg, transparent, #7f5af0, #5fbbfc, transparent)", boxShadow: "0 0 12px #7f5af0aa", margin: "28px 0 32px 0" },
    container: { minHeight: "100vh", width: "100vw", margin: 0, padding: 0, background: "linear-gradient(-45deg, #181a20, #1f2230, #23243a, #181a20)", backgroundSize: "400% 400%", animation: "gradientFlow 20s ease infinite", fontFamily: "Inter, sans-serif", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" },
    glassCard: { background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(16px)", borderRadius: 20, padding: "40px 32px 32px 32px", width: "90vw", maxWidth: 1300, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", color: "#fff", textAlign: "center", zIndex: 1, margin: "40px 0" },
    headerSection: { width: "100%", padding: "32px 0 18px 0", textAlign: "center", zIndex: 2 },
    gridSection: { width: "100%", maxWidth: 1200, display: "grid", gridTemplateColumns: "1fr", gap: "48px 32px", margin: "0 auto", padding: "0 32px 48px 32px", zIndex: 2 },
    gridCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, justifyContent: "center", marginBottom: 16 },
    title: { fontSize: "2.8rem", fontWeight: 800, letterSpacing: "1.5px", marginBottom: 18, background: "linear-gradient(90deg, #7f5af0 30%, #5fbbfc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "0 2px 16px rgba(127,90,240,0.12)" },
    subtitle: { color: "#a5b4fc", fontSize: "1.25rem", marginBottom: 32, fontWeight: 500, letterSpacing: "0.5px" },
    sectionTitle: { margin: "38px 0 18px 0", fontSize: "1.6rem", fontWeight: 700, color: "#fff", textAlign: "left" },
    card: { background: "rgba(35,36,58,0.8)", borderRadius: 18, padding: "28px 24px", textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.25)", backdropFilter: "blur(16px)", color: "#fff", transition: "all 0.3s ease-in-out", border: "1px solid rgba(255,255,255,0.1)", cursor: 'pointer' },
    button: { marginTop: 16, padding: "10px 20px", border: "none", borderRadius: 10, background: "linear-gradient(90deg, #3B82F6, #8B5CF6)", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", boxShadow: "0 4px 12px rgba(91, 149, 255, 0.35)" },
    smallButton: { background: "linear-gradient(90deg, #7f5af0, #5fbbfc)", color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: "0.95rem", padding: "8px 18px", border: "none", boxShadow: "0 2px 8px #7f5af0a0", cursor: "pointer" },
    cardEmoji: { position: "absolute", top: 18, right: 18, fontSize: "1.5rem" },
    meta: { fontSize: "0.95rem", color: "#a5b4fc", marginBottom: 10, lineHeight: 1.6 },
    profileContainer: { position: "relative", zIndex: 10 },
    profileCircle: { width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#7f5af0", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(127, 90, 240, 0.4)", transition: "all 0.2s ease", border: "2px solid rgba(255, 255, 255, 0.2)", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' },
    profileCircleHover: { transform: "scale(1.05)" },
    profileInitial: { color: "#fff", fontSize: "1.5rem", fontWeight: "bold" },
    profileDropdown: { position: "absolute", top: "60px", right: "0", width: "200px", backgroundColor: "rgba(35, 36, 58, 0.95)", borderRadius: "12px", boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)", backdropFilter: "blur(16px)", overflow: "hidden", zIndex: 100 },
    dropdownItem: { width: "100%", padding: "12px 16px", textAlign: "left", backgroundColor: "transparent", border: "none", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", fontSize: "1rem", cursor: "pointer", transition: "background-color 0.2s ease" },
    dropdownItemHover: { backgroundColor: "rgba(127, 90, 240, 0.2)" },
    dropdownItemLogout: { borderBottom: "none", color: "#ff5f56" },
    appliedCard: { background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px", margin: "0 auto 20px auto", textAlign: 'left' },
    appliedTitle: { fontWeight: 700, fontSize: "1.2rem", color: "#fff", margin: 0 },
    appliedMeta: { color: "#ccc", margin: "8px 0 0 0", fontSize: '0.9rem' },
    statusBadge: { padding: "4px 12px", borderRadius: "12px", fontWeight: "600", fontSize: "0.85rem" },
    statusLabel: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px', fontWeight: 600, fontSize: '1.1rem' },
};
