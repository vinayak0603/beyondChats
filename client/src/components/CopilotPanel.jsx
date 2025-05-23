import React, { useState } from 'react';
import axios from 'axios';
import { FaEllipsisV, FaPaperPlane } from 'react-icons/fa';

const CopilotChat = () => {
  const [chat, setChat] = useState([]);
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    const newChat = [...chat, { type: 'user', text: question }];
    setChat(newChat);
    setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post('https://beyondchats-dqoh.onrender.com/ask', { question });
      const answer = res.data.answer || 'No response from Copilot.';
      setChat([...newChat, { type: 'copilot', text: answer }]);
    } catch (err) {
      const error = err.response?.data?.error || 'Error getting answer.';
      setChat([...newChat, { type: 'copilot', text: error }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    setUploading(true);

   try {
  const res = await axios.post(
    'https://beyondchats-dqoh.onrender.com/upload',
    formData,
    {
      withCredentials: true, // 🔐 this sends the session cookie
    }
  );

  alert(res.status === 200 ? '✅ PDF uploaded successfully!' : '❌ Upload failed.');
} catch (err) {
  alert(err.response?.data?.error || 'Upload failed.');
} finally {
  setUploading(false);
}

  };

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[90vh] border shadow rounded bg-white overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[75%] ${
                msg.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600">
              Copilot is typing...
            </div>
          </div>
        )}
      </div>

      <div className="border-t px-4 py-3 flex items-center gap-2 relative mb-10 ">
        <input
          type="text"
          placeholder="Ask something..."
          className="flex-1 px-4 py-2 border rounded-lg outline-none"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />

        <button
          onClick={handleSend}
          className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          <FaPaperPlane />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="p-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <FaEllipsisV />
          </button>

          {showUpload && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow p-2 z-10">
              <label className="block cursor-pointer text-sm">
                📎 Upload PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
              {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopilotChat;
