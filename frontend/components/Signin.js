// import React, { useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';


// function SignIn() {
//    const navigate = useNavigate();
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//         const response = await axios.post('http://localhost:5050/signin', formData);
//         const { username, password } = formData;

//         if (!username || !password) {
//         setMessage("Please enter both username and password.");
//         return;
//       }
//         if (response.status === 200) {
//             const { clientId, message } = response.data;
//             if (clientId) { // Ensure clientId exists
//               localStorage.setItem('clientId', clientId);
//               setMessage(message || 'Login successful!');
//               console.log("Redirecting to the dashboard");
//               navigate('/dashboard');
//           } else {
//               setMessage("Login successful, but client ID is missing.");
//           }
//             // Save clientId in localStorage
//             // localStorage.setItem('clientId', clientId);

//             // setMessage(message || 'Login successful!');
//             // console.log("Redirecting to the dashboard");
//             // navigate('/dashboard'); // Redirect to Dashboard
//         }
//     } catch (error) {
//         const errorMsg = error.response?.data?.message || 'Login failed';
//         console.error("Error during sign-in:", error.message);
//         setMessage(errorMsg);
//     }
// };

//   return (
//         <div className="form-container">
//          <h2 className="form-title">Sign In</h2>
//           <form onSubmit={handleSubmit}>
//           <input name="username" placeholder="Username" className="input-field" onChange={handleChange} required />
//           <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />
//          <button className="form-button" type='submit'>Sign In</button>
//          </form>
//          <p>{message}</p>
//          <p className="redirect-link">
//           Don't have an account? <Link to="/register">Register here</Link>
//         </p>
//         </div>
//      );
// }

// export default SignIn;

// import React, { useState } from 'react';
// import axios from 'axios';
// import { Link, useNavigate } from 'react-router-dom';

// function SignIn() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { username, password } = formData;

//     // Basic validation before API call
//     if (!username || !password) {
//       setMessage("Please enter both username and password.");
//       return;
//     }

//     try {
//       // API call to sign-in endpoint
//       const response = await axios.post('http://localhost:5050/signin', { username, password });

//       // Destructure response
//       const { success, clientId, message: serverMessage } = response.data;

//       if (success && clientId) {
//         // Store Client ID in localStorage
//         localStorage.setItem('clientId', clientId);

//         setMessage(serverMessage || "Login successful!");
//         console.log("Client ID:", clientId); // Debugging
//         console.log("Redirecting to dashboard...");
        
//         // Navigate to the dashboard
//         navigate('/dashboard');
//       } else {
//         // Fallback if clientId or success flag is missing
//         setMessage("Login failed. Please try again.");
//       }
//     } catch (error) {
//       // Error handling
//       const errorMsg = error.response?.data?.message || "Login failed. Please check your credentials.";
//       console.error("Error during sign-in:", error.message);
//       setMessage(errorMsg);
//     }
//   };
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   const { username, password } = formData;

//   if (!username || !password) {
//     setMessage("Please enter both username and password.");
//     return;
//   }

//   try {
//     // Make sign-in request
//     const response = await axios.post('http://localhost:5050/signin', { username, password });

//     // Destructure backend response
//     const { success, clientId, message: serverMessage } = response.data;

//     if (success && clientId) {
//       localStorage.setItem('clientId', clientId); // Save clientId in localStorage
//       console.log("Client ID stored:", clientId);
//       setMessage(serverMessage || "Login successful!");
//       navigate('/dashboard'); // Redirect to dashboard
//     } else {
//       setMessage("Login failed. Client ID is missing.");
//     }
//   } catch (error) {
//     const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
//     console.error("Error during sign-in:", error);
//     setMessage(errorMsg);
//   }
// };

//   return (
//     <div className="form-container">
//       <h2 className="form-title">Sign In</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           name="username"
//           placeholder="Username"
//           className="input-field"
//           onChange={handleChange}
//           value={formData.username}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           className="input-field"
//           onChange={handleChange}
//           value={formData.password}
//           required
//         />
//         <button className="form-button" type="submit">Sign In</button>
//       </form>
//       {message && <p className="error-message">{message}</p>}
//       <p className="redirect-link">
//         Don't have an account? <Link to="/register">Register here</Link>
//       </p>
//     </div>
//   );

// export default SignIn;
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5050/signin', { username, password });
      console.log("Response from backend:", response.data);
      const { success, clientId, message: serverMessage } = response.data;

      if (success && clientId) {
        localStorage.setItem('clientId', clientId);
        setMessage(serverMessage || "Login successful!");
        navigate('/dashboard');
      } else {
        setMessage("Login failed. Client ID is missing.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
      console.error("Error during sign-in:", error);
      setMessage(errorMsg);
    }
  };

  // Ensure return is inside the SignIn function
  return (
    <div className="form-container">
      <h2 className="form-title">Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          className="input-field"
          onChange={handleChange}
          value={formData.username}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input-field"
          onChange={handleChange}
          value={formData.password}
          required
        />
        <button className="form-button" type="submit">Sign In</button>
      </form>
      {message && <p className="error-message">{message}</p>}
      <p className="redirect-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default SignIn;
