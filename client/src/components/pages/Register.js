import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthData } from "../../auth/AuthWrapper"
import { useForm } from "react-hook-form";


export const Register = () => {

    const navigate = useNavigate();
    const { register1 } = AuthData();
    const [ formData, setFormData ] = useReducer((formData, newItem) => { return ( {...formData, ...newItem} )}, {userName: "", email: "", password: "", firstName: "", familyName: ""})

    const {
         register,
         formState: { errors },
         handleSubmit,
         watch,
         setError,
         clearErrors
     } = useForm();
     
     const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ [name]: value });
    };

    const onSubmit = async (data) => {
     if (data.password !== data.repeatPassword) {
       setError("repeatPassword", {
         type: "manual",
         message: "Passwords must match",
       });
       return;
     } else {
       clearErrors("repeatPassword");
     }

     try {
       await register1(
         data.userName,
         data.email,
         data.password,
         data.firstName,
         data.familyName
       );
     } catch (error) {
       console.error("Error registering:", error.message);
     }
   };

    return (
        <>
        <>
                    <div className="font-[sans-serif] pt-24 dark:bg-[#252526]">
                         <div className="min-h-screen flex fle-col items-center justify-center py-6 px-4">
                              <div className="grid md:grid-cols-2 items-center gap-10 max-w-6xl w-full">
                              <div className="max-md:text-center">
                                   <h2 className="lg:text-7xl text-[#8B4513] dark:text-[#F6C177] text-4xl font-extrabold lg:leading-[55px]">
                                        Hi there
                                   </h2>
                                   <p className="text-xl dark:text-gray-300 mt-6">Create your account!</p>
                                   <p className="text-sm mt-10 dark:text-gray-300">Already have an account?
                                        <a onClick={() => navigate("/login")} className="text-[#8B4513] dark:text-[#F6C177] font-semibold hover:underline ml-1 cursor-pointer">
                                             Log in!
                                        </a>
                                   </p>
                              </div>
                              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md md:ml-auto max-md:mx-auto w-full">
                                   <h3 className="text-3xl dark:text-[#F6C177] font-extrabold mb-8 max-md:text-center">
                                        Register
                                   </h3>
                                   <div>
                                        <input {...register("userName", { required: true, maxLength: 20 })} name="userName" value={formData.userName} onChange={handleChange} type="text" className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" placeholder="username" />
                                        <error class="text-red-500">
                                             {errors.userName?.type === "required" && "Username is required"}
                                             {errors.userName?.type === "maxLength" && "Entered username is more than 20 characters"}
                                        </error>
                                   </div>
                                   <div>
                                        <input name="password" {...register("password", { required: true, minLength: 3, maxLength: 20, })} value={formData.password} type="password" onChange={handleChange} className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" placeholder="password" />
                                        <error class="text-red-500">
                                             {errors.password?.type === "minLength" && "Entered password is less than 3 characters"}
                                             {errors.password?.type === "maxLength" && "Entered password is more than 20 characters"}
                                        </error>
                                   </div>
                                   <div>
                                        <input name="repeatPassword" {...register("repeatPassword", { required: true })} type="password" className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" placeholder="repeat password" />
                                        <error class="text-red-500">
                                             {errors.repeatPassword && errors.repeatPassword.message}
                                        </error>
                                   </div>
                                   <div>
                                        <input {...register("email", { required: true, pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i, })} value={formData.email} name="email" onChange={handleChange} type="email" className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" placeholder="email" />
                                        <error class="text-red-500">
                                             {errors.email?.type === "required" && "Email is required"}
                                             {errors.email?.type === "pattern" && "Entered email is in wrong format"}
                                        </error>
                                   </div>
                                   <div>
                                        <input {...register("firstName", { required: true })} name="firstName" type="text" value={formData.firstName} className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" onChange={handleChange} placeholder="name" />
                                        <error class="text-red-500">
                                             {errors.name?.type === "required" && "Name is required"}
                                        </error>
                                   </div>
                                   <div>
                                        <input {...register("familyName", { required: true })} name="familyName" onChange={handleChange} value={formData.familyName} type="text" className="bg-gray-200 w-full text-sm px-4 py-3.5 rounded-md outline-[#8B4513]" placeholder="surname" />
                                        <error class="text-red-500">
                                             {errors.surname?.type === "required" && "Surname is required"}
                                        </error>
                                   </div>
                                   <div className="!mt-10">
                                        <button type="submit" className="transition dark:border-[#F6C177] dark:text-[#F6C177] hover:dark:bg-[#F6C177] hover:dark:text-gray-100  duration-250 w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded text-[#8B4513] border-2 border-[#8B4513] hover:bg-[#8B4513] hover:text-white focus:outline-none">
                                             Create account
                                        </button>
                                   </div>

                              </form>

                              </div>
                         </div>
                    </div>
               </>
        </>
    )

}
