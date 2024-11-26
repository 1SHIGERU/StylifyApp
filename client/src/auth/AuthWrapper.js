import { createContext, useContext, useState, useEffect } from "react";
import { RenderMenu, RenderRoutes } from "../components/structure/RenderNavigation";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Image from "../assets/wardrobe.jpeg"
import { toast } from "react-toastify";

const AuthContext = createContext();
export const AuthData = () => useContext(AuthContext);

export const AuthWrapper = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    firstName: "",
    familyName: "",
    userID: "",
    isAdmin: false,
    isAuthenticated: false,
    description: "",
    isBanned: false,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const login = async (email1, password1) => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}api/auth/login/`, {
        email: email1,
        password: password1,
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const userFetched = await getUser();

      if(userFetched.isBanned){
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        toast.error('You have been banned, please apply for an unban on /contact ', { position: 'top-center' });
        return;
      }
      else{
        navigate("/");
        toast.success('Logged in successfully', { position: 'top-center' });
      }   

    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error('Such an account not found', { position: 'top-center' });
        } else if (error.response.status === 401) {
          toast.error('Invalid Credentials', { position: 'top-center' });
        } else {
          toast.error('An unexpected error occurred', { position: 'top-center' });
        }
      } else {
        toast.error('Server is unreachable', { position: 'top-center' });
      }
    }
  };

  const getUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token available');
      }
  
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}api/auth/user`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      if (data.isBanned) {
        console.warn("User is banned. Skipping user data assignment.");
        return { isBanned: true };
      }
  
      const userData = {
        ...user,
        isAuthenticated: true,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        familyName: data.familyName,
        userID: data.userID,
        isAdmin: data.isAdmin,
        avatar: data.avatarURL,
        description: data.description,
        isBanned: false,
      };
  
      setUser(userData);
      return userData;
  
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };
  

  const register1 = async (username1, email1, password1, firstName1, familyName1) => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}api/auth/register/`, {
        username: username1,
        email: email1,
        password: password1,
        firstName: firstName1,
        familyName: familyName1,
      });
      navigate("/login");
      toast.success('User registered successfully', { position: 'top-center' });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error(`${error.response.data.msg}`, { position: 'top-center' });
        } else if (error.response.status === 405) {
          toast.error(`${error.response.data.msg}`, { position: 'top-center' });
        } else {
          toast.error('Registration failed', { position: 'top-center' });
        }
      } else {
        toast.error('Server error, please try again later', { position: 'top-center' });
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeTab');
    setUser({
      username: "",
      email: "",
      firstName: "",
      familyName: "",
      userID: "",
      isAdmin: false,
      isAuthenticated: false,
      description: "",
      avatarURL: "",
      isBanned: false,
    });
    navigate("/");
  };

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      getUser();
    }
  }, []);

  if (isMobile) {
    return (
     <section class="py-10 bg-gray-50 sm:py-16 lg:py-24">
          <div class="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
          <div class="grid items-center grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-20">
               <div class="">
                    <h2 class="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">Ooops</h2>
                    <p class="mt-4 text-base leading-relaxed text-gray-600">This site is for desktop devices only, please let us know if you would like to see our mobile app</p>
               </div>
     
               <div class="relative pl-20 pr-6 sm:pl-6 md:px-0">
                    <div class="relative w-full max-w-xs mt-4 mb-10 ml-auto">
                         <img class="ml-auto" src={Image} alt="" />
     
                         <img class="absolute -top-4 -left-12" src="https://cdn.rareblocks.xyz/collection/celebration/images/features/1/wavey-lines.svg" alt="" />
     
                         <div class="absolute -bottom-10 -left-16">
                              <div class="bg-yellow-300">
                              <div class="px-8 py-10">
                                   <span class="block text-4xl font-bold text-black lg:text-5xl"></span>
                                   <span class="block mt-2 text-base leading-tight text-yellow-300"> XXXXXXXX<br />XXXXX </span>
                              </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
          </div>
          <div class="mt-6 overflow-hidden bg-white rounded-xl">
                <div class="px-6 py-12 sm:p-12">
                    <h3 class="text-3xl font-semibold text-center text-gray-900">Let us know</h3>

                    <form action="#" method="POST" class="mt-14">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                            <div>
                                <label for="" class="text-base font-medium text-gray-900"> Your name </label>
                                <div class="mt-2.5 relative">
                                    <input type="text" name="" id="" placeholder="Enter your full name" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                </div>
                            </div>

                            <div>
                                <label for="" class="text-base font-medium text-gray-900"> Email address </label>
                                <div class="mt-2.5 relative">
                                    <input type="email" name="" id="" placeholder="Enter your full name" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                </div>
                            </div>

                            <div>
                                <label for="" class="text-base font-medium text-gray-900"> Phone number </label>
                                <div class="mt-2.5 relative">
                                    <input type="tel" name="" id="" placeholder="Enter your full name" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                </div>
                            </div>

                            <div>
                                <label for="" class="text-base font-medium text-gray-900"> Company name </label>
                                <div class="mt-2.5 relative">
                                    <input type="text" name="" id="" placeholder="Enter your full name" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-orange-500" />
                                </div>
                            </div>

                            <div class="sm:col-span-2">
                                <label for="" class="text-base font-medium text-gray-900"> Message </label>
                                <div class="mt-2.5 relative">
                                    <textarea name="" id="" placeholder="" class="block w-full px-4 py-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md resize-y focus:outline-none focus:border-orange-500" rows="4"></textarea>
                                </div>
                            </div>

                            <div class="sm:col-span-2">
                                <button type="submit" class="inline-flex items-center justify-center w-full px-4 py-4 mt-2 text-base font-semibold text-white transition-all duration-200 bg-orange-500 border border-transparent rounded-md focus:outline-none hover:w-2/3 hover:ml-40 hover:rounded-full">
                                    Send
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
     </section>
 
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register1, getUser }}>
      <>
        <Header />
        <RenderRoutes />
        
      </>
    </AuthContext.Provider>
  );
};
