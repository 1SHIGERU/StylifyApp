import React, { useState } from 'react';
import axios from 'axios';

export const OfferReview = ({ data, images }) => {

    const [offerID, setOfferID] = useState('');
    const ownerID = data.get('ownerID');
    const title = data.get('title');
    const price = data.get('price');
    const description = data.get('description');
    const category = data.get('category');

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:13000/offers/', {
                ownerID: ownerID,
                title: title,
                description: description,
                price: price,
                category: category
            });
            console.log('Offer added successfully', response.data.offerID);
            const newOfferID = response.data.offerID;
            setOfferID(newOfferID);

            if (newOfferID) {
                await uploadImages(newOfferID);
            }

        } catch (error) {
            console.error('We can\'t add an offer', error);
        }
    };

    const uploadImages = async (offerID) => {
        const imagesData = new FormData();

        images.forEach((file, index) => {
            imagesData.append("images", file);
        });
        imagesData.append('offerID', offerID);

        try {
            const response = await axios.post('http://localhost:13000/offerImages/', imagesData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Images uploaded successfully', response);
        } catch (error) {
            console.error('We can\'t upload files', error);
        }
    };


  const [slide, setSlide] = useState(0);

  const nextSlide = () => {
    setSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  const prevSlide = () => {
    setSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="py-8 mt-32 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col -mx-4">
            <div className="px-4">
            <div className="h-96 w-96 mb-4 overflow-hidden">
                <img
                  className="w-full border-2 border-white h-full rounded-3xl object-cover"
                  src={URL.createObjectURL(images[slide])}
                  alt="Product Image"
                />
                <div className="absolute inset-y-1/2 w-full flex justify-between px-3">
                  <button
                    className="text-white bg-white p-2 rounded-full"
                    onClick={prevSlide}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button
                    className="text-white bg-white p-2 rounded-full"
                    onClick={nextSlide}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="px-4">
              <h2 className="text-4xl py-2 font-bold mb-2 border-b-2 border-white">{title}</h2>
              <p className=" text-2xl mt-8 mb-4">Category:<span className='font-bold'> {category}</span></p>
              <div className="flex mb-4">
                <div className="mr-4">
                  <span className='text-xl'>Price:</span>
                  <span className="font-bold text-xl"> {price}$</span>
                </div>
              </div>
              <div className='flex mt-8 justify-end border-b-2 border-white'>
                <span className="text-2xl">Description:</span>
                </div>
                <p className="text-xl mt-2">{description}</p>    
             </div>
             <button onClick={handleSubmit} className='bg-white text-[#8B4513] text-2xl font-bold p-2 rounded-lg mt-8 hover:text-white hover:bg-[#8B4513] hover:border-white hover:border transition duration-150 ease-in-out'>Add to market</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferReview;