import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthData } from "../../auth/AuthWrapper"


export const Login = () => {

     const { login } = AuthData();
     const [ formData, setFormData ] = useReducer((formData, newItem) => { return ( {...formData, ...newItem} )}, {emailOrUsername: "", password: ""})
     const [ errorMessage, setErrorMessage ] = useState("");
     const navigate = useNavigate();

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData({ [name]: value });
      };
   
     const doLogin = async () => {
          try {            
               await login(formData.emailOrUsername, formData.password)
          } catch (error) {
               console.log(error)               
          }         
     }

     return (
          <>
             
               <div class="font-[sans-serif] pt-24 overflow-hidden dark:bg-[#252526]">
                    <div class="min-h-screen flex fle-col items-center justify-center py-6 px-4">
                    <div class="grid md:grid-cols-2 items-center gap-10 max-w-6xl w-full">
                         <div class="max-md:text-center">
                         <h2 class="lg:text-7xl text-[#8B4513] dark:text-[#F6C177] text-4xl font-extrabold lg:leading-[55px]">
                              Welcome back
                         </h2>
                         <p class="text-xl dark:text-gray-300 mt-6">Glad to see you again!</p>
                              <p class="text-sm mt-10 dark:text-gray-300">Don't have an account 
                              
                              <a onClick={() => navigate("/register")}  className="text-[#8B4513] dark:text-[#F6C177] font-semibold hover:underline ml-1 cursor-pointer">
                                   Register here
                              </a></p>
                              
                         </div>
                         <form class="space-y-6 max-w-md md:ml-auto max-md:mx-auto w-full">
                         <h3 class="text-3xl dark:text-[#F6C177] font-extrabold mb-8 max-md:text-center">
                         log in
                         </h3>
                         <div>
                              <input name="emailOrUsername" type="text" required class="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" placeholder="email lub login" value={formData.emailOrUsername} onChange={handleChange} />
                         </div>
                         <div>
                              <input name="password" type="password" required class="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" placeholder="password" value={formData.password} onChange={handleChange} />
                         </div>
                         <div class="flex items-center justify-between">
                         <div class="flex items-center">
                                    
                         </div>
                         <div class="text-sm">
                             
                         </div>
                              
                         </div>
                         <div class="!mt-10">
                         <button onClick={doLogin} type="button" class="transition dark:text-[#F6C177] hover:dark:text-gray-100 duration-250 w-full shadow-xl hover:dark:bg-[#F6C177] dark:border-[#F6C177] py-2.5 px-4 text-sm font-semibold rounded text-[#8B4513] border-2 border-[#8B4513] hover:bg-[#8B4513] hover:text-white focus:outline-none">
                              log in
                         </button>
                         
                         </div>
                         <p class="my-10 text-sm text-gray-500 dark:text-gray-300 text-center">or continue with</p>
                         <div class="space-x-6 flex justify-center">
                         
                         
                         <button type="button"
                              class="border-none outline-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="30px" class="inline" viewBox="0 0 512 512">
                              <path fill="#fbbd00"
                                   d="M120 256c0-25.367 6.989-49.13 19.131-69.477v-86.308H52.823C18.568 144.703 0 198.922 0 256s18.568 111.297 52.823 155.785h86.308v-86.308C126.989 305.13 120 281.367 120 256z"
                                   data-original="#fbbd00" />
                              <path fill="#0f9d58"
                                   d="m256 392-60 60 60 60c57.079 0 111.297-18.568 155.785-52.823v-86.216h-86.216C305.044 385.147 281.181 392 256 392z"
                                   data-original="#0f9d58" />
                              <path fill="#31aa52"
                                   d="m139.131 325.477-86.308 86.308a260.085 260.085 0 0 0 22.158 25.235C123.333 485.371 187.62 512 256 512V392c-49.624 0-93.117-26.72-116.869-66.523z"
                                   data-original="#31aa52" />
                              <path fill="#3c79e6"
                                   d="M512 256a258.24 258.24 0 0 0-4.192-46.377l-2.251-12.299H256v120h121.452a135.385 135.385 0 0 1-51.884 55.638l86.216 86.216a260.085 260.085 0 0 0 25.235-22.158C485.371 388.667 512 324.38 512 256z"
                                   data-original="#3c79e6" />
                              <path fill="#cf2d48"
                                   d="m352.167 159.833 10.606 10.606 84.853-84.852-10.606-10.606C388.668 26.629 324.381 0 256 0l-60 60 60 60c36.326 0 70.479 14.146 96.167 39.833z"
                                   data-original="#cf2d48" />
                              <path fill="#eb4132"
                                   d="M256 120V0C187.62 0 123.333 26.629 74.98 74.98a259.849 259.849 0 0 0-22.158 25.235l86.308 86.308C162.883 146.72 206.376 120 256 120z"
                                   data-original="#eb4132" />
                              </svg>
                         </button>
                        
                         </div>
                         </form>
                         
                    </div>
                    </div>
               </div>
               </>
  
     )
}