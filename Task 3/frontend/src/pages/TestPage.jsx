import React from 'react';

const TestPage = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0B0F19',
      color: '#fff',
      padding: '0',
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      width: '100%',
      backgroundColor: 'rgba(35, 36, 58, 0.9)',
      borderBottom: '3px solid #7F5AF0',
      padding: '15px 0',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoEmoji: {
      fontSize: '2.5rem',
      color: '#7F5AF0',
    },
    headerTitle: {
      fontSize: '1.2rem',
      margin: 0,
      color: '#fff',
      fontWeight: '500',
    },
    content: {
      padding: '30px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#fff',
      borderBottom: '2px solid rgba(127, 90, 240, 0.5)',
      paddingBottom: '10px',
      display: 'inline-block',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleContainer}>
            <span style={styles.logoEmoji}>🦉</span>
            <h1 style={styles.headerTitle}>Owl AI Test Page</h1>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Test Section</h2>
        <p>This is a test page to verify styling.</p>
      </div>
    </div>
  );
};

export default TestPage;