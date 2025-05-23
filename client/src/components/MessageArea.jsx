import React, { useState } from 'react';
import { MoreHorizontal, Send, Mail, ArrowLeft } from 'lucide-react';

const MessageArea = ({ selectedEmail }) => {
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      const res = await fetch('http://localhost:5000/reply', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmail.email,
          subject: 'Re: ' + selectedEmail.subject,
          body: replyText,
          threadId: selectedEmail.threadId
        })
      });

      if (res.ok) {
        setReplies([...replies, { text: replyText, timestamp: new Date() }]);
        setReplyText('');
      } else {
        alert('Failed to send email');
      }
    }
  };

  if (!selectedEmail) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center">
        <div className="text-center p-8">
          <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-gray-700 mb-2">No Email Selected</h2>
          <p className="text-gray-500">Select an email from the inbox to view its content</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(selectedEmail.timestamp).toLocaleString();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <button className="p-2 rounded-full hover:bg-gray-100 md:hidden">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold ml-2">{selectedEmail.subject}</h1>
        </div>
        <div className="flex space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium">{selectedEmail.from}</h2>
                <span className="text-sm text-gray-500">{formattedDate}</span>
              </div>
            </div>
            <div className="mt-4 prose max-w-none text-gray-700">
              {selectedEmail.snippet.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.map((reply, index) => (
          <div key={index} className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.text}</p>
            <div className="text-xs text-gray-500 mt-2">
              Replied at: {new Date(reply.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Reply area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendReply}>
          <div className="border rounded-lg mb-4">
            <textarea 
              className="w-full p-3 text-gray-800 focus:outline-none resize-none" 
              placeholder="Type your reply here..."
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center">
            <button 
              type="submit"
              className="p-2 rounded-full hover:bg-gray-100"
              title="Send"
            >
              <Send className="w-5 h-5 transform rotate-45 text-gray-500" />
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 rounded-md font-medium text-gray-600 hover:bg-gray-200 flex items-center"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageArea;
