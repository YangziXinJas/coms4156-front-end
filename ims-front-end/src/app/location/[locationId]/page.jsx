"use client"

import { useUserContext } from "@/app/AppContext";
import { useState, useEffect } from "react"
import { redirect } from "next/navigation";
import { InventoryTable } from "./components/InventoryTable";

export default function Location({ params }) {
  const [ locationData, setLocationData ] = useState({});
  const { user } = useUserContext();

  if (Object.keys(user).length === 0) {
    redirect("/login");
  }

  const fetchLocationData = async () => {
    const response = await fetch("http://localhost:8001/location/get/" + params.locationId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + user.token
      },
    });

    if (response.status === 404){
      return response.text();
    }
    return response.json();
  };

  const isObject = (object) => {
    return object != null && typeof object === 'object';
  }

  const deepEqual = (object1, object2) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = isObject(val1) && isObject(val2);
      if (
        areObjects && !deepEqual(val1, val2) ||
        !areObjects && val1 !== val2
      ) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    fetchLocationData().then((res) => {
      if (!deepEqual(res, locationData)) {
        setLocationData(res);
      }
    });
  },[locationData]);

  if (!locationData || locationData.length < 1) {
    return ( <p>Loading</p>)
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="flex flex-col items-start justify-center w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="w-3/5 px-6 py-8 flex flex-col gap-4">
          <div className="flex flex-row gap-8">
            <p>Location Name: {locationData.name} </p>
            <p>Location ID: { params.locationId }</p>
          </div>
          <div className="flex flex-col gap-4">       
            <p>Address Line 1: {locationData.address1}</p>
            { locationData.address2 ? <p>Address Line 2: {locationData.address2}</p>: null }
            <p>Zip Code: { locationData.zipCode}</p>
          </div>
        </div>
        <div>
          <InventoryTable locationId={params.locationId}/>
        </div>
      </div>
    </div>
  )
};
