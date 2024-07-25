import React from 'react';

const LoadingPopup = () => {
  return (
    <div style={popupStyle}>
      <div style={overlayStyle}>
        <div style={popupContentStyle}>
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
};

const popupStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000
};

const overlayStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%'
};

const popupContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '5px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
};

export default LoadingPopup;
