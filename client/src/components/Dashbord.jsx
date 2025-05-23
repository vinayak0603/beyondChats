import { useEffect, useState } from 'react';
import axios from 'axios';
import ConversationList from './ConversationList';

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [activeEmailId, setActiveEmailId] = useState(null);

  useEffect(() => {
    axios.get('https://beyondchats-dqoh.onrender.com/profile', { withCredentials: true })
      .then(res => setUserEmail(res.data.email))
      .catch(() => window.location.href = 'https://beyondchats-dqoh.onrender.com/auth/google');

    axios.get('https://beyondchats-dqoh.onrender.com/emails', { withCredentials: true })
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
