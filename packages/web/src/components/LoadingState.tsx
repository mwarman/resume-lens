const LoadingState = () => {
  const skeletonStyles: React.CSSProperties = {
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  const headingSkeletonStyles: React.CSSProperties = {
    ...skeletonStyles,
    height: '24px',
    marginBottom: '12px',
    width: '60%',
  };

  const lineSkeletonStyles: React.CSSProperties = {
    ...skeletonStyles,
    height: '12px',
    marginBottom: '8px',
  };

  const containerStyles: React.CSSProperties = {
    padding: '24px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    minHeight: '350px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const messageStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    marginTop: '16px',
    fontStyle: 'italic',
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      <div style={containerStyles}>
        <div>
          <div style={headingSkeletonStyles} />
          <div style={{ ...lineSkeletonStyles, marginBottom: '12px' }} />
          <div style={{ ...lineSkeletonStyles, width: '90%', marginBottom: '12px' }} />
          <div style={{ ...lineSkeletonStyles, width: '85%', marginBottom: '16px' }} />

          <div style={{ ...headingSkeletonStyles, marginTop: '20px' }} />
          <div style={{ ...lineSkeletonStyles, marginBottom: '12px' }} />
          <div style={{ ...lineSkeletonStyles, width: '90%', marginBottom: '12px' }} />
          <div style={{ ...lineSkeletonStyles, width: '80%' }} />
        </div>
        <div style={messageStyles}>Analyzing your résumé…</div>
      </div>
    </>
  );
};

export default LoadingState;
