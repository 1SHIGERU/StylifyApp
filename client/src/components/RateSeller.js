import React from 'react';
import Stars from './ratingSystem/Stars';
import Img from '../assets/avatar.jpg';

const RateSeller = ({ isModalOpen, onClose, itemData, owner, rating, setRating, comment, setComment, handleRate }) => {
  if (!isModalOpen) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-3/4 my-6 mx-auto max-w-4xl">
            <div className="border-0 rounded-lg shadow-lg relative p-6 flex flex-col w-full bg-white outline-none focus:outline-none">
              <div className="flex items-start justify-between p-2 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-3xl font-semibold">Rate the seller</h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-black opacity-50 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={onClose}>
                  X
                </button>
              </div>
              <div className="flex">
                <div className="w-1/3 h-96 py-4 px-4 relative group">
                  <h3 className="product text-very-dark-blue text-2xl py-2">Refers to:</h3>
                  {itemData?.OfferImages?.[0] ? (
                    <img
                      src={itemData.OfferImages[0].imageUrl}
                      alt="product"
                      className="w-3/4 rounded-xl object-cover"
                    />
                  ) : (
                    <p>No image available</p>
                  )}
                </div>
                <div className="w-2/3 p-6 ml-8 overflow-y-auto max-h-96 border-l border-blueGray-200 flex flex-col items-center justify-center">
                  <div className="flex items-center space-x-4 cursor-pointer pt-2">
                    <img
                      src={owner.avatarURL || Img}
                      alt="avatar"
                      className="w-24 h-24 rounded-full"
                    />
                    <div className="text-black text-lg">{owner.username}</div>
                  </div>
                  <div className="w-full mt-4 flex flex-col items-center">
                    <Stars rating={rating} onStarChange={setRating} />
                  </div>
                  <input
                    type="text"
                    placeholder="Comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-3/4 mt-4 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleRate}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md mt-4">
                    Rate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </div>
    </>
  );
};

export default RateSeller;