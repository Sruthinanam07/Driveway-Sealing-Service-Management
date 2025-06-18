// import React, { useState } from 'react';
// import axios from 'axios';

// function Register() {
//   const [formData, setFormData] = useState({ username: '', firstname: '', lastname: '', password: '', age: '', salary: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5050/register', formData);
//       setMessage(response.data.message || 'Registered successfully!');
//     } catch (error) {
//       setMessage('Registration failed');
//     }
//   };

//   return (
//     <div className="form-container">
//      <h2 className="form-title">Sign In</h2>
//       <form onSubmit={handleSubmit}>
//       <input name="username" placeholder="Username" className="input-field" onChange={handleChange} required/>
//       <input name="firstname" placeholder="First Name" className="input-field"onChange={handleChange} required />
//       <input name="lastname" placeholder="Last Name" className="input-field"onChange={handleChange} required />
//       <input name="password" type="password" placeholder="Password" className="input-field"onChange={handleChange} required />
//       <input name="age"type="number" placeholder="Age" className="input-field"onChange={handleChange} required />
//       <input name="salary"type="number" placeholder="Salary" className="input-field"onChange={handleChange} required />
//       <button className="form-button"type='submit'>Register</button>
//      </form>
//      <p>{message}</p>
//     </div>
//  );
// }

// export default Register;
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    address: '',
    creditCardInfo: '',
    phoneNumber: '',
    email: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5050/register', formData);
      setMessage(response.data.message || 'Registered successfully!');
    } catch (error) {
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Registration</h2>
      <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" className="input-field" onChange={handleChange} required/>
        <input
          name="firstname"
          placeholder="First Name"
          className="input-field"
          onChange={handleChange}
          required
        />
        <input
          name="lastname"
          placeholder="Last Name"
          className="input-field"
          onChange={handleChange}
          required
        />
        <input name="password" type="password" placeholder="Password" className="input-field"onChange={handleChange} required />
        <input
          name="creditCardInfo"
          type="text"
          placeholder="Credit Card Information"
          className="input-field"
          onChange={handleChange}
          required
        />
        <input
          name="phoneNumber"
          type="tel"
          placeholder="Phone Number"
          className="input-field"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input-field"
          onChange={handleChange}
          required
        />
        <textarea
          name="address"
          placeholder="Address"
          className="input-field"
          onChange={handleChange}
          required
        />
        <button className="form-button" type="submit">
          Register
        </button>
      </form>
      <p>{message}</p>
      <p className="redirect-link">
        Already have an account? <Link to="/signin">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
