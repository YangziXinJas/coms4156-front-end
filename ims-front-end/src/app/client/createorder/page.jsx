"use client";
import React, { useState } from 'react';
import { useUserContext } from "@/app/AppContext";
import { useRouter, redirect } from "next/navigation";

export default function OrderForm() {
    const [error, setError] = useState('');
    const { user } = useUserContext();
    const router = useRouter();
    const [orderType, setOrderType] = useState('buy');
    const [dueDate, setDueDate] = useState('');
    const [formData, setFormData] = useState({
        itemId: '',
        locationId: '',
        quantity: '',
        amount: ''
    })

    if (Object.keys(user).length === 0) {
        redirect("/login");
    }

    const closeModal = () => {
        setError('');
    };

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleTypeChange = (event) => {
        const type = event.target.value;
        setOrderType(type);
        if (type === 'buy') {
            setDueDate('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const orderDate = new Date().toISOString().slice(0, 19);

        const orderData = {
            clientId: user.clientId,
            type: orderType,
            orderDate: orderDate,
            orderStatus: "In progress",
            itemId: formData.itemId,
            quantity: formData.quantity,
            amount: formData.amount,
            dueDate: dueDate,
            locationId: formData.locationId
        };

        try {
            const response = await fetch('http://localhost:8001/order/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + user.token
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create order');
            }
            alert('Order created successfully');
            router.push('http://localhost:3001/client');
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error creating order');
        }
    };

    return (
        <div className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="flex flex-row items-center justify-center w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="w-3/5 px-6 py-8 flex flex-col gap-4">
                        <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
                        Create New Order
                        </h2>

                    <form className="px-8 pt-6 pb-8 mb-4 bg-white rounded" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="itemID">
                                Item ID
                            </label>
                            <input className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" id="itemId" type="text" placeholder="Item ID" onChange={handleInputChange}/>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="locationID">
                                Location ID
                            </label>
                            <input className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" id="locationId" type="text" placeholder="Location ID" onChange={handleInputChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="quantity">
                                Quantity
                            </label>
                            <input className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" id="quantity" type="text" placeholder="Quantity" onChange={handleInputChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="amount">
                                Amount
                            </label>
                            <input className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" id="amount" type="text" placeholder="Amount" onChange={handleInputChange}/>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="type">
                                Type
                            </label>
                            <select className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" id="type" value={orderType} onChange={handleTypeChange}>
                                <option value="buy">Buy</option>
                                <option value="rent">Rent</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="dueDate">
                                Due Date
                            </label>
                            <input className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline" id="dueDate" type="date" placeholder="yyyy-mm-dd" value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={orderType === 'buy'} />
                        </div>
                        <div className="flex justify-center mt-4">
                            <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline">
                                Submit
                            </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
            {error && (
                <div className="fixed top-0 left-0 right-0 z-50 flex items-start justify-center w-full">
                    <div className="p-4 mt-16 bg-white border rounded shadow-lg max-w-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-bold">Error</span>
                            <button onClick={closeModal} className="text-lg font-bold">&times;</button>
                        </div>
                        <p className="text-red-500">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}