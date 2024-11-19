import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Img from '../../assets/avatar.jpg';
import { AuthData } from '../../auth/AuthWrapper';

export const Chat = () => {

  const { user } = AuthData();
  const [chats, setChats] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeChatID, setActiveChatID] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}chat/user/${user.userID}`)
      .then((response) => {
        setChats(response.data);
        console.log(response.data);
      });
  }, [user.userID]);

  useEffect(() => {
    if (activeChatID) {
      axios.get(`${process.env.REACT_APP_API_URL}chat/${activeChatID}`)
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
        });
    } else {
      setMessages([]);
    }
  }, [activeChatID]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      chatID: activeChatID,
      senderID: user.userID,
      messageContent: newMessage,
    };

    axios.post(`${process.env.REACT_APP_API_URL}chat/add-message`, messageData)
      .then((response) => {
        setMessages((prevMessages) => [...prevMessages, response.data]); 
        setNewMessage('');
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  };

  return (
    <>
      <div className="flex min-h-screen pt-16">
        <div className="w-1/4 bg-white border-r border-gray-300">
          <header className="p-4 flex justify-between items-center bg-[#D47C24] text-white">
            <h1 className="text-2xl font-semibold">Chat with the sellers</h1>
          </header>

          <div className="overflow-y-auto h-screen p-3 mb-9 pb-20">
            {chats.map((chat) => {
              const chatPartner = chat.user1ID === user.userID ? chat.User2 : chat.User1;
              return (
                <div
                  key={chat.chatID}
                  onClick={() => setActiveChatID(chat.chatID)}
                  className={`flex items-center mb-4 cursor-pointer hover:border-r-2 hover:border-orange-500 p-2 rounded-md ${activeChatID === chat.chatID ? 'bg-gray-300' : ''}`}>
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                    <img
                      src={chatPartner?.avatarURL || Img}
                      alt="User Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{chatPartner.username}</h2>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <header className="bg-white p-4 text-gray-700">
            {activeChatID ? (
              <h1 className="text-2xl font-semibold">Messages</h1>
            ) : (
              <h1 className="text-2xl font-semibold">Select a chat to start messaging</h1>
            )}
          </header>

          <div className="h-screen overflow-y-hidden p-4 pb-36">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.senderID === user.userID ? 'justify-end' : ''} mb-4 cursor-pointer`}>
                  {message.senderID !== user.userID && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                      <img
                        src={message.User?.avatarURL || Img}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  )}
                  <div className={`flex max-w-96 ${message.senderID === user.userID ? 'bg-[#D47C24] text-white' : 'border border-[#D47C24] text-[#D47C24]'} rounded-lg p-3 gap-3`}>
                    <p>{message.messageContent}</p>
                  </div>
                  {message.senderID === user.userID && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
                      <img
                        src={user?.avatar || Img }
                        alt="My Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No messages yet...</p>
            )}
          </div>

          {activeChatID && (
            <footer className="bg-white border-t-2 border-gray-300 p-4 fixed bottom-0 w-3/4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"/>
                <button
                  className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2"
                  onClick={sendMessage}>
                  Send
                </button>
              </div>
            </footer>
          )}
        </div>
      </div>
    </>
  );
};
