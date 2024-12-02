import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AuthData } from "../../auth/AuthWrapper";
import Loading from '../Loading';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ActiveOffers = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = AuthData();
  const { navigate } = useNavigate();

  const [editOffer, setEditOffer] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const openEditModal = (product) => {
    setEditOffer(true);
    setEditFormData({
      title: product.title,
      description: product.description,
      price: product.price,
    });
    setSelectedProduct(product);
  };

  const handleEditOffer = async () => {
    try {
      if (!editFormData.title || !editFormData.description || !editFormData.price) {
        toast.error('All fields are required');
        return;
      }

      if(editFormData.price < 0) {
        toast.error('Price must be a positive number');
        return;
      }

      await axios.put(`${process.env.REACT_APP_API_URL}offers/${selectedProduct.offerID}`, {
        title: editFormData.title,
        description: editFormData.description,
        price: editFormData.price,
      });
      toast.success('Offer updated successfully');
      setEditOffer(false);
      setSelectedProduct(null);
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer:', error.message);
      toast.error('Failed to update offer');
    }
  };


  const [deleteOffer, setDeleteOffer] = useState(null);
  const openDeleteModal = () => {
    setDeleteOffer(true);
  };

  const closeDeleteModal = () => {
    setDeleteOffer(false);
  };

  const handleDeleteOffer = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}offers/${selectedProduct.offerID}`);
      fetchOffers();
      closeModal();
      closeDeleteModal();
      toast.success('Offer deleted successfully');
    } catch (error) {
      console.error('Error', error.message);
    } 
  };

  const fetchOffers = async () => {
    try {
      const data = await axios.get(`${process.env.REACT_APP_API_URL}offers/userID/${user.userID}`);
      setProducts(data.data);
    } catch (error) {
      console.error('Error', error.message);
    }
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (product) => {
    setSelectedProduct(product);
    setCurrentIndex(0);
  };

  const closeModal = () => {
    setSelectedProduct(null);

  };

  const prevSlide = () => {
    const newIndex = (currentIndex === 0) ? selectedProduct.OfferImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const newIndex = (currentIndex === selectedProduct.OfferImages.length - 1) ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (user && user.userID) {
        await fetchOffers();
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);
 
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <h1 className='text-4xl font-bold mb-4'>Your offers: </h1>
      <h1 className='text-2xl font-bold mb-2 text-orange-700'>{products.length} offers</h1>
      <hr />
      
        {products.length === 0 
        ? 
        <>
          <div className="flex h-64 flex-col bg-white">
                <div className="flex flex-1 items-center justify-center">
                    <div className="mx-auto max-w-xl px-4 py-8 text-center">
                         <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            You don't have any active offers.
                         </h1>
                         <p className="mt-4 text-gray-500">
                            We would love to see your offers soon!
                         </p>
                         <a onClick={() => navigate("/market")} className="mt-6 inline-block text-[#8B4513] border-b-2 border-[#8B4513] px-5 py-3 text-md font-medium focus:outline-none focus:ring">
                            Go market
                         </a>
                         <a onClick={() => navigate("/addOffer")} className="mt-6 ml-4 bg-[#8B4513] inline-block rounded px-5 py-3 text-md font-medium text-white focus:outline-none focus:ring">
                             Add an offer
                         </a>
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
            className="w-56  hover:cursor-pointer bg-white shadow-md rounded-xl duration-200 hover:scale-105 hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <img
              src={product.OfferImages[0]?.imageUrl}
              alt="Product"
              className="h-60 w-72 object-cover rounded-t-xl"
            />
            <div className="px-4 py-3 w-56">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 uppercase text-xs">{product.category}</span>
                <p className="text-gray-500 text-xs">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-gray-400 text-xs">{product.size}</p>
              <p className="text-lg font-bold text-black truncate block capitalize">{product.title}</p>
              <div className="flex items-center">
                <p className="text-lg font-semibold text-black cursor-auto my-3">{product.price} <span className='font-bold'>{product.currency}</span></p>
                </div>
              </div>
            </div>
          ))}
          </section>
        </>
        }
      
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
                    <h2 className="company text-orange-600 uppercase font-bold text-sm sm:text-md tracking-wider py-2">
                      {selectedProduct.category}
                    </h2>
                    <h3 className="product mt-4 capitalize text-very-dark-blue font-bold text-4xl py-2 border-b border-gray-200">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-dark-grayish-blue lg:leading-6 border-b border-gray-200 py-4">
                      {selectedProduct.description}
                    </p>
                    <div className="mt-4 amount flex items-center justify-between lg:flex-col lg:items-start mb-6">
                      <div className="discount-price items-center flex">
                        <div className="price text-3xl">{selectedProduct.price} <span className='font-bold'>{selectedProduct.currency}</span></div>
                      </div>
                    </div>
                    <button onClick={openDeleteModal} className="flex bg-red-500 mt-6 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-dark transition duration-300">
                      DELETE
                    </button>
                    <button onClick={() => openEditModal(selectedProduct)} className="flex bg-orange-500 mt-2 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-dark transition duration-300">
                      EDIT
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      )}

      {deleteOffer && (
        <>
          <div class="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div class="relative p-4 w-full max-w-md h-full md:h-auto">
                  <div class="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                      <button onClick={closeDeleteModal} class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="deleteModal">
                          <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                          <span class="sr-only">Close modal</span>
                      </button>
                      <svg class="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                      <p class="mb-4 text-gray-500 dark:text-gray-300">Are you sure you want to delete this item?</p>
                      <div class="flex justify-center items-center space-x-4">
                          <button onClick={closeDeleteModal} class="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                              No, cancel
                          </button>
                          <button onClick={handleDeleteOffer} class="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                              Yes, I'm sure
                          </button>
                      </div>
                  </div>
              </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      )}
      {editOffer && (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg ml-96 mt-20 shadow-[rgba(0,_0,_0,_0.4)_0px_30px_90px] p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold">Edit Offer</h3>
            <form className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  className="mt-1 block w-full py-4 px-1 rounded-md border-gray-300 focus:shadow-[0px_10px_1px_rgba(221,_221,_221,_1),_0_10px_20px_rgba(204,_204,_204,_1)] outline-none sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  className="mt-1 block w-full py-4 px-1 rounded-md border-gray-300 focus:shadow-[0px_10px_1px_rgba(221,_221,_221,_1),_0_10px_20px_rgba(204,_204,_204,_1)] outline-none sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditChange}
                  className="mt-1 block w-full py-4 px-1 rounded-md border-gray-300 focus:shadow-[0px_10px_1px_rgba(221,_221,_221,_1),_0_10px_20px_rgba(204,_204,_204,_1)] outline-none sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditOffer(false)}
                  className="px-4 py-2 text-gray-500 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditOffer}
                  className="px-4 py-2 text-white bg-orange-600 rounded hover:bg-orange-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="fixed inset-0 bg-black z-35 opacity-25"></div>
        </>
      )}

    </>
  );
};

export default ActiveOffers;