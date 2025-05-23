import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import CopilotPanel from './CopilotPanel';

const DetailsPanel = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [isLinksOpen, setIsLinksOpen] = useState(true);
  const [isConversationOpen, setIsConversationOpen] = useState(true);
  const [isUserDataOpen, setIsUserDataOpen] = useState(false);
  const [isRecentConversation, setIsRecentConversation] = useState(false);

  return (
    <div className="h-full w-full max-w-[100vw] bg-white border-l overflow-y-auto">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex p-2 sm:p-4 gap-x-2 sm:gap-x-4">
          <button
            className={`flex-1 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'details'
                ? 'border-orange-500 text-gray-900'
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`flex-1 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'copilot'
                ? 'border-orange-500 text-gray-900'
                : 'border-transparent text-gray-500'
            }`}
            onClick={() => setActiveTab('copilot')}
          >
            Copilot
          </button>
        </div>
      </div>

      {activeTab === 'details' ? (
        <>
          {/* Assignee & Inbox */}
          <div className="p-2 sm:p-4 border-b">
            <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
              <span className="text-sm text-gray-500">Assignee</span>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-200 rounded-full"></span>
                <span className="text-sm truncate max-w-[150px]">Vinayak Andhere...</span>
              </div>
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm text-gray-500">Team Inbox</span>
              <span className="text-sm">Unassigned</span>
            </div>
          </div>

          {/* 🔗 Links Section */}
          <div className="p-2 sm:p-4 border-b">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => setIsLinksOpen(!isLinksOpen)}
            >
              <div className="flex items-center gap-2">
                <span>🔗</span>
                <span className="font-medium">Links</span>
              </div>
              {isLinksOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {isLinksOpen && (
              <div className="space-y-3">
                {['Tracker ticket', 'Back-office tickets', 'Side conversations'].map((label) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{label}</span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reusable Section Component */}
          {[
            {
              label: 'Conversation attributes',
              isOpen: isConversationOpen,
              toggle: () => setIsConversationOpen(!isConversationOpen),
            },
            {
              label: 'Recent Conversation',
              isOpen: isRecentConversation,
              toggle: () => setIsRecentConversation(!isRecentConversation),
            },
            {
              label: 'User data',
              isOpen: isUserDataOpen,
              toggle: () => setIsUserDataOpen(!isUserDataOpen),
            },
          ].map((section, idx) => (
            <div className="p-2 sm:p-4 border-b" key={idx}>
              <div
                className="flex justify-between items-center mb-4 cursor-pointer"
                onClick={section.toggle}
              >
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span className="font-medium">{section.label}</span>
                </div>
                {section.isOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>

              {section.isOpen && (
                <div className="space-y-3">
                  {[
                    { label: 'ID', value: '215469050595657' },
                    { label: 'Brand', value: 'Vinayak' },
                    { label: 'Subject', value: 'Add', isButton: true },
                    { label: 'Language', value: 'English' },
                    { label: 'External ID', value: 'Add', isButton: true },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{item.label}</span>
                      {item.isButton ? (
                        <button className="text-sm text-blue-600 flex items-center">
                          <span className="mr-1">+</span>{item.value}
                        </button>
                      ) : (
                        <span className="text-sm">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <CopilotPanel />
      )}
    </div>
  );
};

export default DetailsPanel;
