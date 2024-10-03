import React, { useState } from 'react';

const PriceSlider = () => {
  const [minValue, setMinValue] = useState(15);
  const [maxValue, setMaxValue] = useState(30);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue - 1);
    setMinValue(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue + 1);
    setMaxValue(value);
  };

  return (
    <div className="flex w-64 m-auto items-center h-32 justify-center">
      <div className="py-1 relative min-w-full">
        <div className="h-2 bg-gray-200 rounded-full relative">
          <div
            className="absolute h-2 rounded-full bg-teal-600"
            style={{
              width: `${(maxValue - minValue) / 9999 * 100}%`,
              left: `${minValue / 9999 * 100}%`
            }}
          ></div>
          <input
            type="range"
            min="1"
            max="9999"
            value={minValue}
            onChange={handleMinChange}
            className="absolute w-full h-2 opacity-0 pointer-events-none"
            style={{ left: '0%', width: '100%' }}
          />
          <input
            type="range"
            min="1"
            max="9999"
            value={maxValue}
            onChange={handleMaxChange}
            className="absolute w-full h-2 opacity-0 pointer-events-none"
            style={{ left: '0%', width: '100%' }}
          />
          <div
            className="absolute h-4 w-4 bg-white rounded-full shadow border border-gray-300 -ml-2 top-0 cursor-pointer"
            style={{ left: `${minValue / 9999 * 100}%` }}
          >
            <div className="relative -mt-2 w-1">
              <div
                className="absolute z-40 opacity-100 bottom-100 mb-2 left-0 min-w-full"
                style={{ marginLeft: '-25px' }}
              >
                <div className="relative shadow-md">
                  <div className="bg-black -mt-8 text-white truncate text-xs rounded py-1 px-4">
                    ${minValue}
                  </div>
                  <svg
                    className="absolute text-black w-full h-2 left-0 top-100"
                    viewBox="0 0 255 255"
                    xmlSpace="preserve"
                  >
                    <polygon
                      className="fill-current"
                      points="0,0 127.5,127.5 255,0"
                    ></polygon>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div
            className="absolute h-4 w-4 bg-white rounded-full shadow border border-gray-300 -ml-2 top-0 cursor-pointer"
            style={{ left: `${maxValue / 9999 * 100}%` }}
          >
            <div className="relative -mt-2 w-1">
              <div
                className="absolute z-40 opacity-100 bottom-100 mb-2 left-0 min-w-full"
                style={{ marginLeft: '-25px' }}
              >
                <div className="relative shadow-md">
                  <div className="bg-black -mt-8 text-white truncate text-xs rounded py-1 px-4">
                    ${maxValue}
                  </div>
                  <svg
                    className="absolute text-black w-full h-2 left-0 top-100"
                    viewBox="0 0 255 255"
                    xmlSpace="preserve"
                  >
                    <polygon
                      className="fill-current"
                      points="0,0 127.5,127.5 255,0"
                    ></polygon>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute text-gray-800 -ml-1 bottom-0 left-0 -mb-6">
            $1
          </div>
          <div className="absolute text-gray-800 -mr-1 bottom-0 right-0 -mb-6">
            $9999
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSlider;
