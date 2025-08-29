import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthData } from "../../auth/AuthWrapper";
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import Loading from '../Loading';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Avatar from '../../assets/avatar.jpg';

const Favourites = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = AuthData();
  const navigate = useNavigate();

  const removeFromFavourites = async (offerID) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}users/deleteFavourite/`, {
        data: {
          userID: user.userID,
          offerID: offerID,
        },
      });
      setProducts(products.filter(product => product.offerID !== offerID));
    } catch (error) {
      console.error('Error removing from favourites:', error.message);
    }
  };

  const fetchFavourites = async () => {
    try {
      const { data: favouriteOffers } = await axios.get(`${process.env.REACT_APP_API_URL}users/getFavourites/${user.userID}`);
      const offersWithDetails = await Promise.all(
        favouriteOffers.map(async (fav) => {
          const { data: offer } = await axios.get(`${process.env.REACT_APP_API_URL}offers/${fav.offerID}`);
          return offer;
        })
      );
      console.log(offersWithDetails);
      setProducts(offersWithDetails);
    } catch (error) {
      console.error('Error fetching favourites:', error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (user && user.userID) {
        await fetchFavourites();
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

    const handleBuyNow = () => {
      navigate('/payment', { state: { product: selectedProduct } });
    };

    if (loading) {
      return <Loading />;
    }


    return (
      <>
        <h1 className='text-4xl font-bold mb-4 dark:text-[#F6C177]'>Favourites</h1>
        <h1 className='text-xl font-bold mb-2 text-orange-700 dark:text-[#F6C177]'>{products.length} offers</h1>
        <hr />
 
          {products.length === 0 
          ? 
          <>
            <div className="flex h-64 flex-col">
                <div className="flex flex-1 items-center justify-center">
                    <div className="mx-auto max-w-xl px-4 py-8 text-center">
                         <h1 className="text-2xl font-bold dark:text-[#F6C177] tracking-tight text-gray-900 sm:text-4xl">
                            You don't have any favourite offers.
                         </h1>
                         <p className="mt-4 text-gray-500">
                            Go to <a onClick={() => navigate("/market")} className="font-bold text-[#8B4513] cursor-pointer">market</a> to find some offers you like.
                         </p>                
                    </div>
              </div>
          </div>
            
          </>
           :    
          <>
           <section className="w-fit mb-32 mx-auto grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 justify-items-center justify-center gap-y-16 gap-x-14 mt-10 mb-5">
              {products.map((product) => (
                <div
                  key={product.offerID}
                  onClick={() => openModal(product)}
                  className="w-56 bg-white shadow-md rounded-xl duration-300 hover:scale-105 hover:shadow-[5px_5px_rgba(212,124,36,0.9),_10px_10px_rgba(212,124,36,0.6),_15px_15px_rgba(212,124,36,0.4),_20px_20px_rgba(212,124,36,0.2)]"
                >
                  <img
                    src={product.OfferImages[0]?.imageUrl}
                    alt="Product"
                    className="h-60 w-72 object-cover rounded-t-xl hover:cursor-pointer"
                  />
                  <div className="px-4 py-3 w-56">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 uppercase text-xs">{product.category}</span>
                      <p className="text-gray-500 text-xs">{new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-400 text-xs">{product.size}</p>
                    <p className="text-lg font-bold text-black truncate block capitalize">{product.title}</p>
                    <div className="flex justify-between items-center my-3">
                      <p className="text-lg font-semibold text-black cursor-auto">{product.price} <span className='font-bold'>{product.currency}</span></p>
                      <div className="text-2xl text-orange-400 hover:cursor-pointer">
                        <a
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.error('Offer removed from favourites', { position: "top-center" });
                            removeFromFavourites(product.offerID);
                          }}
                        >
                          🧡
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
          }
        
        {selectedProduct && (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-3/4 my-6 mx-auto max-w-4xl">
              <div className="border-0 rounded-lg shadow-lg relative p-6 flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">Offer details</h3>
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
                    ></div>
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
                  <div className="w-1/2 p-6 ml-8 no-scrollbar overflow-y-auto max-h-96">
                    <div className="w-full flex justify-between items-center">
                      <h2 className="company text-orange-600 uppercase font-bold text-sm sm:text-md tracking-wider py-2">
                        {selectedProduct.category}
                      </h2>
                      <Link to={`/user/${selectedProduct.ownerID}`}>
                        <div title={`${selectedProduct.isBanned ? 'Użytkownik zbanowany' : ''}`} className="flex items-center space-x-2 cursor-pointer">
                          <img src={selectedProduct.avatarURL || Avatar} alt="avatar" className={`w-10 h-10 rounded-full${selectedProduct.isBanned ? ' border-2 border-red-500' : ''}`} />
                          <div className="text-black text-md">{selectedProduct.username}</div>
                        </div>
                      </Link>
                    </div>         
                    <h3 className="product mt-2 capitalize text-very-dark-blue font-bold text-4xl py-2 border-b border-gray-200">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-dark-grayish-blue lg:leading-6 border-b border-gray-200 py-4">
                      {selectedProduct.description}
                    </p>
                    <div className="mt-4 amount flex items-center justify-between lg:flex-col lg:items-start border-b border-gray-200 mb-6">
                      <div className="discount-price items-center flex py-2">
                        <div className="price text-2xl">{selectedProduct.price} <span className='font-bold'>{selectedProduct.currency}</span></div>
                      </div>
                    </div>
                    <div className="mt-4 amount flex items-center justify-between lg:flex-col lg:items-start mb-6">
                      <div className="discount-price items-center flex">
                        <div className="price text-3xl">Size: {selectedProduct.size}</div>
                        {selectedProduct.colors && selectedProduct.colors.length > 0 ? (
                          <div className="flex space-x-2 ml-40">
                            {(Array.isArray(selectedProduct.colors) ? selectedProduct.colors : selectedProduct.colors.split(","))
                              .map((color) => (
                                <div
                                  key={color}
                                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: color.trim().toLowerCase() }}
                                  title={color.trim()}
                                ></div>
                              ))}
                          </div>
                        ) : (
                          <div className="ml-4 text-gray-500"></div>
                        )}
                      </div>
                    </div>
                    {user.isAuthenticated && user.userID !== selectedProduct.ownerID && (    
                      <button onClick={handleBuyNow} className="flex bg-orange-500 mt-6 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-dark transition duration-300">
                        <i className="flex cursor-pointer text-white text-xl leading-0 pr-3">
                          <FaCartShopping className="pr-4 w-8 h-8" /> BUY NOW!
                        </i>
                      </button>
                    )}         
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div onClick={closeModal} className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      )}
      </>
    );
  };
  
  export default Favourites;