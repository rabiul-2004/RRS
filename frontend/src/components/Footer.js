import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4><i className="fas fa-train"></i> IRCTC Railway Reservation</h4>
          <p>India's premier railway reservation platform. Book train tickets with ease and convenience.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/pnr-status">PNR Status</a></li>
            <li><a href="/my-bookings">My Bookings</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p><i className="fas fa-envelope"></i> support@irctc.in</p>
          <p><i className="fas fa-phone"></i> 1800-111-139</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} IRCTC. All Rights Reserved. This is a demo clone for educational purposes.</p>
      </div>
    </footer>
  );
};

export default Footer;
