import { useEffect, useState } from 'react';
import axios from 'axios';
import ConversationList from './conversationList';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [activeEmailId, setActiveEmailId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/profile', { withCredentials: true })
      .then(res => setUserEmail(res.data.email))
      .catch(() => window.location.href = 'http://localhost:5000/auth/google');

    axios.get('http://localhost:5000/emails', { withCredentials: true })
      .then(res => setEmails(res.data.messages))
      .catch(err => console.error('Email fetch failed:', err));
  }, []);

  return (
    <div className="h-screen flex">
      <ConversationList
        emails={emails}
        activeEmailId={activeEmailId}
        onEmailSelect={setActiveEmailId}
        connectedEmail={userEmail}
      />
    </div>
  );
};

export default Dashboard;
