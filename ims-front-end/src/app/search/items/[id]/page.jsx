"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUserContext } from '@/app/AppContext';


export default function ItemDetail({ params }) {
    const router = useRouter();
    const [item, setItem] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();
    const [fetchStatus, setFetchStatus] = useState(null);
    const [barcodeImageUrl, setBarcodeImageUrl] = useState('');
    const [src, setSrc] = useState('');


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`http://localhost:8001/item/get/${params.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + user.token
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch item');
                }

                const data = await response.json();
                setItem(data);
                setFetchStatus('success');
                const locationResponse = await fetch(`http://localhost:8001/itemLocation/getByItemId/${params.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + user.token
                    },
                });

                if (locationResponse.ok) {
                    const locationDataRaw = await locationResponse.json();
                    const locationDataPromises = locationDataRaw.map(async (location) => {
                        const locationDetailResponse = await fetch(`http://localhost:8001/location/get/${location.locationId}`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + user.token
                            },
                        });
                        const locationDetail = await locationDetailResponse.json();
                        return {
                            key: location.locationId,
                            locationName: locationDetail.name,
                            quantityAtLocation: location.quantityAtLocation
                        };
                    });

                    const transformedLocationData = await Promise.all(locationDataPromises);
                    setLocationData(transformedLocationData);
                }
                if (item) {
                    setSrc(`/${item.itemId}.jpeg`);
                }
            } catch (error) {
                console.error('Error:', error);
                setFetchStatus('error');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.id, user.token]);


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!item && fetchStatus === 'error') {
        return <div>Error fetching item. Please try again later.</div>;
    }

    if (!item) {
        return <div>No item found.</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="flex flex-row items-center justify-center w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-3/5 flex flex-row px-6 py-8 gap-4">
                    <div className="md:w-1/2">
                        <Image
                            src={src || '/default.jpeg'}
                            alt={item.name}
                            width={500}
                            height={300}
                            layout="responsive"
                            className="rounded-lg"
                        />
                    </div>
                    <div className="md:w-1/2 flex flex-col justify-center">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{`${item.name} (ID: ${item.itemId})`}</h2>
                        <p className="text-gray-600 dark:text-gray-200 my-4 item-description">Description: {item.description}</p>
                        <p className="text-lg font-bold item-price">Price: ${item.price}</p>
                        <p className="text-lg font-bold item-stock-level">Current Stock Level: {item.currentStockLevel}</p>
                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow mt-4">
                            <table className="min-w-full leading-normal">
                                <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Location ID
                                    </th>
                                    <th className="px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Location Name
                                    </th>
                                    <th className="px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Quantity at Location
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {locationData.map(location => (
                                    <tr key={location.key}>
                                        <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{location.key}</p>
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{location.locationName}</p>
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{location.quantityAtLocation}</p>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
