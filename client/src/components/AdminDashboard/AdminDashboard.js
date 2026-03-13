// AdminDashboard.js
import React, { useEffect, useState } from "react";
import { AuthData } from "../../auth/AuthWrapper";
import { ErrorPage } from "../pages/ErrorPage";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Avatar from '../../assets/avatar.jpg';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
  } from "chart.js";
import { set } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {

  const { user } = AuthData(); 

  const [activeOffers, setActiveOffers] = useState(0);
  const [accountsRegistered, setAccountRegistered] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);
  const [totallyEarned, setTotallyEarned] = useState(0);
  const [usersList, setUsersList] = useState([]);

  // Moderation states
  const [moderationFlags, setModerationFlags] = useState([]);
  const [loadingFlags, setLoadingFlags] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [chatContextMessages, setChatContextMessages] = useState([]);
  const [showContextModal, setShowContextModal] = useState(false);
  const [moderationPolling, setModerationPolling] = useState(null);

  const countActiveOffers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}offers/countOffers`);
      setActiveOffers(res.data.count);
    } catch (err) {
      console.error(err.message);
    }
  }

  const countUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}users/all`);
      setUsersList(res.data.users)
      setAccountRegistered(res.data.countUsers);
    } catch (err) {
      console.error(err.message);
    }
  }

  const countItemsSold = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}transactions/history/1`);
      setItemsSold(res.data.count);
    } catch (err) {
      console.error(err.message);
    }
  }

  const sumTransactions = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}transactions/sumTransactions/1`);
      setTotallyEarned(res.data.sumSold);
    } catch (err) {
      console.error(err.message);
    }
  }

    const [userChartData, setUserChartData] = useState({
    labels: [],
    datasets: [],
    });

  const getUserChartData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}users/dataToChart`);
      const data = res.data;
      setUserChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Accounts registered per month",
            data: data.values,
            borderColor: "#8B4513",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
            pointBackgroundColor: "#8B4513",
            pointRadius: 5,
          },
        ],
        });

    } catch (err) {
      console.error(err.message);
    }
  }

  const [contactMessages, setContactMessages] = useState([]);

  const getContactMessages = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}chat/getContactMessages`);
      setContactMessages(res.data);
    } catch (err) {
      console.error(err.message);
    }
  }

  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Users", icon: "👤" },
    { name: "Messages", icon: "✉️" },
    { name: "Analytics", icon: "📊" },
    { name: "Moderation", icon: "🛡️" }, // new moderation tab
  ];

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchChartData = async () => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}offers/countOffersByCategory`);
        const categories = res.data.categories;
    
        const data = categories.map(cat => cat.count);
        const labels = categories.map(cat => cat.name);

        setChartData({
            labels,
            datasets: [
              {
                label: "Items by Category",
                data,
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                ],
                borderColor: "#fff",
                borderWidth: 1,
              },
            ],
          });
        
    } catch (err) {
        console.error(err.message);
    }
 };

  const [activeSection, setActiveSection] = useState("Dashboard");

  const handleMessageDelete = async (id) => {
    try {
      console.log(id);
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}chat/deleteContactMessage/${id}`);
      getContactMessages();
    } catch (err) {
      console.error(err.message);
    }
  }

  // ---------- Moderation functions ----------

  // Fetch pending flags for moderation
  const fetchModerationFlags = async () => {
    try {
      setLoadingFlags(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}moderation/flags?status=pending&limit=50`);
      // Expecting array of flags with nested Message object
      setModerationFlags(res.data || []);
      setLoadingFlags(false);
    } catch (err) {
      console.error("Failed to fetch moderation flags:", err?.response?.data || err.message);
      setLoadingFlags(false);
    }
  };

  // Mark a flag as tp|fp|ban
  const markFlag = async (flagId, decision, note = "") => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}moderation/flags/${flagId}/mark`, {
        decision, moderatorID: user.userID || 1, note
      });
      toast.success("Saved moderator decision", { position: "top-center" });
      // refresh list
      fetchModerationFlags();
    } catch (err) {
      console.error("Failed to mark flag:", err?.response?.data || err.message);
      toast.error("Failed to save decision", { position: "top-center" });
    }
  };

  // Override/unblock a specific flag/message
  const overrideFlag = async (flagId, action = 'unblock', note = '') => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}moderation/flags/${flagId}/override`, {
        action, moderatorID: user.userID || 1, note
      });
      toast.success("Override applied", { position: "top-center" });
      fetchModerationFlags();
    } catch (err) {
      console.error("Override failed:", err?.response?.data || err.message);
      toast.error("Override failed", { position: "top-center" });
    }
  };

  // Show chat context (last N messages) for a given flag
  const openContextForFlag = async (flag) => {
    try {
      setSelectedFlag(flag);
      const chatID = flag.Message?.chatID || flag.chatID;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}chat/${chatID}/messages?limit=20`);
      setChatContextMessages(res.data || []);
      setShowContextModal(true);
    } catch (err) {
      console.error("Failed to fetch chat context:", err?.response?.data || err.message);
      toast.error("Failed to fetch chat context", { position: "top-center" });
    }
  };

  // ---------- end moderation functions ----------

  const renderCards = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
            <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card title="Active offers" value={activeOffers} />
            <Card title="Accounts registered" value={accountsRegistered} />
            <Card title="Items sold" value={itemsSold} />
            <Card title="In total" value={"$"+totallyEarned} />
          </div>
          <div className="flex ">
          <div className="flex flex-col w-96 h-96 dark:bg-[#2d2d30] shadow-md p-16 rounded-xl justify-center items-center mt-8 duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
          <h2 className="lg:text-xl mb-8 dark:text-[#F6C177] text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                Active offers by category
            </h2>
            {chartData && chartData.labels.length > 0 ? (
                <Pie data={chartData} />
            ) : (
                <p>Loading chart...</p>
            )}
          </div>
          <div className="ml-16 flex flex-col w-96 h-96 dark:bg-[#2d2d30]  shadow-md p-6 rounded-xl justify-center items-center mt-8 duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
            <h2 className="lg:text-xl dark:text-[#F6C177] mb-8 text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                Accounts registered per month
            </h2>
            {userChartData && userChartData.labels.length > 0 ? (
                
                <Line data={userChartData}
                options={{
                  scales: {
                    y: {
                      suggestedMin: Math.min(userChartData.datasets[0].data[0]) - 1,
                      suggestedMax: Math.max(userChartData.datasets[0].data[1]) + 1,
                      ticks: {
                        stepSize: 1, 
                        color: "#8B4513", 
                      },
                    },
                    x: {
                      ticks: {
                        color: "#8B4513", 
                        font: {
                          size: 14,
                        },
                      },
                    },
                  },
                }}
                        
                />
            ) : (
                <p>Loading chart...</p>
            )}
          </div>
          </div>
          </>
        );
      case "Users":
        return (
          <div className="flex h-auto flex-col space-y-4">
            {usersList.map((user) => (
              <UserCard
                key={user.userID}
                userID={user.userID}
                username={user.username}
                firstName={user.firstName}
                avatarURL={user.avatarURL}
                desc={user.description}
                createdAt={user.createdAt}
                familyName={user.familyName}
                isBanned={user.isBanned}
              />
            ))}
          </div>
        );
      case "Messages":
        return (
          <section className="">
            {contactMessages.length === 0 && (
              <p className="text-gray-600">No messages to display.</p>
            )}
            <div className="px-4 mx-auto overflow-scroll no-scrollbar  max-w-7xl sm:px-6 lg:px-8">    
                <div className="grid mb-8 grid-cols-1 gap-6 px-4 mt-12 sm:px-0 xl:mt-20 xl:grid-cols-4 sm:grid-cols-2">        
                  {contactMessages.map((item) => (
                      <div key={item.contactMessageID} className="overflow-hidden bg-white shadow-xl p-6 rounded-lg duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.3)]">
                      <p onClick={() => handleMessageDelete(item.contactMessageID)} className="block right-0 top-0 text-red-500 hover:cursor-pointer">X</p>
                          <div className="px-2 py-6">     
                              <div className="flex items-center justify-between">
                                  <img className="flex-shrink-0 object-cover w-10 h-10 rounded-full" src={Avatar} alt="" />
                                  <div className="min-w-0 ml-3 mr-auto">
                                      <p className="text-base font-semibold text-black truncate">{item.fullName}</p>{item.phoneNumber}
                                      <p className="text-sm text-gray-600 truncate">{item.companyName}</p>
                                  </div>
                              </div>
                              <blockquote className="mt-5">
                                  <p className="text-base text-gray-800">
                                      {item.message}
                                      <span className="block text-orange-500 mt-4">{new Date(item.createdAt).toLocaleDateString()}</span>
                                  </p>
                              </blockquote>
                          </div>
                      </div>      
                  ))}                      
                </div>
            </div>
          </section>

        );
      case "Analytics":
        return (
          <div className="p-4 shadow-md rounded-lg">
            <h2 className="text-xl dark:text-[#F6C177] font-bold mb-4">Analytics</h2>
            <p className="text-gray-500">View detailed analytics for your app performance.</p>
          </div>
        );

      // ---------- Moderation UI ----------
      case "Moderation":
        return (
          <div className="p-4">
            <h2 className="text-lg dark:text-[#F6C177] font-semibold mb-4">Moderation queue</h2>

            <div className="mb-4">
              <button
                onClick={() => fetchModerationFlags()}
                className="px-4 py-2 bg-[#8B4513] text-white rounded-md mr-2"
              >
                Refresh
              </button>
              <button
                onClick={() => { setModerationFlags([]); fetchModerationFlags(); }}
                className="px-4 py-2 border rounded-md"
              >
                Clear & fetch
              </button>
            </div>

            {loadingFlags ? (
              <p>Loading...</p>
            ) : moderationFlags.length === 0 ? (
              <p>No pending flags.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-[#2d2d30] rounded-md">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">When</th>
                      <th className="px-4 py-2 text-left">Label</th>
                      <th className="px-4 py-2 text-left">Confidence</th>
                      <th className="px-4 py-2 text-left">Snippet</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moderationFlags.map((f) => (
                      <tr key={f.id} className="border-t">
                        <td className="px-4 py-2">{new Date(f.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2">{f.label}</td>
                        <td className="px-4 py-2">{(f.confidence || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 max-w-xl truncate">{f.Message?.messageContent?.slice(0,100)}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => openContextForFlag(f)} className="px-3 py-1 bg-gray-200 rounded">Show</button>
                            <button onClick={() => markFlag(f.id, 'tp')} className="px-3 py-1 bg-green-500 text-white rounded">TP</button>
                            <button onClick={() => markFlag(f.id, 'fp')} className="px-3 py-1 bg-yellow-500 text-white rounded">FP</button>
                            <button onClick={() => markFlag(f.id, 'ban')} className="px-3 py-1 bg-red-600 text-white rounded">Ban</button>
                            <button onClick={() => overrideFlag(f.id, 'unblock')} className="px-3 py-1 border rounded">Unblock</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Context Modal */}
            {showContextModal && selectedFlag && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-[#1f1f1f] w-11/12 max-w-4xl p-6 rounded-md shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Flag context — {selectedFlag.label}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowContextModal(false); setSelectedFlag(null); }} className="px-3 py-1 border rounded">Close</button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Flag reason: {selectedFlag.reason} — detector: {selectedFlag.detector}</p>
                    <p className="text-sm text-gray-500">Flag confidence: {(selectedFlag.confidence || 0).toFixed(2)}</p>
                  </div>

                  <div className="h-96 overflow-auto border rounded p-3 bg-gray-50 dark:bg-[#111111]">
                    <h4 className="font-semibold mb-2">Chat context (last messages)</h4>
                    {chatContextMessages.length === 0 ? (
                      <p>No context available.</p>
                    ) : (
                      chatContextMessages.map(m => (
                        <div key={m.messageID} className={`mb-3 ${m.flagged ? 'border-l-4 border-red-500 pl-2' : 'pl-2'}`}>
                          <div className="flex items-center justify-between">
                            <strong>{m.senderID === selectedFlag.Message?.senderID ? 'Sender' : 'Other'}</strong>
                            <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.messageContent}</p>
                          {m.flagged && <span className="text-xs text-red-500">FLAGGED: {m.flaggedLabel}</span>}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { markFlag(selectedFlag.id, 'tp'); setShowContextModal(false); }} className="px-4 py-2 bg-green-600 text-white rounded">Confirm (TP)</button>
                    <button onClick={() => { markFlag(selectedFlag.id, 'fp'); setShowContextModal(false); }} className="px-4 py-2 bg-yellow-500 text-white rounded">False positive (FP)</button>
                    <button onClick={() => { markFlag(selectedFlag.id, 'ban'); setShowContextModal(false); }} className="px-4 py-2 bg-red-600 text-white rounded">Ban user</button>
                    <button onClick={() => { overrideFlag(selectedFlag.id, 'unblock'); setShowContextModal(false); }} className="px-4 py-2 border rounded">Unblock</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        );

      default:
        return <p>No section selected</p>;
    }
  };

  useEffect(() => {
    countActiveOffers();
    countUsers();
    countItemsSold();   
    sumTransactions();  
    fetchChartData();
    getUserChartData();
    getContactMessages();

    // start periodic moderation polling when Moderation tab is active
    if (activeSection === "Moderation") {
      fetchModerationFlags();
      const iv = setInterval(fetchModerationFlags, 8000);
      setModerationPolling(iv);
    } else {
      if (moderationPolling) {
        clearInterval(moderationPolling);
        setModerationPolling(null);
      }
    }

    return () => {
      if (moderationPolling) {
        clearInterval(moderationPolling);
      }
    };
  }
, [activeSection]);

if(!user.isAdmin) return <ErrorPage/>

  return (
    <div className="flex h-screen pt-16">
      <div className="text-gray-500 dark:bg-[#2d2d30] w-1/5 p-6 shadow-md ">
            <h2 className="lg:text-3xl dark:text-[#F6C177] mb-8 text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                Admin panel
            </h2>
        <ul className="space-y-6">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`flex transition duration-200 dark:text-[#F6C177] items-center gap-4 cursor-pointer p-2 ${
                activeSection === item.name ? "text-gray-800 border-r-2 dark:border-[#F6C177] border-orange-500 font-bold" : "hover:scale-105"
              }`}
              onClick={() => setActiveSection(item.name)}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-lg">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-8 dark:bg-[#252526]">
        <h1 className="text-3xl dark:text-[#F6C177]  font-bold mb-6">{activeSection}</h1>
        {renderCards()}
      </div>
    </div>
  );
};

const Card = ({ title, value, growth, color }) => {
  return (
    <div className="shadow-md dark:bg-[#2d2d30] p-6 rounded-lg duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      <h2 className="text-lg dark:text-gray-300 font-semibold text-gray-600">{title}</h2>
      <div className="flex items-center justify-between mt-4">
        <span className="text-3xl font-bold dark:text-[#F6C177]">{value}</span>
        <span
          className={`text-sm font-medium ${
            color === "green" ? "text-green-500" : "text-red-500"}`}>
          {growth}
        </span>
      </div>
    </div>
  );
};

const UserCard = ({ userID, username, firstName,familyName , avatarURL, desc, isAdmin, createdAt, isBanned }) => {

  const handleUserBanStatus = async (userID, action) => {
    try {
      const url = action === "ban" 
        ? `${process.env.REACT_APP_API_URL}users/ban/${userID}` 
        : `${process.env.REACT_APP_API_URL}users/unban/${userID}`;
  
      await axios.put(url);
  
      toast.success(
        action === "ban" 
          ? "User has been banned successfully." 
          : "User has been unbanned successfully.", 
        { position: "top-center" }
      );

      window.location.reload();
    } catch (error) {
      console.error("Error updating user ban status:", error);
      toast.error("Failed to update user ban status.", { position: "top-center" });
    }
  };
  const navigate = useNavigate();


    return (
    <div key={userID} className="flex space-x-4 py-4 border-b border-gray-200 w-5/5">
       <img
        onClick={() => navigate(`/user/${userID}`)}
        src={avatarURL || Avatar}
        alt="profile"
        className={`w-20 h-20  rounded-full object-cover cursor-pointer ${isBanned ? 'border-2 border-red-500' : 'border-none'}`}/>
            <div className="flex-1">
                <div className="flex items-center space-x-16">
                    <span className="font-semibold dark:text-[#F6C177] text-xl">{username}</span>                          
                    <div className="flex text-gray-500 space-x-1">
                       {firstName} {familyName}
                    </div>
                </div>
                <p className="text-gray-700">{desc}</p>
                {isBanned && (
                  <a onClick={() => handleUserBanStatus(userID, "unban")} className="mt-4 relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-green-500 rounded-full shadow-md group">
                     <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-green-500 group-hover:translate-x-0 ease">
                     <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.032 12 1.984 1.984 4.96-4.96m4.55 5.272.893-.893a1.984 1.984 0 0 0 0-2.806l-.893-.893a1.984 1.984 0 0 1-.581-1.403V7.04a1.984 1.984 0 0 0-1.984-1.984h-1.262a1.983 1.983 0 0 1-1.403-.581l-.893-.893a1.984 1.984 0 0 0-2.806 0l-.893.893a1.984 1.984 0 0 1-1.403.581H7.04A1.984 1.984 0 0 0 5.055 7.04v1.262c0 .527-.209 1.031-.581 1.403l-.893.893a1.984 1.984 0 0 0 0 2.806l.893.893c.372.372.581.876.581 1.403v1.262a1.984 1.984 0 0 0 1.984 1.984h1.262c.527 0 1.031.209 1.403.581l.893.893a1.984 1.984 0 0 0 2.806 0l.893-.893a1.985 1.985 0 0 1 1.403-.581h1.262a1.984 1.984 0 0 0 1.984-1.984V15.7c0-.527.209-1.031.581-1.403Z"/>
                      </svg>
                     </span>
                   <span className="absolute flex items-center justify-center w-full h-full text-green-500 transition-all duration-300 transform group-hover:translate-x-full ease">UNBAN</span>
                   <span className="relative invisible">UNBAN</span>
                 </a>
                )}
                {!isBanned && (
                  <a onClick={() => handleUserBanStatus(userID, "ban")} className="mt-4 relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-red-500 rounded-full shadow-md group">
                      <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-red-500 group-hover:translate-x-0 ease">
                        <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                      </span>
                    <span className="absolute flex items-center justify-center w-full h-full text-red-500 transition-all duration-300 transform group-hover:translate-x-full ease">BAN</span>
                    <span className="relative invisible">BAN</span>
                  </a>
                )}
        
            </div>
            <span className="text-gray-400 text-sm">
                utworzono: {new Date(createdAt).toLocaleDateString()}
            </span>
    </div>
  );
};

export default AdminDashboard;
