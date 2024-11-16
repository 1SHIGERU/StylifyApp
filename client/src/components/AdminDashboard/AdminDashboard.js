import React, { useEffect, useState } from "react";
import { AuthData } from "../../auth/AuthWrapper";
import { ErrorPage } from "../pages/ErrorPage";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Avatar from '../../assets/avatar.jpg';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
  } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {

  const { user } = AuthData(); 

  const [activeOffers, setActiveOffers] = useState(0);
  const [accountsRegistered, setAccountRegistered] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);
  const [totallyEarned, setTotallyEarned] = useState(0);
  const [usersList, setUsersList] = useState([]);

  const countActiveOffers = async () => {
    try {
      const res = await axios.get("http://localhost:13000/offers/countOffers/1");
      setActiveOffers(res.data.count);
    } catch (err) {
      console.error(err.message);
    }
  }

  const countUsers = async () => {
    try {
      const res = await axios.get("http://localhost:13000/users/all");
      setUsersList(res.data.users)
      setAccountRegistered(res.data.countUsers);
    } catch (err) {
      console.error(err.message);
    }
  }

  const countItemsSold = async () => {
    try {
      const res = await axios.get("http://localhost:13000/transactions/history/1");
      setItemsSold(res.data.count);
    } catch (err) {
      console.error(err.message);
    }
  }

  const sumTransactions = async () => {
    try {
      const res = await axios.get("http://localhost:13000/transactions/sumTransactions/1");
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
      const res = await axios.get("http://localhost:13000/users/dataToChart");
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


  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Users", icon: "👤" },
    { name: "Settings", icon: "⚙️" },
    { name: "Analytics", icon: "📊" },
  ];

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchChartData = async () => {
    try {
        const res = await axios.get("http://localhost:13000/offers/countOffersByCategory");
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

  const renderCards = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
            <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card title="Active offers" value={activeOffers} />
            <Card title="Accounts registered" value={accountsRegistered} />
            <Card title="Items sold" value={itemsSold} />
            <Card title="Totally earned" value={"$"+totallyEarned} />
          </div>
          <div className="flex">
          <div className="flex flex-col w-96 h-96 bg-white shadow-md p-16 rounded-xl justify-center items-center mt-8 duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
          <h2 class="lg:text-xl mb-8 text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                Active offers by category
            </h2>
            {chartData && chartData.labels.length > 0 ? (
                <Pie data={chartData} />
            ) : (
                <p>Loading chart...</p>
            )}
          </div>
          <div className="ml-16 flex flex-col w-96 h-96 bg-white shadow-md p-6 rounded-xl justify-center items-center mt-8 duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
            <h2 class="lg:text-xl mb-8 text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                Accounts registered per month
            </h2>
            {userChartData && userChartData.labels.length > 0 ? (
                <Line data={userChartData} />
            ) : (
                <p>Loading chart...</p>
            )}
          </div>
          </div>
          </>
        );
      case "Users":
        return (
          <div className="flex flex-col space-y-4">
            {usersList.map((user) => (
                <UserCard
                key={user.userID}
                userID={user.userID}
                username={user.username}
                firstName={user.firstName}
                avatarURL={user.avatarURL}
                desc={user.description}
                createdAt={user.createdAt}
              />
            ))}
          </div>
        );
      case "Settings":
        return (
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <p className="text-gray-600">Here you can manage your application settings.</p>
          </div>
        );
      case "Analytics":
        return (
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Analytics</h2>
            <p className="text-gray-600">View detailed analytics for your app performance.</p>
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
}
, []);

if(!user.isAdmin) return <ErrorPage/>

  return (
    <div className="flex h-screen pt-16">
      <div className="text-gray-500 w-1/5 p-6 ">
            <h2 class="lg:text-3xl mb-8 text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                Admin panel
            </h2>
        <ul className="space-y-6">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`flex items-center gap-4 cursor-pointer p-2 ${
                activeSection === item.name ? "text-gray-800 border-r-2 border-orange-500 font-bold" : ""
              }`}
              onClick={() => setActiveSection(item.name)}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-lg">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 min-h-screen  bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-6">{activeSection}</h1>
        {renderCards()}
      </div>
    </div>
  );
};

const Card = ({ title, value, growth, color }) => {
  return (
    <div className="bg-white shadow-md p-6 rounded-lg duration-300 hover:scale-105 hover:shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
      <div className="flex items-center justify-between mt-4">
        <span className="text-3xl font-bold">{value}</span>
        <span
          className={`text-sm font-medium ${
            color === "green" ? "text-green-500" : "text-red-500"}`}>
          {growth}
        </span>
      </div>
    </div>
  );
};

const UserCard = ({ userID, username, firstName, avatarURL, desc, isAdmin, createdAt }) => {

    const navigate = useNavigate();
    return (
    <div key={userID} className="flex space-x-4 py-4 border-b border-gray-200 w-5/5">
       <img
        onClick={() => navigate(`/user/${userID}`)}
        src={avatarURL || Avatar}
        alt="profile"
        className="w-20 h-20 rounded-full object-cover cursor-pointer"/>
            <div className="flex-1">
                <div className="flex items-center space-x-16">
                    <span className="font-semibold text-xl">{username}</span>                          
                    <div className="flex text-gray-500 space-x-1">
                       {firstName}
                    </div>
                </div>
                <p className="text-gray-700">{desc}</p>
            </div>
            <span className="text-gray-400 text-sm">
                utworzono: {new Date(createdAt).toLocaleDateString()}
            </span>
    </div>
  );
};

export default AdminDashboard;
