// src/components/dashboard/MessageBoard.tsx
import React, { useState } from "react";

interface Message {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export default function MessageBoard() {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  // Mock data for message board
  const messages: Message[] = [
    {
      id: "1",
      author: "Coach Boyer",
      timestamp: "2 hr ago",
      content:
        "What defensive strategies have worked best against zone offenses?",
      replies: [
        {
          id: "r1",
          author: "Coach Williams",
          timestamp: "1.5 hr ago",
          content:
            "We've had success with a 2-3 matchup zone. Forces them to shoot from the perimeter and we can adjust quickly.",
        },
        {
          id: "r2",
          author: "Coach Parker",
          timestamp: "1 hr ago",
          content:
            "Man-to-man principles still apply. Focus on ball pressure and help defense. Don't let them get comfortable.",
        },
        {
          id: "r3",
          author: "Coach Anderson",
          timestamp: "45 min ago",
          content:
            "Great question! I'd also recommend working on your offensive rebounding. Zone defenses can leave gaps.",
        },
      ],
    },
    {
      id: "2",
      author: "Coach Williams",
      timestamp: "1 day ago",
      content:
        "Great article on player motivation techniques - highly recommend checking it out!",
      replies: [
        {
          id: "r4",
          author: "Coach Smith",
          timestamp: "20 hr ago",
          content: "Thanks for sharing!",
        },
        {
          id: "r5",
          author: "Coach Johnson",
          timestamp: "18 hr ago",
          content: "I'll check it out.",
        },
      ],
    },
    {
      id: "3",
      author: "Coach Williams",
      timestamp: "2 days ago",
      content:
        "Need advice on managing playing time with a deep bench. How do you keep everyone engaged?",
      replies: [
        {
          id: "r6",
          author: "Coach Davis",
          timestamp: "1.5 days ago",
          content: "Rotate based on practice performance and attitude.",
        },
        {
          id: "r7",
          author: "Coach Brown",
          timestamp: "1 day ago",
          content: "Set clear expectations and give everyone specific roles.",
        },
        {
          id: "r8",
          author: "Coach Wilson",
          timestamp: "22 hr ago",
          content: "Focus on development over winning in early season.",
        },
        {
          id: "r9",
          author: "Coach Taylor",
          timestamp: "20 hr ago",
          content: "Communication is key - let players know their role.",
        },
        {
          id: "r10",
          author: "Coach Martinez",
          timestamp: "18 hr ago",
          content: "Create competition in practice to earn playing time.",
        },
        {
          id: "r11",
          author: "Coach Garcia",
          timestamp: "16 hr ago",
          content: "Track individual stats to make objective decisions.",
        },
        {
          id: "r12",
          author: "Coach Rodriguez",
          timestamp: "14 hr ago",
          content: "End of game situations - let your best players close.",
        },
        {
          id: "r13",
          author: "Coach Lee",
          timestamp: "12 hr ago",
          content: "Keep detailed notes on practice performance.",
        },
      ],
    },
  ];

  const handleReply = (messageId: string) => {
    if (replyText.trim()) {
      // In a real app, this would submit to backend
      console.log("Reply submitted:", { messageId, content: replyText });
      setReplyText("");
    }
  };

  const toggleExpanded = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bebas uppercase text-gray-900">
            Coaches Message Board
          </h3>
          <p className="text-sm text-gray-500 font-inter mt-1">
            Ask questions and share insights with other coaches
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors">
          + New Message
        </button>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="border-b border-gray-100 pb-4 last:border-b-0"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-inter font-semibold text-gray-900">
                    {message.author}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {message.timestamp}
                  </span>
                </div>
                <p className="text-gray-700 font-inter mb-3">
                  {message.content}
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleExpanded(message.id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-inter"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>Reply</span>
                  </button>
                  <span className="text-sm text-gray-500">
                    {expandedMessage === message.id
                      ? `Hide ${message.replies.length} comments`
                      : `View ${message.replies.length} comments`}
                  </span>
                </div>
              </div>
            </div>

            {expandedMessage === message.id && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200">
                <div className="space-y-3 mb-4">
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-inter font-semibold text-gray-900 text-sm">
                            {reply.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {reply.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-700 font-inter text-sm">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-300 rounded-md text-sm font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setReplyText("")}
                      className="px-4 py-2 text-sm font-inter text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(message.id)}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
