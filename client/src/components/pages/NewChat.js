import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Img from '../../assets/avatar.jpg';
import { AuthData } from '../../auth/AuthWrapper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const NewChat = () => {

  const { user } = AuthData();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeChatID, setActiveChatID] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  // Szczegółowe dane partnera rozmowy
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [partnerOffers, setPartnerOffers] = useState([]);
  const [partnerOffersCount, setPartnerOffersCount] = useState(null);
  const [loadingPartnerInfo, setLoadingPartnerInfo] = useState(false);
  const [errorPartnerInfo, setErrorPartnerInfo] = useState(null);
  // Modal blokady wiadomości
  const [blockModal, setBlockModal] = useState({ show: false, message: '' });

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

  // Zamknij panel info klawiszem Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsInfoOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      chatID: activeChatID,
      senderID: user.userID,
      messageContent: newMessage,
    };

    // Optymistyczna aktualizacja UI - dodaj wiadomość od razu
    const optimisticMessage = {
      senderID: user.userID,
      messageContent: newMessage,
      User: {
        avatarURL: user.avatar,
        username: user.username
      },
      _optimistic: true // oznacz jako tymczasową
    };
    
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    const messageTextCopy = newMessage; // zapisz przed czyszczeniem
    setNewMessage('');

    axios.post(`${process.env.REACT_APP_API_URL}chat/add-message`, messageData)
      .then((response) => {
        const data = response.data;

        // Sprawdź czy wiadomość została zablokowana
        if (data.blocked === true || data.action === 'block') {
          // Usuń optymistyczną wiadomość
          setMessages((prevMessages) => prevMessages.filter(m => !m._optimistic));
          // Pokaż modal z informacją o blokadzie
          setBlockModal({
            show: true,
            message: data.uiMessage || 'Twoja wiadomość została zablokowana z powodu naruszenia regulaminu (dane kontaktowe).'
          });
          // Przywróć treść wiadomości w polu input, aby użytkownik mógł edytować
          setNewMessage(messageTextCopy);
          return;
        }

        // Sprawdź czy to ostrzeżenie (warn)
        if (data.action === 'warn') {
          toast.warning(data.uiMessage || 'Wiadomość może zawierać podejrzane treści.', { position: 'top-center' });
        }

        // Aktualizuj ostatnią wiadomość danymi z serwera (usuwamy flag _optimistic)
        setMessages((prevMessages) => {
          const filtered = prevMessages.filter(m => !m._optimistic);
          // Dodaj prawdziwą wiadomość z serwera (jeśli przyszła)
          if (data.id || data.messageID) {
            return [...filtered, { ...data, _optimistic: false }];
          }
          return filtered;
        });
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        toast.error('Nie udało się wysłać wiadomości. Spróbuj ponownie.', { position: 'top-center' });
        // W razie błędu usuń optymistyczną wiadomość
        setMessages((prevMessages) => prevMessages.filter(m => !m._optimistic));
        // Przywróć treść w input
        setNewMessage(messageTextCopy);
      });
  };

  useEffect(() => {
    const markMessagesAsRead = async () => {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}chat/setAsRead/`,
          { chatID: activeChatID, userID: user.userID }
        );
        
      } catch (error) {
        console.error('Błąd przy oznaczaniu wiadomości jako przeczytane:', error);
      }
    };

    markMessagesAsRead();
  }, [activeChatID]);

  // Filtrowanie czatów na podstawie wyszukiwania
  const filteredChats = chats.filter((chat) => {
    const chatPartner = chat.user1ID === user.userID ? chat.User2 : chat.User1;
    const username = chatPartner?.username || '';
    return username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Znalezienie aktywnego partnera rozmowy
  const activeChat = chats.find(chat => chat.chatID === activeChatID);
  const activeChatPartner = activeChat 
    ? (activeChat.user1ID === user.userID ? activeChat.User2 : activeChat.User1)
    : null;

  // Pobieranie rozszerzonych informacji o partnerze gdy panel zostaje otwarty
  useEffect(() => {
    const fetchPartnerInfo = async () => {
      if (!isInfoOpen || !activeChatPartner?.userID) {
        return;
      }
      setLoadingPartnerInfo(true);
      setErrorPartnerInfo(null);
      try {
        const base = process.env.REACT_APP_API_URL;
        console.log('Fetching partner info for userID:', activeChatPartner.userID);
        
        const [userRes, offersRes, countRes] = await Promise.all([
          axios.get(`${base}users/user/${activeChatPartner.userID}`),
          axios.get(`${base}offers/userID/${activeChatPartner.userID}`),
          axios.get(`${base}offers/countOffers/${activeChatPartner.userID}`)
        ]);

        console.log('User data:', userRes.data);
        console.log('Offers data:', offersRes.data);
        console.log('Count data:', countRes.data);

        setPartnerDetails(userRes.data);
        // Bierzemy tylko pierwsze 6 aktywnych ofert
        const offers = Array.isArray(offersRes.data) ? offersRes.data.slice(0, 6) : [];
        setPartnerOffers(offers);
        setPartnerOffersCount(countRes.data);
      } catch (err) {
        console.error('Błąd pobierania szczegółów użytkownika:', err);
        setErrorPartnerInfo('Nie udało się pobrać danych użytkownika');
      } finally {
        setLoadingPartnerInfo(false);
      }
    };
    fetchPartnerInfo();
  }, [isInfoOpen, activeChatPartner?.userID]);
  console.log('Partner details:', partnerDetails);
  console.log('Partner offers:', partnerOffers);
  console.log('Partner offers count:', partnerOffersCount);

  return (
    <>   
      <div className="flex pt-20 h-screen bg-gray-100 dark:bg-[#18191a] text-gray-900 dark:text-white">
      {/* (zarezerwowane miejsce dla panelu informacyjnego po prawej) */}

    {/* === SIDEBAR === */}
  <div className={`w-1/4 bg-white dark:bg-[#242526] border-r border-gray-300 dark:border-[#3a3b3c] p-3 flex flex-col`}>
        <input
          type="text"
          placeholder="Szukaj w Messengerze"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-200 dark:bg-[#3a3b3c] text-gray-900 dark:text-white rounded-full p-2 text-sm outline-none mb-3"
        />
        <div className="overflow-y-auto flex-1 space-y-2">
          {filteredChats.map((chat) => {
            const chatPartner = chat.user1ID === user.userID ? chat.User2 : chat.User1;
            return (
              <div
                key={chat.chatID}
                onClick={() => setActiveChatID(chat.chatID)}
                className={`flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#3a3b3c] cursor-pointer ${activeChatID === chat.chatID ? 'bg-gray-200 dark:bg-[#3a3b3c]' : ''}`}>
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                  <img
                    src={chatPartner?.avatarURL || Img}
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{chatPartner?.username || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kliknij aby zobaczyć wiadomości</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    {/* === CHAT WINDOW === */}
  <div className={`${isInfoOpen ? 'w-2/4' : 'w-3/4'} flex flex-col bg-gray-50 dark:bg-[#242526] transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-[#3a3b3c]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeChatPartner ? activeChatPartner.username : 'Wybierz rozmowę'}
          </h2>
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <button
              type="button"
              aria-label="Informacje o rozmówcy"
              disabled={!activeChatPartner}
              onClick={() => setIsInfoOpen(true)}
              className="hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ℹ️
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.senderID === user.userID ? 'justify-end' : 'justify-start'}`}>
                {message.senderID !== user.userID && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                    <img
                      src={message.User?.avatarURL || Img}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                )}
                <div className={`${message.senderID === user.userID ? 'bg-orange-400 text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-900 dark:text-gray-200'} rounded-2xl ${message.senderID === user.userID ? 'rounded-br-none' : 'rounded-bl-none'} px-4 py-2 max-w-xs`}>
                  {message.messageContent}
                </div>
                {message.senderID === user.userID && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
                    <img
                      src={user?.avatar || Img}
                      alt="My Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              {activeChatID ? 'Brak wiadomości...' : 'Wybierz rozmowę aby zobaczyć wiadomości'}
            </div>
          )}
        </div>

        {/* Input area */}
        {activeChatID && (
          <div className="p-3 border-t border-gray-300 dark:border-[#3a3b3c] flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Aa"
              className="flex-1 bg-gray-200 dark:bg-[#3a3b3c] text-gray-900 dark:text-white p-2 rounded-full outline-none"
            />
            <button 
              onClick={sendMessage}
              className="ml-3 text-blue-500 text-xl hover:text-blue-600">
              ➤
            </button>
          </div>
        )}
      </div>

      {/* === INFO PANEL (RIGHT, SLIDE IN) === */}
      <div
        className={`${isInfoOpen ? 'w-1/4' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-[#242526] border-l border-gray-300 dark:border-[#3a3b3c]`}
      >
        <div className="h-full flex flex-col">
          {/* Header + podstawowe info */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#3a3b3c]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => activeChatPartner?.userID && navigate(`/user/${activeChatPartner.userID}`)}
                title="Przejdź do profilu"
                className="group cursor-pointer"
                disabled={!activeChatPartner?.userID}
              >
                <img
                  src={activeChatPartner?.avatarURL || partnerDetails?.avatarURL || Img}
                  alt={activeChatPartner ? `${activeChatPartner.username} avatar` : 'Avatar'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#D47C24] transition"
                />
              </button>
              <div>
                <h3 className="text-lg font-semibold">
                  {activeChatPartner ? activeChatPartner.username : 'Brak rozmówcy'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Informacje o użytkowniku i jego aukcjach</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Zamknij panel informacji"
              onClick={() => setIsInfoOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-5 overflow-y-auto text-sm">
            {/* Sekcja danych użytkownika */}
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Dane użytkownika</h4>
              {loadingPartnerInfo && (
                <p className="text-gray-500 dark:text-gray-400">Ładowanie danych...</p>
              )}
              {errorPartnerInfo && (
                <p className="text-red-500">{errorPartnerInfo}</p>
              )}
              {!loadingPartnerInfo && !errorPartnerInfo && (
                <>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Nick:</span> {partnerDetails?.username || activeChatPartner?.username || '-'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Imię i nazwisko:</span> {
                      partnerDetails?.firstName && partnerDetails?.familyName
                        ? `${partnerDetails.firstName} ${partnerDetails.familyName}`
                        : partnerDetails?.firstName || partnerDetails?.familyName || 'Brak danych'
                    }
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Ilość aktywnych aukcji:</span> {
                      partnerOffersCount?.count !== undefined && partnerOffersCount?.count !== null 
                        ? partnerOffersCount.count 
                        : '—'
                    }
                  </p>
                </>
              )}
            </div>

            {/* Statystyka rozmowy */}
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">Rozmowa</h4>
              <p className="text-gray-600 dark:text-gray-400">Wyświetlane wiadomości: {messages.length}</p>
            </div>

            {/* Siatka ofert (max 6) */}
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Aukcje użytkownika</h4>
              {loadingPartnerInfo && (
                <p className="text-gray-500 dark:text-gray-400">Ładowanie aukcji...</p>
              )}
              {!loadingPartnerInfo && partnerOffers.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400">Brak aktywnych aukcji.</p>
              )}
              {partnerOffers.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {partnerOffers.map((offer) => {
                    // Poprawiona ścieżka do obrazka z backendu
                    const image = offer.OfferImages && offer.OfferImages.length > 0 
                      ? offer.OfferImages[0].imageUrl 
                      : Img;
                    
                    return (
                      <button
                        key={offer.offerID}
                        onClick={() => navigate(`/offer/${offer.offerID}`)}
                        className="group relative rounded-md overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] h-20 flex items-center justify-center cursor-pointer"
                        title={offer.title}
                      >
                        <img
                          src={image}
                          alt={offer.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] text-white px-1 text-center">
                          {offer.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Link do pełnego profilu */}
            {activeChatPartner?.userID && (
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/user/${activeChatPartner.userID}`)}
                  className="inline-flex items-center justify-center rounded-md bg-[#D47C24] px-3 py-2 text-white hover:bg-[#bf6e1f] transition-colors w-full text-center cursor-pointer"
                >
                  Zobacz pełny profil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Modal blokady wiadomości */}
    {blockModal.show && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setBlockModal({ show: false, message: '' })}>
        <div className="bg-white dark:bg-[#242526] rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-2xl">⚠</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Wiadomość zablokowana</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {blockModal.message}
              </p>
              <div className="bg-gray-100 dark:bg-[#18191a] rounded p-3 text-xs text-gray-600 dark:text-gray-400">
                <strong>Regulamin Stylify:</strong> Wymiana danych kontaktowych (e-mail, telefon, konta bankowe) w celu ominięcia systemu płatności jest zabroniona i może skutkować zablokowaniem konta.
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => navigate('/contact')}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              Zgłoś błąd
            </button>
            <button
              onClick={() => setBlockModal({ show: false, message: '' })}
              className="px-4 py-2 rounded-md bg-[#D47C24] text-white text-sm font-medium hover:bg-[#bf6e1f] transition"
            >
              Rozumiem
            </button>
          </div>
        </div>
      </div>
    )}
    
    </>
  );
};
