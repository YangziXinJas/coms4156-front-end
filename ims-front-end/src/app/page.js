"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const WebName = 'HealthWare Logistics';
const Instructions = 'Explore the streamlined efficiency of HealthWare Logistics, your premier partner in medical inventory management. Our HealthWare Logistics is expertly designed for the healthcare sector, offering a powerful, yet intuitive platform to monitor, manage, and analyze medical supplies with unparalleled precision. From tracking real-time item statuses to managing stock levels across multiple locations, our system ensures you\'re always prepared and never caught off guard. Delve into detailed order histories, place orders with ease, and gain insightful analytics to keep your operations running smoothly. Embrace HealthWare Logistics and elevate your inventory strategy to the next level of excellence.'
const items = [31, 32, 33, 34, 35, 36, 37, 38];

export default function Home() {

  const router = useRouter();

  const navigateToLogin = () => {
    router.push('/login');
  };


  return (
    <div className="container mx-auto px-4 dark:bg-gray-800">
      <header className="flex justify-between items-center py-4">
             <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl dark:text-white">{WebName}</h1>

      </header>

<div className="my-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="md:w-2/3 md:pr-4">
            <p className="mb-2 text-gray-900 dark:text-white">{Instructions}</p>
            <button onClick={navigateToLogin} className=" text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Log In</button>
          </div>

          <div className="md:w-1/3 mt-4 md:mt-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d12084.173820644099!2d-73.9712484!3d40.7830588!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1701797313278!5m2!1sen!2sus"
              width="100%"
              height="280"
              style={{ border: "0" }}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item} className="border p-4 rounded-lg">
            <Image
                className="w-52 h-32 relative"
                src={`/${item}.jpeg`}
                alt={`Item ${item}`}
                width={100}
                height={150}
            />
            <p>Item</p>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
