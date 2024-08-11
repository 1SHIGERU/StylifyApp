import { AuthData } from "../../auth/AuthWrapper"

export const ErrorPage = () => {

     const { user } = AuthData();

     return (
          <div className="flex h-screen pt-16 flex-col bg-white">
               <img
               src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80"
               alt=""
               className="h-64 w-full object-cover"
               />
               <div className="flex flex-1 items-center justify-center">
                    <div className="mx-auto max-w-xl px-4 py-8 text-center">
                         <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                         We can't find that page.
                         </h1>

                         <p className="mt-4 text-gray-500">
                         Try searching again, or return home to start from the beginning.
                         </p>

                         <a
                         href="/"
                         className="mt-6 inline-block text-[#8B4513] border-b-2 border-[#8B4513] px-5 py-3 text-md font-medium focus:outline-none focus:ring"
                         >
                         Go Back Home
                         </a>
                         <a
                         href="/login"
                         className="mt-6 ml-4 bg-[#8B4513] inline-block rounded px-5 py-3 text-md font-medium text-white focus:outline-none focus:ring"
                         >
                         Login
                         </a>
                    </div>
               </div>
          </div>
     )
}
