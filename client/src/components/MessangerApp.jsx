import React, { useEffect, useState } from 'react';
import ConversationList from './ConversationList';
import axios from 'axios';
import MessageArea from './MessageArea';
import DetailsPanel from './DetailsPanel';

const MessengerApp = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const selectedEmail = emails.find(email => email.id === selectedEmailId) || null;

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const res = await axios.get('https://beyondchats-dqoh.onrender.com/userinfo', {
          withCredentials: true
        });
        setUserEmail(res.data.email);
      } catch (error) {
        console.error('Failed to fetch user email:', error);
      }
    };
    fetchUserEmail();
  }, []);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get('https://beyondchats-dqoh.onrender.com/emails', {
          withCredentials: true
        });
        setEmails(res.data.messages);
      } catch (error) {
        console.error('Failed to fetch emails:', error);
      }
    };
    fetchEmails();
  }, []);

  const handleEmailSelect = (emailId) => {
    setSelectedEmailId(emailId);
  };

  const handleReply = (content) => {
    console.log('Reply to email:', selectedEmailId, 'with content:', content);
  };

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Desktop: Side-by-side */}
      <div className="hidden lg:flex h-full">
        <div className="w-[350px] border-r overflow-y-auto">
          <ConversationList
            emails={emails}
            activeEmailId={selectedEmailId}
            onEmailSelect={handleEmailSelect}
            connectedEmail={userEmail}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <MessageArea selectedEmail={selectedEmail} onReply={handleReply} />
        </div>

        <div className="w-[350px] border-l overflow-y-auto">
          <DetailsPanel />
        </div>
      </div>

      {/* Mobile: Vertical stacked scrollable */}
      <div className="lg:hidden flex flex-col gap-4 h-full overflow-y-auto px-2">
        <div className="border rounded-md">
          <ConversationList
            emails={emails}
            activeEmailId={selectedEmailId}
            onEmailSelect={handleEmailSelect}
            connectedEmail={userEmail}
          />
        </div>

        <div className="border rounded-md">
          <MessageArea selectedEmail={selectedEmail} onReply={handleReply} />
        </div>

        <div className="border rounded-md">
          <DetailsPanel />
        </div>
      </div>
    </div>
  );
};

export default MessengerApp;
