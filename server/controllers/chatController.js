const { Sequelize } = require('sequelize');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const ContactMessage = require('../models/ContactMessage');

const createChat = async (req, res) => {
    const { user1ID, user2ID } = req.body;

    try {
        let existingChat = await Chat.findOne({
            where: {
              [Sequelize.Op.or]: [
                { user1ID: user1ID, user2ID: user2ID },
                { user1ID: user2ID, user2ID: user1ID }
              ]
            }
        });

    if (existingChat) {
        return res.status(200).json(existingChat);
    }
  
      const newChat = await Chat.create({
        user1ID,
        user2ID
      });
  
      res.status(201).json(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: 'Failed to create chat' });
    }
  };

  const sendMessage = async (req, res) => {
    const { chatID, senderID, messageContent } = req.body;
  
    try {
      const message = await Message.create({
        chatID,
        senderID,
        messageContent,
      });
  
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  };


const sendContactMessage = async (req, res) => {
    const { email, fullName, message, phoneNumber, companyName } = req.body;

    try {
        const newContactMessage = await ContactMessage.create({
            email,
            fullName,
            message,
            phoneNumber,
            companyName
        });

        res.status(201).json(newContactMessage);
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ error: 'Failed to send contact message' });
    }
}

const getContactMessages = async (req, res) => {
    try {
        const contactMessages = await ContactMessage.findAll();
        res.status(200).json(contactMessages);
    } catch (error) {
        console.error('Error retrieving contact messages:', error);
        res.status(500).json({ error: 'Failed to retrieve contact messages' });
    }
}


const getMessagesByChatID = async (req, res) => {

    const { id: chatID } = req.params;
    try {
      
      const messages = await Message.findAll({
        where: { chatID },
        include: [
          {
            model: User,
            attributes: ['username','avatarURL'],

          },
        ],
        order: [['createdAt', 'ASC']], 
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error retrieving messages:', error);
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  };

const getUserChats = async (req, res) => {

    const { id: userID } = req.params;

    try {    
      const chats = await Chat.findAll({
        where: {
          [Sequelize.Op.or]: [
            { user1ID: userID },
            { user2ID: userID },
          ],
        },
        include: [
          {
            model: User,
            as: 'User1',
            attributes: ['username','avatarURL'],
          },
          {
            model: User,
            as: 'User2',
            attributes: ['username','avatarURL'],
          },
        ],
      });
  
      res.status(200).json(chats);
    } catch (error) {
      console.error('Error retrieving user chats:', error);
      res.status(500).json({ error: 'Failed to retrieve user chats' });
    }
  };

const deleteContactMessage = async (req, res) => {
    const { id } = req.params;
    try {
        await ContactMessage.destroy({
            where: {
              contactMessageID: id
            }
        });
        res.status(200).json({ message: 'Contact message deleted' });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({ error: 'Failed to delete contact message' });
    }
}

module.exports = {
    createChat,
    sendMessage,
    getMessagesByChatID,
    getUserChats,
    sendContactMessage,
    getContactMessages,
    deleteContactMessage

};
