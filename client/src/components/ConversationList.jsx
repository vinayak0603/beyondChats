import React from 'react';
import { Mail } from 'lucide-react';

const EmailItem = ({ email, isActive, onClick }) => {
  const formattedTime = email?.timestamp
    ? new Date(email.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  // Extract sender name
  const sender = email?.from || 'Unknown Sender';
  const subject = email?.subject || 'No Subject';
  const content = email?.snippet || '';

  return (
    <div
      className={`flex items-center p-4 rounded-lg cursor-pointer ${
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      } ${!email?.isRead ? 'font-semibold' : ''}`}
      onClick={onClick}
    >
      <div className="mr-3 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
        <Mail className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 truncate">{sender}</h3>
          <span className="text-xs text-gray-500">{formattedTime}</span>
        </div>
        <div className="text-sm text-gray-700 font-medium truncate">{subject}</div>
        <p className="text-sm text-gray-500 truncate">
          {content.length > 50 ? `${content.substring(0, 50)}...` : content}
        </p>
      </div>
    </div>
  );
};



const ConversationList = ({ emails, activeEmailId, onEmailSelect, connectedEmail }) => {
  return (
    <div className="w-full h-full flex flex-col border-r bg-white">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Inbox</h2>
            <p className="text-sm text-gray-600 truncate">{connectedEmail}</p>
          </div>
          <div className="text-sm text-gray-500">{emails.length} emails</div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {emails.map((email) => (
          <EmailItem
            key={email.id}
            email={email}
            isActive={email.id === activeEmailId}
            onClick={() => onEmailSelect(email.id)}
          />
        ))}

        {emails.length === 0 && (
          <div className="text-center p-6 text-gray-500">No emails to display</div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <span className="block w-5 h-5 bg-gray-800 rounded-sm"></span>
          </button>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <div className="flex flex-col justify-center items-center space-y-1">
              <div className="w-5 h-0.5 bg-gray-800 rounded"></div>
              <div className="w-5 h-0.5 bg-gray-800 rounded"></div>
              <div className="w-5 h-0.5 bg-gray-800 rounded"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
