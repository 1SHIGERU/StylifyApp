import {React,useState} from 'react';
import {DragComponent} from '../OffersForm/DragComponent';
import Wardrobe from '../../assets/wardrobe.jpeg';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export const AddOffer = () => {

    const [offerDetails, setOfferDetails] = useState(new FormData());
    const [images, setImages] = useState([]);
    const [offerID, setOfferID] = useState('');
    const Navigate = useNavigate();


    const handleFormSubmit = async (data) => {

        const { clothing = [], shoes = [] } = data.size.size;
        let size = null;

        if (clothing.length > 0 && shoes.length > 0) {
            return;
        } else if (clothing.length > 0) {
            size = clothing[0];
        } else if (shoes.length > 0) {
            size = shoes[0];
        } 

        const imagesArray = [];
        for (let [key, value] of data.imagesData.entries()) {
            imagesArray.push(value);
        }
        
        setImages(imagesArray);
        const colorsString = data.colors.join(', ');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}offers/`, {
                ownerID: data.userID,
                title: data.title,
                description: data.description,
                price: data.price,
                category: data.category,
                gender: data.gender,
                colors: colorsString,
                size: size,
                currency: data.currency

            });
            const newOfferID = response.data.offerID;
            setOfferID(newOfferID);

            if (newOfferID) {
                await uploadImages(newOfferID, imagesArray);
            }

        } catch (error) {
            console.error('We can\'t add an offer', error);
            return;
        }

        Navigate('/market')
        toast.success('Offer added successfully', { position: 'top-center' });
    };

    const uploadImages = async (offerID, images) => {
        const imagesData = new FormData();

        images.forEach((file, index) => {
            imagesData.append("images", file);
        });
        imagesData.append('offerID', offerID);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}offerImages/`, imagesData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Images uploaded successfully', response);
        } catch (error) {
            console.error('We can\'t upload files', error);
        }
    };


    return (
        <>
            <div className='flex min-h-screen'>
                <div className='flex justify-center w-2/3'>
                    <DragComponent onSubmit={handleFormSubmit} />
                    
                </div>
                <div className='flex justify-center bg-[#8B4513] w-1/3'>
                    <img src={Wardrobe} alt='wardrobe' className='' />
                </div>
            </div>
        </>
    );
};

