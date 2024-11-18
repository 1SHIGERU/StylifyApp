import { useRef, useEffect, useState } from "react";
import { FaUpload, FaRegFileImage, FaRegFile } from "react-icons/fa";
import { BsX } from "react-icons/bs";
import Swal from "sweetalert2";
import "../../index.css";
import { AuthData } from "../../auth/AuthWrapper";
import { toast } from "react-toastify";

export function CustomDragDrop({
  ownerLicense,
  onUpload,
  onDelete,
  count,
  formats,
  onSubmit
}) {
  const dropContainer = useRef(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('T-shirts');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedGender, setSelectedGender] = useState('Men');

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
  };
    
    const handleColorSelect = (color) => {
      if (selectedColors.includes(color)) {
        setSelectedColors(selectedColors.filter(c => c !== color));
      } else {
        if (selectedColors.length < 3) {
          setSelectedColors([...selectedColors, color]);
        } else {
          toast.error('You can select up to 3 colors');
        }
      }
    };

  const { user } = AuthData();

  function handleDrop(e, type) {
    let files;
    if (type === "inputFile") {
      files = [...e.target.files];
    } else {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      files = [...e.dataTransfer.files];
    }

    const allFilesValid = files.every((file) => {
      return formats.some((format) => file.type.endsWith(`/${format}`));
    });

    if (ownerLicense.length >= count) {
      showAlert(
        "warning",
        "Maximum Files",
        `Only ${count} files can be uploaded`
      );
      return;
    }
    if (!allFilesValid) {
      showAlert(
        "warning",
        "Invalid Media",
        `Invalid file format. Please only upload ${formats
          .join(", ")
          .toUpperCase()}`
      );
      return;
    }

    if (count && count < files.length) {
      showAlert(
        "error",
        "Error",
        `Only ${count} file${count !== 1 ? "s" : ""} can be uploaded at a time`
      );
      return;
    }

    if (files && files.length) {
      setSelectedFiles(files);
      const nFiles = files.map(async (file) => {
        const base64String = await convertFileBase64(file);

        return {
          name: file.name,
          photo: base64String,
          type: file.type,
          size: file.size
        };
      });

      Promise.all(nFiles).then((newFiles) => {
        onUpload(newFiles);
        TopNotification.fire({
          icon: "success",
          title: "Image(s) uploaded"
        });
      });
    }
  }

  async function convertFileBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }

  useEffect(() => {
    function handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
    }
    function handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
    }

    dropContainer.current.addEventListener("dragover", handleDragOver);
    dropContainer.current.addEventListener("drop", (e) => handleDrop(e, "drop"));
    dropContainer.current.addEventListener("dragleave", handleDragLeave);

    return () => {
      if (dropContainer.current) {
        dropContainer.current.removeEventListener("dragover", handleDragOver);
        dropContainer.current.removeEventListener("drop", (e) => handleDrop(e, "drop"));
        dropContainer.current.removeEventListener("dragleave", handleDragLeave);
      }
    };
  }, [ownerLicense]);

  const TopNotification = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    }
  });

  function showAlert(icon, title, text) {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      showConfirmButton: false,
      width: 500,
      timer: 1500
    });
  }

  function showImage(image) {
    Swal.fire({
      imageUrl: image,
      showCloseButton: true,
      showConfirmButton: false,
      width: 450
    });
  }

  const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const shoeSizes = Array.from({ length: 21 }, (_, i) => (i + 30).toString());

  const [filters, setFilters] = useState({
    size: {
      clothing: [],
      shoes: []
    }
  });

  const handleSizeToggle = (size, category) => {
    setFilters((prevFilters) => {
      const selectedSizes = prevFilters.size[category] || [];
      const isSelected = selectedSizes.includes(size);
  
      if (!isSelected && selectedSizes.length >= 1) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const offerDetails = new FormData();
    const imagesData = new FormData();

    selectedFiles.forEach((file, index) => {
      imagesData.append("images", file);  
    });
    offerDetails.append("userID", user.userID);
    offerDetails.append("title", title);
    offerDetails.append("description", description);
    offerDetails.append("category", selectedCategory);
    offerDetails.append("price", price);
    offerDetails.append("colors", selectedColors);
    offerDetails.append("gender", selectedGender);
    offerDetails.append("size", filters);

    onSubmit({
      userID: user.userID,
      title,
      description,
      category: selectedCategory,
      price,
      imagesData,
      colors: selectedColors,
      gender: selectedGender,
      size: filters
    });

  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`${
          dragging
            ? "border border-[#2B92EC] bg-[#EDF2FF]"
            : "border-dashed border-[#e0e0e0]"
        } flex items-center justify-center mx-auto text-center border-2 rounded-md mt-4 py-5`}
        ref={dropContainer}
      >
        <div className="flex-1 flex flex-col">
          <div className="mx-auto text-gray-400 mb-2">
            <FaUpload size={18} />
          </div>
          <div className="text-[12px] font-normal text-gray-500">
            <input
              className="opacity-0 hidden"
              type="file"
              multiple
              accept="image/*"
              ref={fileRef}
              onChange={(e) => handleDrop(e, "inputFile")}
            />
            <span
              className="text-[#4070f4] cursor-pointer"
              onClick={() => {
                fileRef.current.click();
              }}
            >
              Click to upload
            </span>{" "}
            or drag and drop
          </div>
          <div className="text-[10px] font-normal text-gray-500">
            Maximum 15 images PNG, JPG or JPEG
          </div>
        </div>
      </div>
  
      {ownerLicense.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-4">
          {ownerLicense.map((img, index) => (
            <div key={index} className="w-full px-3 py-3.5 rounded-md bg-slate-200 space-y-3">
              <div className="flex justify-between">
                <div className="w-[70%] flex justify-start items-center space-x-2">
                  <div
                    className="text-[#5E62FF] text-[37px] cursor-pointer"
                    onClick={() => showImage(img.photo)}
                  >
                    {img.type.match(/image.*/i) ? (
                      <FaRegFileImage />
                    ) : (
                      <FaRegFile />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-500">
                      {img.name}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400">{`${Math.floor(
                      img.size / 1024
                    )} KB`}</div>
                  </div>
                </div>
                <div className="flex-1 flex justify-end">
                  <div className="space-y-1">
                    <div
                      className="text-gray-500 text-[17px] cursor-pointer"
                      onClick={() => onDelete(index)}
                    >
                      <BsX className="ml-auto" />
                    </div>
                    <div className="text-[10px] font-medium text-gray-400">
                      Done
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16">
          <div class="flex space-x-2 text-gray-800 ">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 9H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6m0-6v6m0-6 5.419-3.87A1 1 0 0 1 18 5.942v12.114a1 1 0 0 1-1.581.814L11 15m7 0a3 3 0 0 0 0-6M6 15h3v5H6v-5Z"/>
            </svg>
            <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium mb-2">Title</p>
          </div>
        <input 
          name="title" 
          maxLength={40} 
          type="text" 
          required 
          className="bg-gray-200 w-2/3 text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" 
          placeholder="title (max 40 characters)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>  
      <div className="mt-8">
          <div class="flex space-x-2 text-gray-800 ">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-5-4v4h4V3h-4Z"/>
            </svg>
            <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium mb-2">Description</p>
          </div>      
        <textarea 
          placeholder="description (max 300 characters)" 
          maxLength={300} 
          className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div class="flex space-x-2 text-gray-800 mt-8">
        <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z"/>
        </svg>
          <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium mb-2">Category</p>
      </div>
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
    <div className="mt-8 group inline-block">
          <div class="flex space-x-2 text-gray-800 ">
            <svg class="w-[33px] h-[33px] text-gray-800 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-width="1" d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"/>
              <path stroke="currentColor" stroke-width="1" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
            <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium">Colors</p>
          </div>   
        {[
          'Red', 'Green', 'Blue', 'Yellow', 'Black', 'White', 
          'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Cyan', 
          'Magenta', 'Lime', 'Indigo', 'Teal', 'Olive'
        ].map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-full border-2 border-gray-300 focus:outline-none mr-2
            ${selectedColors.includes(color) ? 'ring-2 ring-[#D47C24]' : ''}`}
            style={{ backgroundColor: color.toLowerCase() }}
            onClick={() => handleColorSelect(color)}
          ></button>
        ))}
    </div>
    <div className="mt-8">
          <div class="flex space-x-2 text-gray-800 ">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
            <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium mb-2">Gender</p>
          </div>
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
    <div className="mt-8">
    <div class="flex space-x-2 text-gray-800 ">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 5H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M12 7L14 5L12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M5 3L3 5L5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M19 10V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M17 19L19 21L21 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M21 12L19 10L17 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M12 10H5C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21H12C13.1046 21 14 20.1046 14 19V12C14 10.8954 13.1046 10 12 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
            <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium">Size</p>
          </div>
        <div className="md:flex md:space-x-4 mt-4 grid grid-cols-3 gap-y-8 flex-wrap">
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
    <div className="mt-8 group">
        <div class="flex space-x-2 text-gray-800 ">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 17.345a4.76 4.76 0 0 0 2.558 1.618c2.274.589 4.512-.446 4.999-2.31.487-1.866-1.273-3.9-3.546-4.49-2.273-.59-4.034-2.623-3.547-4.488.486-1.865 2.724-2.899 4.998-2.31.982.236 1.87.793 2.538 1.592m-3.879 12.171V21m0-18v2.2"/>
          </svg>
          <p class="lg:text-2xl text-xl lg:leading-6 leading-5 font-medium mb-2">Price</p>
        </div>      
        <input 
          type="number" 
          placeholder="price" 
          maxLength={5} 
          className="bg-gray-200 w-1/5 text-sm px-4 py-3.5 rounded-md outline-[#8B4513]"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
    </div>
    <button type="submit" className="bg-[#8B4513] ml-96 text-white text-lg px-4 py-2 rounded-xl">List an item!</button>
    </form>
  );
}