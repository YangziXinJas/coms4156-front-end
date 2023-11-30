"use client"

import { useState } from "react";
import { useRouter, redirect } from "next/navigation";
import { useUserContext } from "@/app/AppContext";

export default function Search() {

  const [ locationId, setLocationId ] = useState();
  const router = useRouter();

  const { user } = useUserContext();

  if (Object.keys(user).length === 0) {
    redirect("/login");
  }

  const searchLocation = () => {
    if (locationId !== null){ 
      router.push("/location/" + locationId);
    }
  };

  const searchItem = () => {

  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="flex flex-row items-center justify-center w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="w-1/2 p-6 space-y-4">
          <h2 className="text-center text-xl font-bold text-gray-900 md:text-2xl dark:text-white">Search Location</h2>
          <div>
            <label htmlFor="location-id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location ID</label>
            <input onChange={e => setLocationId(e.currentTarget.value)} type="text" name="location-id" id="location-id" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="" />
          </div>
          <button onClick={searchLocation} className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Search</button>
        </div>

        <div className="h-[500px] w-px self-stretch bg-gradient-to-tr from-transparent via-neutral-500 to-transparent opacity-20 dark:opacity-100"></div>
        
        <div className="w-1/2 p-6 space-y-4">
          <h2 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">Search Item</h2>
          <div>
            <label htmlFor="item-id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Item ID</label>
            <input type="text" name="item-id" id="item-id" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="" />
          </div>
          <button onClick={searchItem} className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Search</button>
        </div>
      </div>
    </div>
  )
};
