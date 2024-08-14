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

const Favourites = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = AuthData();
  const navigate = useNavigate();

  const removeFromFavourites = async (offerID) => {
    try {
      await axios.delete(`http://localhost:13000/users/deleteFavourite/`, {
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
      const { data: favouriteOffers } = await axios.get(`http://localhost:13000/users/getFavourites/${user.userID}`);
      const offersWithDetails = await Promise.all(
        favouriteOffers.map(async (fav) => {
          const { data: offer } = await axios.get(`http://localhost:13000/offers/${fav.offerID}`);
          return offer;
        })
      );
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
      setCurrentIndex(0); // Reset current index when opening a new modal
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
        <h1 className='text-4xl font-bold mb-4'>Favourites</h1>
        <h1 className='text-xl font-bold mb-2 text-orange-700'>{products.length} offers</h1>
        <hr />
 
          {products.length === 0 
          ? 
          <>
            <div className="flex h-64 flex-col bg-white">
                <div className="flex flex-1 items-center justify-center">
                    <div className="mx-auto max-w-xl px-4 py-8 text-center">
                         <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            You don't have any favourite offers.
                         </h1>
                         <p className="mt-4 text-gray-500">
                            Go to <a href='/market' className="font-bold text-[#8B4513]">market</a> to find some offers.
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
                className="w-44 bg-white shadow-md rounded-xl duration-300 hover:scale-105 hover:shadow-[5px_5px_rgba(212,124,36,0.9),_10px_10px_rgba(212,124,36,0.6),_15px_15px_rgba(212,124,36,0.4),_20px_20px_rgba(212,124,36,0.2)]"
              >
                <img
                  src={product.OfferImages[0]?.imageUrl}
                  alt="Product"
                  className="h-60 w-72 object-cover rounded-t-xl hover:cursor-pointer"
                  onClick={() => openModal(product)}
                />
                <div className="px-4 py-3 w-72">
                  <span className="text-gray-400 mr-3 uppercase text-xs">{product.category}</span>
                  <p className="text-lg font-bold text-black truncate block capitalize">{product.title}</p>
                  <div className="flex items-center">
                    <p className="text-lg font-semibold text-black cursor-auto my-3">{product.price} $</p>
                    <div className="ml-20 text-2xl flex text-orange-400 hover:cursor-pointer">
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.error('Offer removed from favourites',{position: "top-center"});
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
                  <div className="w-1/2 p-6 ml-8 overflow-y-auto max-h-96">
                    <h2 className="company text-orange-600 uppercase font-bold text-sm sm:text-md tracking-wider py-2">
                      {selectedProduct.category}
                    </h2>
                    <h3 className="product mt-4 capitalize text-very-dark-blue font-bold text-4xl py-2 border-b border-gray-200">
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
                    <button 
                      className="flex bg-orange-500 mt-6 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-dark transition duration-300"
                      onClick={handleBuyNow}
                    >
                      <i className="flex cursor-pointer text-white text-xl leading-0 pr-3">
                        <FaCartShopping className="pr-4 w-8 h-8" /> BUY NOW!
                      </i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      )}
      </>
    );
  };
  
  export default Favourites;