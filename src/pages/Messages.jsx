import React, { useState, useEffect, useRef } from "react";
import { Message, User, Nonprofit } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [nonprofits, setNonprofits] = useState({});

  const location = useLocation();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadData();
  }, [location.search]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [allNonprofits, allMessages] = await Promise.all([
        Nonprofit.list(),
        Message.list()
      ]);

      // Create nonprofit map
      const nonprofitMap = {};
      allNonprofits.forEach(org => {
        nonprofitMap[org.id] = org;
      });
      setNonprofits(nonprofitMap);

      // Check if starting a new conversation from URL
      const params = new URLSearchParams(location.search);
      const startConversationId = params.get('startConversation');

      // Group messages by conversation_id
      const conversationMap = {};
      
      allMessages.forEach(msg => {
        // Only include messages where user is sender or recipient
        if (msg.sender_id === user.id || msg.recipient_id === user.id) {
          if (!conversationMap[msg.conversation_id]) {
            conversationMap[msg.conversation_id] = {
              id: msg.conversation_id,
              nonprofit_id: msg.nonprofit_id,
              nonprofit: nonprofitMap[msg.nonprofit_id],
              messages: []
            };
          }
          conversationMap[msg.conversation_id].messages.push(msg);
        }
      });

      // Handle new conversation from URL
      if (startConversationId && nonprofitMap[startConversationId]) {
        const conversationId = `conv_${user.id}_${startConversationId}`;
        if (!conversationMap[conversationId]) {
          conversationMap[conversationId] = {
            id: conversationId,
            nonprofit_id: startConversationId,
            nonprofit: nonprofitMap[startConversationId],
            messages: [],
            isNew: true
          };
        }
      }

      // Convert to array and sort
      const sortedConversations = Object.values(conversationMap).map(convo => {
        const sortedMessages = [...convo.messages].sort((a, b) => 
          new Date(a.created_date) - new Date(b.created_date)
        );
        
        const lastMessage = sortedMessages.length > 0 
          ? sortedMessages[sortedMessages.length - 1]
          : { 
              content: "Start a conversation...", 
              created_date: new Date().toISOString(),
              isPlaceholder: true 
            };
        
        return {
          ...convo,
          messages: sortedMessages,
          lastMessage: lastMessage
        };
      }).sort((a, b) => {
        // Put new conversations first
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date);
      });

      setConversations(sortedConversations);

      // Auto-select conversation
      if (startConversationId) {
        const convoToSelect = sortedConversations.find(c => c.nonprofit_id === startConversationId);
        if (convoToSelect) {
          setSelectedConversation(convoToSelect);
        }
      } else if (sortedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(sortedConversations[0]);
      }

    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    setSending(true);
    try {
      const nonprofit = selectedConversation.nonprofit;
      
      // Determine recipient - for simplicity, use nonprofit admin or a placeholder
      const recipientId = nonprofit.admin_user_id || 'nonprofit_' + nonprofit.id;

      const newMsgData = {
        sender_id: currentUser.id,
        recipient_id: recipientId,
        nonprofit_id: selectedConversation.nonprofit_id,
        content: newMessage,
        conversation_id: selectedConversation.id
      };

      const createdMessage = await Message.create(newMsgData);
      
      // Clear input
      setNewMessage("");

      // Reload to get fresh data
      await loadData();

    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
        <Card className="h-full grid grid-cols-1 lg:grid-cols-3 bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl overflow-hidden">
          {/* Conversations List */}
          <div className="flex flex-col border-r border-blue-100">
            <CardHeader className="border-b border-blue-100">
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No conversations yet.</p>
                  <p className="text-sm mt-2">Visit a nonprofit's page to start messaging them.</p>
                </div>
              ) : (
                conversations.map(convo => (
                  <div 
                    key={convo.id} 
                    onClick={() => setSelectedConversation(convo)}
                    className={`p-4 cursor-pointer flex gap-3 items-center border-b border-blue-50 transition-colors ${
                      selectedConversation?.id === convo.id ? 'bg-blue-100' : 'hover:bg-blue-50'
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={convo.nonprofit?.logo_url} />
                      <AvatarFallback>{convo.nonprofit?.name?.charAt(0) || 'N'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold truncate">{convo.nonprofit?.name || "Unknown Organization"}</h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {convo.lastMessage.isPlaceholder ? 'New' : formatDistanceToNow(new Date(convo.lastMessage.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{convo.lastMessage.content}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b border-blue-100">
                  <CardTitle className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedConversation.nonprofit?.logo_url} />
                      <AvatarFallback>{selectedConversation.nonprofit?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedConversation.nonprofit?.name}
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center text-gray-500">
                      <div>
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-semibold text-gray-700 mb-2">Start a conversation with {selectedConversation.nonprofit?.name}</p>
                        <p>Send a message below to get started!</p>
                      </div>
                    </div>
                  ) : (
                    selectedConversation.messages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`flex items-end gap-2 ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender_id !== currentUser.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedConversation.nonprofit?.logo_url} />
                            <AvatarFallback>{selectedConversation.nonprofit?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                          msg.sender_id === currentUser.id 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <span className={`text-xs mt-1 block ${
                            msg.sender_id === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-blue-100 p-4 bg-white">
                  <div className="flex gap-2">
                    <Textarea 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      placeholder="Type a message..." 
                      className="flex-1 resize-none"
                      rows={3}
                      onKeyPress={(e) => { 
                        if (e.key === 'Enter' && !e.shiftKey) { 
                          e.preventDefault(); 
                          sendMessage(); 
                        } 
                      }}
                    />
                    <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="h-auto">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}