import { useRef, useEffect, useState } from "react";
import { FaUpload, FaRegFileImage, FaRegFile } from "react-icons/fa";
import { BsX } from "react-icons/bs";
import Swal from "sweetalert2";
import "../../index.css";
import { AuthData } from "../../auth/AuthWrapper";
import axios from "axios";
import { set } from "date-fns";

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

  // Auction details
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('T-shirts');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');


  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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

        const response = await axios.post('http://localhost:13000/offerImages/recognize', {
          image: base64String
        });

        if (response.data && response.data.labels) {
          console.log("Rozpoznane etykiety:", response.data.labels[2].name);
          setSelectedCategory((response.data.labels[2].name));
        }

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

    onSubmit({
      userID: user.userID,
      title,
      description,
      category: selectedCategory,
      price,
      imagesData
    });

  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Container Drop */}
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
        <h2 className="text-black text-2xl">Title</h2>
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
        <h2 className="text-black text-2xl">Description</h2>      
        <textarea 
          placeholder="description (max 300 characters)" 
          maxLength={300} 
          className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <h2 className="mt-8 text-black text-2xl">Category</h2>
      {/* Category selector */}
      <div className="relative group">
        <button className="outline-none focus:outline-none bg-gray-200 border px-3 py-1 rounded-sm flex items-center">
            <span className="pr-1 flex-1">{selectedCategory}</span>
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
        <h2 className="text-black text-2xl">Price</h2>      
        <input 
          type="number" 
          placeholder="price" 
          maxLength={5} 
          className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
    </div>
    <button type="submit" className="bg-[#8B4513] ml-96 text-white text-lg px-4 py-2 rounded-xl">List an item!</button>
    </form>
  );
}