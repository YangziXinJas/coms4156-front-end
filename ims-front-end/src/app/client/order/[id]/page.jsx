"use client"

import { OrderItemsTable } from "./components/OrderItemsTable";
import { useState, useEffect } from "react";
import { useUserContext } from "@/app/AppContext";
import { redirect } from "next/navigation";
import { table } from "@nextui-org/react";

export default function OrderDetail({ params }) {
  const [ data, setData ] = useState([]);
  const { user } = useUserContext();

  if (Object.keys(user).length === 0) {
    redirect("/login");
  }

  const fetchData = async () => {
    const response = await fetch("http://localhost:8001/order/retrieve/order/" + params.id, {
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
  }

  const objectsEqual = (o1, o2) =>
    Object.keys(o1).length === Object.keys(o2).length 
        && Object.keys(o1).every(p => o1[p] === o2[p]);

  const arraysEqual = (a1, a2) => 
      a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]));


  useEffect(() => {
    fetchData().then((res) => {
      const tableData = res.map((item, index) => (
        {
          key: index + 1 + "",
          item: item.itemId,
          price: item.amount,
          quantity: item.quantity,
          type: item.type,
          status: item.orderStatus,
          orderDate: item.orderDate,
          dueDate: item.dueDate,
        }
      ))
      if (!arraysEqual(tableData, data)){
        setData(tableData);
      }
    });
  },[data]);

  const calculateTotal = () => {
    return data.reduce((a, b) => (a + b.price), 0)
  }

  if (data === null || data.length < 1){
    return (<>Loading</>)
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="flex flex-row items-center justify-center w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="w-2/3 px-6 py-8 flex flex-col gap-4">
          <div className="flex flex-row gap-8">
            <h1>Order Number #{params.id}</h1>
          </div>
          <div>
            <OrderItemsTable orderData={data} />
          </div>
        </div>
        <div className="w-1/3 px-6 py-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-bold leading-tight tracking-tight">Summary</h1>
            <div>Order Type: { data[0].type }</div>
            <div>Order Date: { data[0].orderDate.split('T')[0] }</div>
            <div>Subtotal: { calculateTotal() }</div>
            <div>Status: { data[0].status }</div>
          </div>
        </div>
      </div>
    </div>
  );
};
