"use client";

import {OrdersTable} from "./components/OrderTable";
import {useUserContext} from "../AppContext";
import {redirect} from "next/navigation";
import {ItemTable} from "@/app/client/components/ItemTable";
import Link from "next/link";


export default function Client() {
  const {user} = useUserContext();

  if (Object.keys(user).length === 0) {
    console.log(`HEHREHRHEHREHRHERE User is ${Object.keys(user).length === 0}`);
    redirect("/login");
  }

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div
        className="flex flex-row items-center justify-center w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="w-3/5 px-6 py-8 flex flex-col gap-4">
          <div className="flex flex-row gap-8">
            <p id="client-id">Client ID: {user.clientId}</p>
            <p id="client-type">Client Type: {user.clientType}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mt-4">
            <div className="mt-4">Order List</div>
            <div
                className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1 text-center">
              <Link href="client/createorder">New Order</Link>
            </div>
          </div>
            <OrdersTable/>
            <div className="flex justify-between items-center mt-4">
              <div>Inventory List</div>
              <div
                className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1 text-center">
                <Link href="../item/new">New Inventory Item</Link>
              </div>

            </div>
            <ItemTable/>
          </div>
        </div>

        {/* <div className="w-2/5 px-6 flex flex-col gap-4">
          <div>
            <label htmlFor="order-id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Retrieve Order By Order ID</label>
            <input type="text" name="order-id" id="order-id" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="" />
          </div>
          <div>
            <label htmlFor="item-id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Retrieve Order By Item ID</label>
            <input type="text" name="item-id" id="item-id" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="" required="" />
          </div>
        </div> */}
      </div>
    </div>
  )
    ;
};
