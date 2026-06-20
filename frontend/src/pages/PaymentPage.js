import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import { PAYMENT_METHODS } from '../utils/constants';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, journeyDate, classType, passengers, baseFare, totalFare } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('details');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '', expiry: '', cvv: '', nameOnCard: '',
  });

  if (!train) {
    navigate('/');
    return null;
  }

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
        if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
          setError('Please fill all card details');
          setLoading(false);
          return;
        }
      }

      const { data } = await bookingAPI.create({
        trainId: train._id,
        journeyDate,
        classType,
        passengers: passengers.map(p => ({
          name: p.name,
          age: p.age,
          gender: p.gender,
          berthPreference: p.berthPreference,
        })),
        paymentMethod,
      });

      navigate('/confirmation', { state: { booking: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page container">
      <h2><i className="fas fa-credit-card"></i> Payment</h2>

      {step === 'details' && (
        <>
          <div className="payment-summary">
            <div className="summary-card">
              <h3>{train.name} ({train.number})</h3>
              <p>{train.source} → {train.destination}</p>
              <p>{new Date(journeyDate).toLocaleDateString('en-IN')} | {classType}</p>
              <p>{passengers.length} Passenger{passengers.length > 1 ? 's' : ''}</p>
              <h2 className="total-fare">₹{totalFare}</h2>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="payment-form">
            <h3><i className="fas fa-credit-card"></i> Select Payment Method</h3>
            <div className="payment-methods">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method}
                  className={`payment-method ${paymentMethod === method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <i className={`fas fa-${method === 'UPI' ? 'mobile-alt' : method === 'Wallet' ? 'wallet' : 'credit-card'}`}></i>
                  {method}
                </button>
              ))}
            </div>

            {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
              <div className="card-details">
                <h4>Card Details</h4>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="card-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails.expiry}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="***"
                      maxLength="4"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Name on Card</label>
                  <input
                    type="text"
                    name="nameOnCard"
                    value={cardDetails.nameOnCard}
                    onChange={handleCardChange}
                    placeholder="Name as on card"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="upi-section">
                <p><i className="fas fa-qrcode"></i> Scan QR code or enter UPI ID</p>
                <div className="form-group">
                  <input type="text" placeholder="example@upi" />
                </div>
              </div>
            )}

            {paymentMethod === 'Net Banking' && (
              <div className="form-group">
                <label>Select Bank</label>
                <select>
                  <option>SBI - State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra</option>
                </select>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Processing...</>
            ) : (
              <><i className="fas fa-lock"></i> Pay ₹{totalFare}</>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default PaymentPage;
