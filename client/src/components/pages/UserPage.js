import { useParams } from 'react-router-dom';
import Avatar from '../../assets/avatar.jpg';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { AuthData } from "../../auth/AuthWrapper";
import { useNavigate } from 'react-router-dom';

export const UserPage = () => {
    const { user } = AuthData();
    const navigate = useNavigate();

    const { id } = useParams();
    const [userData, setUserData] = useState({});
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleMessageClick = async () => {
        try {

            const response = await axios.post('http://localhost:13000/chat/create', {
                user1ID: user.userID,
                user2ID: parseInt(id)
            });
       
            console.log(response.data);
            navigate('/chat');
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuyNow = () => {
        navigate('/payment', { state: { product: selectedProduct } });
    };

    const goToAccount = () => {
        navigate('/account');
    };

    const openModal = (product) => {
        setSelectedProduct(product);
        setModalIsOpen(true);
        setCurrentIndex(0);
      };
  
    const closeModal = () => {
      setSelectedProduct(null);
      setModalIsOpen(false);
    };

    const prevSlide = () => {
        const newIndex = (currentIndex === 0) ? selectedProduct.OfferImages.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
      };
    
      const nextSlide = () => {
        const newIndex = (currentIndex === selectedProduct.OfferImages.length - 1) ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
      };

    const fetchOffers = async () => {
        try {
            const res = await axios.get(`http://localhost:13000/offers/userID/${id}`);
            console.log(res);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        
        const fetchUser = async () => {
          try {
            const response = await fetch(`http://localhost:13000/users/user/${id}`);
            
            if (!response.ok) {
              throw new Error('User not found');
            }
    
            const data = await response.json();
            setUserData(data);         
            setError(null);
          } catch (err) {
            setError(err.message);
            setUserData(null); 
          } finally {
            
          }
        };
    
        fetchUser();
        fetchOffers();
      }, [id]);

    const [error, setError] = useState(null);

    if (error) {
        return <p>{error}</p>;
      }


    return (
        <>
            <link rel="stylesheet" href="https://demos.creative-tim.com/notus-js/assets/styles/tailwind.css"/>
            <link rel="stylesheet" href="https://demos.creative-tim.com/notus-js/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css"/>

            <main className="profile-page">
            <section className="relative block h-500-px">
                <div
                className="absolute top-0 w-full h-full bg-center bg-cover"
                style={{backgroundImage: `url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')`,}}>
                <span id="blackOverlay" className="w-full h-full absolute opacity-50 bg-black"></span>
                </div>
                <div
                className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
                style={{ transform: 'translateZ(0px)' }}
                >
                <svg
                    className="absolute bottom-0 overflow-hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    version="1.1"
                    viewBox="0 0 2560 100"
                    x="0"
                    y="0"
                >
                    <polygon
                    className="text-blueGray-200 fill-current"
                    points="2560 0 2560 100 0 100"
                    ></polygon>
                </svg>
                </div>
            </section>

            <section className="relative py-16 bg-blueGray-200">
                <div className="container mx-auto px-4">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
                    <div className="px-6">
                    <div className="flex flex-wrap justify-center">
                        <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                            <div className="relative">
                                <img
                                alt="..."
                                src={userData.avatarURL || Avatar}
                                className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                                />
                            </div>
                        </div>

                        <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                            <div className="py-6 px-3 mt-32 sm:mt-0">
                            {user.userID !== parseInt(id) && (
                                <button
                                className="bg-orange-600 active:bg-pink-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={handleMessageClick}
                                >
                                Message
                                </button>
                            )}
                            </div>
                        </div>

                        <div className="w-full lg:w-4/12 px-4 lg:order-1">
                            <div className="flex justify-center py-4 lg:pt-4 pt-8">
                                <div className="mr-4 p-3 text-center">
                                    <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                                        10
                                    </span>
                                    <span className="text-sm text-blueGray-400">Auctions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                                <div class="flex justify-center items-center mb-8">
                                    <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <svg class="w-4 h-4 text-gray-300 me-1 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <p class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">4.95</p>
                                    <p class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">out of</p>
                                    <p class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">5</p>
                                </div>
                        <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700">
                            {userData.username}
                        </h3>
 
                        <div className="mb-2 text-blueGray-600 mt-10">
                        
                        Solution Manager - Creative Tim Officer
                        </div>
                        <div className="mb-2 text-blueGray-600">
                        
                        University of Computer Science
                        </div>
                    </div>

                    <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                        <section className="w-fit mb-32 mx-auto grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 justify-items-center justify-center gap-y-16 gap-x-14 mt-10 mb-5">
                            {products.map((product) => (
                                <div
                                key={product.offerID}
                                className="w-72 bg-white shadow-md rounded-xl duration-300 hover:scale-105 hover:shadow-[5px_5px_rgba(212,124,36,0.9),_10px_10px_rgba(212,124,36,0.6),_15px_15px_rgba(212,124,36,0.4),_20px_20px_rgba(212,124,36,0.2)]">
                                <img
                                    src={product.OfferImages[0]?.imageUrl}
                                    alt="Product"
                                    className="h-80 w-72 object-cover rounded-t-xl hover:cursor-pointer"
                                    onClick={() => openModal(product)}
                                />
                                <div className="px-4 py-3 w-72">
                                    <span className="text-gray-400 mr-3 uppercase text-xs">{product.category}</span>
                                    <p className="text-lg font-bold text-black truncate block capitalize">{product.title}</p>
                                    <p className="text-lg font-semibold text-black cursor-auto my-3">{product.price} $</p>                                                                
                                </div>
                                </div>
                            ))}
                        </section>
                        {selectedProduct && (
                            <>
                            <div
                                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                            >
                                <div className="relative w-3/4 my-6 mx-auto max-w-4xl">                           
                                <div className="border-0 rounded-lg shadow-lg relative p-6 flex flex-col w-full bg-white outline-none focus:outline-none">
                                    <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        Offer details
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-50 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={closeModal}
                                    >
                                        <IoIosCloseCircleOutline />
                                    </button>
                                    </div>
                                    <div className="flex">
                                    <div className="w-1/2 h-96 py-8 px-4 relative group">
                                        <div
                                        style={{ backgroundImage: `url(${selectedProduct.OfferImages[currentIndex]?.imageUrl})` }}
                                        className="w-full h-full rounded-2xl bg-center bg-cover duration-500"
                                        />
                                        <div
                                        className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer"
                                        onClick={prevSlide}
                                        >
                                        <FaRegArrowAltCircleLeft size={30} />
                                        </div>
                                        <div
                                        className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer"
                                        onClick={nextSlide}
                                        >
                                        <FaRegArrowAltCircleRight size={30} />
                                        </div>
                                    </div>
                                    <div className="w-1/2 p-6 ml-8 overflow-y-auto max-h-96">

                                        <div className="w-full flex justify-between items-center">
                                        <h2 className="company text-orange-600 uppercase font-bold text-sm sm:text-md tracking-wider py-2">
                                            {selectedProduct.category}
                                        </h2>
                                        </div>         
                                        <h3 className="product mt-2 capitalize text-very-dark-blue font-bold text-4xl py-2 border-b border-gray-200">
                                            {selectedProduct.title}
                                        </h3>
                                        <p className="text-dark-grayish-blue lg:leading-6 border-b border-gray-200 py-4">
                                            {selectedProduct.description}
                                        </p>
                                        <div className="mt-4 amount font-bold flex items-center justify-between lg:flex-col lg:items-start mb-6">
                                        <div className="discount-price items-center flex">
                                            <div className="price text-3xl">${selectedProduct.price}</div>
                                        </div>
                                        </div>
                                        {user.isAuthenticated && user.userID !== selectedProduct.ownerID && (    
                                        <button onClick={handleBuyNow} className="flex bg-orange-500 mt-6 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-dark transition duration-300">
                                            <i className="flex cursor-pointer text-white text-xl leading-0 pr-3">
                                            <FaCartShopping className="pr-4 w-8 h-8" /> BUY NOW!
                                            </i>
                                        </button>
                                        )}
                                        {user.isAuthenticated && user.userID === selectedProduct.ownerID && (
                                        <button onClick={goToAccount} className="flex bg-orange-500 mt-6 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-dark transition duration-300">
                                            <i className="flex cursor-pointer text-white text-xl leading-0 pr-3">
                                            TO MANAGE OFFER, CLICK HERE
                                            </i>
                                        </button>
                                        )}
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                            </>
                        )}
                    </div>
                    </div>
                </div>
                </div>
            </section>
            </main>
        
        </>
    )
}