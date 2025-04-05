import React from 'react';
import LoginForm from '../components/LoginForm';

function Login({ onLogin }) {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm onLogin={onLogin} />
    </div>
  );
}

export default Login;
