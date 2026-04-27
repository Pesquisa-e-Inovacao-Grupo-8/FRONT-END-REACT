import React, { useEffect } from 'react';

const VLibras = () => {
  useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.async = true;
  script.onload = () => {
    if (window.VLibras && !window.vlibrasWidget) {
       window.vlibrasWidget = new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
  };
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
    delete window.vlibrasWidget;
  };
}, []);

  return (
    <div vw="true" className="enabled">
      <div vw-access-button="true" className="active"></div>
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
};

export default VLibras;