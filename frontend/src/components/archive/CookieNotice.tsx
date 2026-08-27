'use client';

import { useEffect, useState } from 'react';
import './CookieNotice.css';

const CookieNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookieAccepted');
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieAccepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-notice">
      <span>Мы используем cookie</span>
      <button onClick={handleAccept}>Хорошо</button>
    </div>
  );
};

export default CookieNotice;