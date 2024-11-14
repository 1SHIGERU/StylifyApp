import React, { useEffect,  useState } from 'react'
import MarketJpg from '../../assets/market.jpg'
import axios from "axios";
import Avatar from '../../assets/avatar.jpg';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { AuthData } from "../../auth/AuthWrapper";
import Loading from '../Loading';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import MultiRangeSlider from "multi-range-slider-react";
import { useLocation } from 'react-router-dom';


export const Market = () => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const category2 = queryParams.get('category');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = AuthData();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [ownerData, setOwnerData] = useState(null);

  const handleBuyNow = () => {
    navigate('/payment', { state: { product: selectedProduct } });
  };

  const fetchOwnerData = async (ownerID) => {
    try {
      const { data } = await axios.get(`http://localhost:13000/users/user/${ownerID}`);
      setOwnerData(data);
      return data;
    } catch (error) {
      console.error('Error fetching owner data:', error);
    }
  };
  
  const fetchOffer = async (offerID) => {
    try {
      const { data } = await axios.get(`http://localhost:13000/offers/${offerID}`);
      return data;
    } catch (error) {
      console.error('Error fetching offer:', error);
    }
  };
  
  const createNotification = async (userID, offerID, offerTitle, offerPrice) => {
    try {
      await axios.post(`http://localhost:13000/notifications/create`, {
        userID: userID,
        offerID: offerID,
        message: `${user.username} is interested in your offer! ${offerTitle} for ${offerPrice}$`,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };
  
  const addToFavourites = async (offerID) => {
    try {
      const offerData = await fetchOffer(offerID);
      const ownerData = await fetchOwnerData(offerData.ownerID);
  
      await createNotification(
        ownerData.userID,    
        offerID,             
        offerData.title,     
        offerData.price      
      );
  
      const { data } = await axios.post(`http://localhost:13000/users/addFavourite/`, {
        userID: user.userID,
        offerID: offerID,
      });

      setFavourites([...favourites, offerID]);
  
    } catch (error) {
      console.error('Error in adding to favourites:', error.message);
    }
  };

  const removeFromFavourites = async (offerID) => {
    try {
        await axios.delete(`http://localhost:13000/users/deleteFavourite/`, {
          data: {
            userID: user.userID,
            offerID: offerID,
          }
        });
      setFavourites(favourites.filter(id => id !== offerID));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFavouriteToggle = (offerID) => {
    if (favourites.includes(offerID)) {
      removeFromFavourites(offerID);
      toast.error('Offer removed from favourites', { position: 'top-center' });
    } 
    else {
      addToFavourites(offerID);
      toast.success('Offer added to favourites', { position: 'top-center' });
    }
  };

  const fetchFavourites = async (userID) => {
    try {
      const { data } = await axios.get(`http://localhost:13000/users/getFavourites/${userID}`);
      setFavourites(data.map(fav => fav.offerID));
    } catch (error) {
      console.error('Error fetching favourites:', error);
    }
  };


  const fetchProducts = async () => {
    try {
      const { data: { offers } } = await axios.get(`http://localhost:13000/offers?${params}`);
     
      const offersWithOwners = await Promise.all(
        offers.map(async (offer) => {
          try {
            const { data: owner } = await axios.get(`http://localhost:13000/users/user/${offer.ownerID}`);
            return { ...offer, owner };      
          } catch (ownerError) {
            console.error(`Error fetching owner data for offer ${offer.offerID}:`, ownerError);
            return { ...offer, owner: null };
          }
        })
      );
      setProducts(offersWithOwners);
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProducts();
  
      if (user && user.userID) {
        await fetchFavourites(user.userID);
      }
  
      setLoading(false);
    };
  
    fetchData();
  }, [user && user.userID]);

  useEffect(() => {
    if (category2 && products.length > 0) {
      handleFilterChange('category', category2);   
      setSelectedCategory(category2);
      applyFilters();
    }
  }, [category2, products]);


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

      const goToAccount = () => {
        navigate('/account');
      };

      const prevSlide = () => {
        const newIndex = (currentIndex === 0) ? selectedProduct.OfferImages.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
      };
    
      const nextSlide = () => {
        const newIndex = (currentIndex === selectedProduct.OfferImages.length - 1) ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
      };



      {/*  FILTROWANIE  */}
      const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
      };

      const hardcodedMin = 1;
      const hardcodedMax = 500;

      const [filters, setFilters] = useState({
        minPrice: 1,
        maxPrice: 500,
        category: '',
        size: { clothing: [], shoes: [] },
        gender: '',
        colors: []
      });

      const [sliderMinValue, setSliderMinValue] = useState(filters.minPrice || hardcodedMin);
      const [sliderMaxValue, setSliderMaxValue] = useState(filters.maxPrice || hardcodedMax);

      const handleSliderChange = (e) => {
        setSliderMinValue(e.minValue);
        setSliderMaxValue(e.maxValue);
      };

      const handleSliderRelease = () => {
        handleFilterChange('minPrice', sliderMinValue);
        handleFilterChange('maxPrice', sliderMaxValue);
      };


      const colors = [
        { name: "Red", colorCode: "#ef4444" },      
        { name: "Green", colorCode: "#15803d" },   
        { name: "Blue", colorCode: "#2563eb" },     
        { name: "Yellow", colorCode: "#facc15" },   
        { name: "Black", colorCode: "#000000" },
        { name: "White", colorCode: "#ffffff" },
        { name: "Orange", colorCode: "#f97316" },  
        { name: "Purple", colorCode: "#7c3aed" },   
        { name: "Pink", colorCode: "#ec4899" },    
        { name: "Brown", colorCode: "#a97706" },    
        { name: "Gray", colorCode: "#4b5563" },     
        { name: "Cyan", colorCode: "#0891b2" },     
        { name: "Magenta", colorCode: "#c026d3" }, 
        { name: "Lime", colorCode: "#84cc16" },     
        { name: "Indigo", colorCode: "#4338ca" },  
        { name: "Teal", colorCode: "#0d9488" },     
        { name: "Olive", colorCode: "#4d7c0f" }     
      ];

      const [selectedGender, setSelectedGender] = useState(null);
      const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
        handleFilterChange("gender", gender);
      };

      const handleColorToggle = (color) => {
        const currentColors = filters.colors;

        if (currentColors.includes(color)) {
          handleFilterChange(
            'colors',
            currentColors.filter((c) => c !== color)
          );
        } else if (currentColors.length < 3) {
          handleFilterChange('colors', [...currentColors, color]);
        }
      };

      const [selectedCategory, setSelectedCategory] = useState(null);
      const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        handleFilterChange('category', category);
      };

      const [dropdownOpen, setDropdownOpen] = useState(false);

      const params = new URLSearchParams({
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        category: filters.category,
        size: Object.values(filters.size).flat().join(','),
        colors: filters.colors.join(','),
        gender: filters.gender
      }).toString();


      const handleFilterChange = (filterName, value) => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          [filterName]: value
        }));
      };

      const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];
      const shoeSizes = Array.from({ length: 21 }, (_, i) => (i + 30).toString());

      const handleSizeToggle = (size, category) => {
        setFilters((prevFilters) => {
          const selectedSizes = prevFilters.size[category] || [];
          const isSelected = selectedSizes.includes(size);
      
          if (!isSelected && selectedSizes.length >= 3) {
            return prevFilters; 
          }
      
          const newSizeCategory = isSelected
            ? selectedSizes.filter((s) => s !== size) 
            : [...selectedSizes, size];
      
          return {
            ...prevFilters,
            size: {
              [category]: newSizeCategory,
            }
          };
        });
      };
      
      const resetFilters = () => {
        setFilters({
          minPrice: 1,
          maxPrice: 500,
          category: '',
          size: { clothing: [], shoes: [] },
          gender:'',
          colors: [],
        });
        setSelectedGender(null);
        setSelectedCategory(null);
        setSliderMinValue(hardcodedMin);
        setSliderMaxValue(hardcodedMax);
      };

      const applyFilters = () => {
        fetchProducts();
        setFiltersVisible(false);
      };

      if (loading) {
        return <Loading />;
      }

    return (
      <div className='overflow-x-hidden'> 
        <div className='flex w-full min-h-screen justify-center items-center pt-16'>
            <div className='w-1/3 justify-center items-center p-32 md:p-16'>
                  <h2 class="lg:text-7xl text-[#8B4513] text-4xl font-extrabold lg:leading-[55px]">
                   Welcome on the market!
                  </h2>
                <p className='text-2xl text-brown-500 mt-4'> Find your dream clothes here!</p>
            </div>
            <div className='w-2/3 justify-center items-center'>
                <img src={MarketJpg} alt='market' className='rounded-full ml-72' />
            </div>
        </div>
        <div className='flex justify-center items-center mt-12'>
            <div className='w-4/5 p-4'>
              <div class="2xl:container 2xl:mx-auto">
                <div class="md:py-12 lg:px-20 md:px-6 py-9 px-4">
                  <p class="text-sm leading-3 text-gray-600 font-normal mb-2"></p>
                  <div class="flex justify-between items-center mb-4">           
                  <div className="relative inline-block cursor-pointer text-white sm:flex hidden hover:bg-gray-700 focus:ring focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-4 px-6 bg-gray-800 flex text-base leading-4 font-normal text-white justify-center items-center">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center">
                      <span className="mr-4">Sort</span>
                        <svg class="w-[28px] h-[28px] text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 20V10m0 10-3-3m3 3 3-3m5-13v10m0-10 3 3m-3-3-3 3"/>
                        </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-12 right-0 w-48 py-2 bg-gray-100 rounded-b-lg shadow-xl">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-400 hover:text-white">
                          Najwyższa cena
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-400 hover:text-white">
                          Najniższa cena
                        </button>
                        <button  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-400 hover:text-white">
                          Najstarsza aukcja
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-400 hover:text-white">
                          Najnowsza aukcja
                        </button>
                      </div>
                    )}
                  </div>    
                    <button onClick={toggleFilters} class="cursor-pointer text-white sm:flex hidden hover:bg-gray-700 focus:ring focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-4 px-6 bg-gray-800 flex text-base leading-4 font-normal text-white justify-center items-center">
                      <svg class="w-[28px] h-[28px] text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="1" d="M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2"/>
                      </svg>
                      Filters
                    </button>
                  </div>
                  <p class="text-xl leading-5 text-gray-600 font-medium"></p>
                </div>
                {filtersVisible && (
                <div id="filterSection" class="block relative md:py-10 lg:px-20 md:px-6 py-9 px-4 bg-gray-100 w-full">
                  <div onClick={toggleFilters} class="cursor-pointer text-gray-800 absolute right-0 top-0 md:py-10 lg:px-20 md:px-6 py-9 px-4">
                    <svg class="lg:w-6 lg:h-6 w-4 h-4" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 1L1 25" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M1 1L25 25" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div class="flex space-x-2 text-gray-800 ">
                      <svg class="w-[33px] h-[33px] text-gray-800 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-width="1" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
                        <path stroke="currentColor" stroke-width="1" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                      <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium">Colors</p>
                    </div>
                    <div className="md:flex md:space-x-4 mt-8 grid grid-cols-3 gap-y-8 flex-wrap">
                      {colors.map(({ name, colorCode }) => (
                        <div key={name} className={`flex space-x-1 items-center cursor-pointer ${filters.colors.includes(name) ? "" : ""}`} onClick={() => handleColorToggle(name)}>
                          <div style={{ backgroundColor: colorCode }} className={`w-4 h-4 rounded-md shadow ${filters.colors.includes(name)? "ring-2": ""} `}></div>
                          <p className={`text-base leading-4 font-normal ${filters.colors.includes(name)? `font-bold text-black`: "text-gray-600"}`}>
                            {name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr class="bg-gray-200 lg:w-6/12 w-full md:my-10 my-8" />
                  <div>
                    <div class="flex space-x-1 text-gray-800 dark:text-white">
                      <svg class="w-[28px] h-[28px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 17.345a4.76 4.76 0 0 0 2.558 1.618c2.274.589 4.512-.446 4.999-2.31.487-1.866-1.273-3.9-3.546-4.49-2.273-.59-4.034-2.623-3.547-4.488.486-1.865 2.724-2.899 4.998-2.31.982.236 1.87.793 2.538 1.592m-3.879 12.171V21m0-18v2.2"/>
                      </svg>
                      <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium ">Price</p>
                    </div>
                    <div className="flex w-64 items-center h-16 mt-8">
                      <MultiRangeSlider
                        min={hardcodedMin}              
                        max={hardcodedMax}                 
                        minValue={sliderMinValue}  
                        maxValue={sliderMaxValue}
                        style={{ width: "100%", margin: "0 auto", boxShadow: "none", border: "none" }}
                        ruler={false}
                        barInnerColor="#ffa500"
                        thumbLeftColor="#ffa500"
                        thumbRightColor="#ffa500"
                        onInput={handleSliderChange}           
                        onChange={handleSliderRelease}           
                      />
                    </div>
                  </div>
                  <hr class="bg-gray-200 lg:w-6/12 w-full md:my-10 my-8" />
                  <div>
                    <div class="flex space-x-2 text-gray-800">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 5H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M12 7L14 5L12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M5 3L3 5L5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M19 10V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M17 19L19 21L21 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M21 12L19 10L17 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M12 10H5C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21H12C13.1046 21 14 20.1046 14 19V12C14 10.8954 13.1046 10 12 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium ">Size</p>
                    </div>
                    <div className="md:flex md:space-x-4 mt-8 grid grid-cols-3 gap-y-8 flex-wrap">
                      <p className='text-gray-800 text-md font-bold '>Clothing</p>
                      {clothingSizes.map((size) => (
                        <div
                          key={size}
                          className="flex space-x-1 items-center cursor-pointer"
                          onClick={() => handleSizeToggle(size, 'clothing')}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex justify-center items-center shadow ${
                              filters.size.clothing && filters.size.clothing.includes(size)
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {size}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="md:flex md:space-x-4 mt-8 grid grid-cols-3 gap-y-8 flex-wrap">
                      <p className='text-gray-800 text-md font-bold '>Shoes</p>
                      {shoeSizes.map((size) => (
                        <div
                          key={size}
                          className="flex space-x-1 items-center cursor-pointer"
                          onClick={() => handleSizeToggle(size, 'shoes')}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex justify-center items-center shadow ${
                              filters.size.shoes && filters.size.shoes.includes(size)
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {size}
                          </div>
                        </div>
                      ))}
                    </div>         
                  </div>
                  <hr class="bg-gray-200 lg:w-6/12 w-full md:my-10 my-8" />
                  <div>
                    <div class="flex space-x-2 text-gray-800 dark:text-white ">
                      <svg class="w-[28px] h-[28px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-width="1" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                      <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium ">Gender</p>
                    </div>
                    <div class="flex mt-4 space-x-8">
                      <div class="flex justify-center items-center">
                      <div className="mt-4">
                          <button
                            className={`px-4 py-2 rounded-lg focus:outline-none mr-4 
                            ${selectedGender === 'Men' ? 'bg-[#D47C24] text-white' : 'bg-gray-200'}`}
                            onClick={() => handleGenderSelect('Men')}
                          >
                            Men
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg focus:outline-none mr-4
                            ${selectedGender === 'Women' ? 'bg-[#D47C24] text-white' : 'bg-gray-200'}`}
                            onClick={() => handleGenderSelect('Women')}
                          >
                            Women
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg focus:outline-none
                            ${selectedGender === 'Unisex' ? 'bg-[#D47C24] text-white' : 'bg-gray-200'}`}
                            onClick={() => handleGenderSelect('Unisex')}
                          >
                            Unisex
                          </button>
                      </div>
                      </div>
                    </div>
                  </div>
                  <hr class="bg-gray-300 lg:w-6/12 w-full md:my-10 my-8" />
                  <div>
                    <div class="flex space-x-2 text-gray-800 dark:text-white ">
                      <svg class="w-[28px] h-[28px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="1" d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"/>
                      </svg>
                      <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium ">Category</p>
                    </div>
                    <div class="flex mt-4 space-x-8">
                      <div class="flex justify-center items-center">
                      <div className="relative group">
                        <button className="outline-none focus:outline-none bg-gray-200 border py-1 px-2 rounded-md flex items-center">
                            <span className="p-2 flex-1">{selectedCategory}</span>
                            <span>
                            <svg
                                className="fill-current h-4 w-4 transform group-hover:-rotate-180 transition duration-150 ease-in-out"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                            </span>
                        </button>
                      <ul className="bg-white border rounded-sm transform scale-0 group-hover:scale-100 absolute transition duration-150 ease-in-out origin-top min-w-32">
                        <li className="rounded-sm px-3 py-1 relative">
                          <button
                            className="w-full hover:text-[#D47C24] text-left flex items-center outline-none focus:outline-none">
                            <span className="pr-1 flex-1">Clothing</span>
                            <span className="mr-auto">
                              <svg
                                className="fill-current h-4 w-4 transition duration-150 ease-in-out"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </span>
                          </button>
                          <ul className="bg-white border rounded-sm absolute top-0 right-0 transition duration-150 ease-in-out origin-top-left min-w-32">
                            {['Pants', 'T-shirts', 'Undershirts', 'Shirts', 'Outerwear', 'Suits and Blazers', 'Sweaters and Hoodies', 'Shorts', 'Underwear', 'Swimwear', 'Sportswear', 'Others'].map((item) => (
                              <li
                                key={item}
                                className="px-3 py-1 hover:text-[#D47C24]"
                                onClick={() => handleCategorySelect(item)}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="rounded-sm px-3 py-1 hover:bg-gray-100 relative">
                          <button className="w-full hover:text-[#D47C24] text-left flex items-center outline-none focus:outline-none">
                            <span className="pr-1 flex-1">Footwear</span>
                            <span className="mr-auto">
                              <svg
                                className="fill-current h-4 w-4 transition duration-150 ease-in-out"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </span>
                          </button>
                          <ul className="bg-white border rounded-sm absolute top-0 right-0 transition duration-150 ease-in-out origin-top-left min-w-32">
                            {['Sneakers', 'Trainers', 'Slippers', 'Sandals', 'Dress Shoes', 'Flip-flops', 'Espadrilles', 'Hiking Boots', 'Moccasins'].map((item) => (
                              <li
                                key={item}
                                className="px-3 py-1 hover:text-[#D47C24]"
                                onClick={() => handleCategorySelect(item)}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </li>
                        <li className="rounded-sm px-3 py-1 hover:bg-gray-100 relative">
                          <button
                            className="w-full hover:text-[#D47C24] text-left flex items-center outline-none focus:outline-none">
                            <span className="pr-1 flex-1">Accessories and Add-ons</span>
                            <span className="mr-auto">
                              <svg
                                className="fill-current h-4 w-4 transition duration-150 ease-in-out"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </span>
                          </button>
                          <ul className="bg-white border rounded-sm absolute top-0 right-0 transition duration-150 ease-in-out origin-top-left min-w-32">
                            {['Bags', 'Backpacks', 'Scarves', 'Belts', 'Gloves', 'Hats', 'Caps', 'Jewelry', 'Watches', 'Glasses'].map((item) => (
                              <li
                                key={item}
                                className="px-3 py-1 hover:text-[#D47C24]"
                                onClick={() => handleCategorySelect(item)}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                      </div>     
                      </div>
                    </div>
                  </div>           
                  <div class="hidden md:block absolute right-64 bottom-0 md:py-10 lg:px-20 md:px-6 py-9 px-4">
                    <button onClick={resetFilters} class="hover:bg-gray-700 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 focus:ring focus:ring-offset-2 focus:ring-gray-800 text-base leading-4 font-medium py-4 px-10 text-white bg-gray-800">Reset Filters</button>
                  </div>
                  <div class="hidden md:block absolute right-0 bottom-0 md:py-10 lg:px-20 md:px-6 py-9 px-4">
                    <button onClick={applyFilters} class="hover:bg-gray-700 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 focus:ring focus:ring-offset-2 focus:ring-gray-800 text-base leading-4 font-medium py-4 px-10 text-white bg-gray-800">Search</button>
                  </div>
                </div>
                )}
              </div> 
            </div>
        </div>  
        <section className="w-fit mx-auto grid 2xl:grid-cols-5 xl:grid-cols-4 md:grid-cols-3 items-center justify-center gap-y-16 gap-x-14 mt-10 mb-16">
          {products.length > 0 ? (
            products.map((product) => (
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
                  <div className="flex items-center">
                    <p className="text-lg font-semibold text-black cursor-auto my-3">{product.price} $</p>
                    <div className="ml-auto text-4xl flex text-orange-400 hover:cursor-pointer">
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavouriteToggle(product.offerID);
                        }}>
                        {user.isAuthenticated ? (
                          <>
                            {product.ownerID === user.userID ? (
                              <></>
                            ) : (
                              <>
                                {favourites.includes(product.offerID) ? '🧡' : '🤍'}
                              </>
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
           <>
           </>
          )}
        </section>
        {selectedProduct && (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
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
                  <div className="w-1/2 p-6 ml-8 no-scrollbar overflow-y-auto max-h-96">
                    <div className="w-full flex justify-between items-center">
                      <h2 className="company text-orange-600 uppercase font-bold text-sm sm:text-md tracking-wider py-2">
                        {selectedProduct.category}
                      </h2>
                      <Link to={`/user/${selectedProduct.ownerID}`}>
                        <div className="flex items-center space-x-2 cursor-pointer">
                          <img src={selectedProduct.owner.avatarURL || Avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                          <div className="text-black text-md">{selectedProduct.owner.username}</div>
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
                        <div className="price text-2xl">${selectedProduct.price}</div>
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
    );
};