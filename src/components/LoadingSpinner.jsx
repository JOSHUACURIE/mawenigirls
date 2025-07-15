import React from 'react';

const LoadingSpinner = ({ size = 40, color = '#3498db' }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `4px solid #f3f3f3`,
          borderTop: `4px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;

// Add to your global CSS or in the component:
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }