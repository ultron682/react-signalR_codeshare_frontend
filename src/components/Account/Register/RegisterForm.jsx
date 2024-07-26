import React, { useState } from 'react';
import axios from 'axios';
import "../Form.css";

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5555/register', {
                username,
                email,
                password
            });
            // Obsługa pomyślnej rejestracji
            console.log('Registration successful:', response.data);
            setSuccess('Registration successful. You can now log in.');
            setError('');
        } catch (error) {
            // Obsługa błędu rejestracji
            console.error('Error registering:', error);
            setError('Registration failed. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="form-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className="error-text">{error}</p>}
                {success && <p className="success-text">{success}</p>}
                <button type="submit" className="submit-btn">Register</button>
            </form>
            {/* <p className="toggle-text">Already have an account? <span onClick={toggleForm}>Login here</span></p> */}
        </div>
    );
};

export default RegisterForm;
