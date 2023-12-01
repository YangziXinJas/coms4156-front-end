"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserContext } from '@/app/AppContext';

export default function ItemDetail({ params }) {
    const router = useRouter();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`http://localhost:8001/item/get/${params.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.token}`
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch item');
                }

                const data = await response.json();
                setItem(data);
            } catch (error) {
                console.error('Error fetching item data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.id, user.token]);

    const navigateToCart = () => {
        router.push('/cart');
    };

    const navigateToSearch = () => {
        router.push('/search');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!item) {
        return <div>No item found.</div>;
    }

    const relatedItems = Array.from({ length: 4 }, (_, index) => ({
        id: parseInt(item.id) + index + 1,
        imageUrl: `/${parseInt(item.id) + index + 1}.jpeg`,
    }));


  return (
    <div className="container mx-auto px-4 dark:bg-gray-800">
      <header className="flex justify-between items-center py-4">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl dark:text-white">Track & Trace Hub</h1>
        <div className="flex items-center">
          <button onClick={navigateToSearch} className="ml-2 p-2 border rounded">Search</button>
          <button onClick={navigateToCart} className="ml-2 p-2 border rounded">Cart</button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row my-8">
        <div className="md:w-1/2 md:pr-4">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={500}
            height={300}
            layout="responsive"
            className="rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold">{item.name}</h2>
          <p className="text-gray-600 dark:text-gray-200 my-4">{item.description}</p>
          <p className="text-lg font-bold">Price: ${item.price}</p>
          <p className="mb-4">Current Stock Level: {item.currentStockLevel}</p>
          <div>
            <label htmlFor="quantity" className="mr-2">Quantity:</label>
            <input type="number" id="quantity" defaultValue={1} min={1} max={item.currentStockLevel} className="border rounded px-2 py-1 text-gray-800" />
            <button className="ml-2 bg-primary-600 text-white px-5 py-2.5 rounded">Add To Cart</button>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">Related Items</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {relatedItems.map(relatedItem => (
          <div key={relatedItem.id} className="border p-4 rounded-lg">
            <Image
              className="w-52 h-32 relative"
              src={relatedItem.imageUrl}
              alt={`Item ${relatedItem.id}`}
              width={150}
              height={100}
            />
            <p className="mt-2 text-center">Item {relatedItem.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
