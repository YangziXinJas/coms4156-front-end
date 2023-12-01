"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const WebName = 'Track & Trace Hub';
const Instructions = 'Discover the power of pinpoint precision with our web platform, Track & Trace Hub, your one-stop solution for all things inventory. With our system, you can effortlessly monitor item statuses, pinpoint their locations, and keep a vigilant eye on stock levels to ensure you\'re never caught off guard. Navigate through our intuitive dashboard to place orders from various item locations, tailored to meet your unique business needs. Dive into the details of each item, examine the intricacies of every location, scrutinize order histories, and pore over the specifics of order details to gain a comprehensive understanding of your inventory landscape. What\'s more, you can enlist in our community by signing up, unlocking the full potential of our web services. Take the leap with Track & Trace Hub and transform how you manage, order, and analyze your inventory—because when it comes to asset management, knowledge isn\'t just power; it\'s profit.';

const items = [1000001, 1000002, 1000003, 1000004, 1000005, 1000006, 1000007, 1000008];

export default function Home() {

  const router = useRouter();

  const navigateToLogin = () => {
    router.push('/login');
  };


const navigateToSearch = () => {
    router.push('/search');
  };

  return (
    <div className="container mx-auto px-4 dark:bg-gray-800">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl dark:text-white">{WebName}</h1>
        <div className="flex items-center">
          <button onClick={navigateToSearch} className="ml-2 p-2 border rounded">Search</button>
        </div>
      </header>

<div className="my-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="md:w-2/3 md:pr-4">
            <p className="mb-2 text-gray-900 dark:text-white">{Instructions}</p>
            <button onClick={navigateToLogin} className=" text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Log In</button>
          </div>

          <div className="md:w-1/3 mt-4 md:mt-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=..."
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
