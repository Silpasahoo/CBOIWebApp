import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.error) {
    return <div className="p-10 text-center text-red-500">Authentication Error: {auth.error.message}</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-xl">Processing Login...</div>
    </div>
  );
};

export default Callback;
