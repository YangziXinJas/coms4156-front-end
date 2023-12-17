"use client";

import React, {useState, useEffect} from "react";
import {useUserContext} from "@/app/AppContext";
import {useRouter, redirect} from "next/navigation";
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";

export default function OrderForm({params}) {
  const [error, setError] = useState("");
  const {user} = useUserContext();
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formData, setFormData] = useState({
    itemId: "",
    locationId: "",
    quantity: ""
  });
  const [orderData, setOrderData] = useState({});

  const [items, setItems] = useState([]);
  const [itemLocations, setItemLocations] = useState([]);
  const [locations, setLocations] = useState([]);

  const [itemsDisplay, setItemsDisplay] = useState([]);
  const [locationsDisplay, setLocationsDisplay] = useState([]);

  const [selectedItem, setSelectedItem] = useState(-1);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(-1);
  const [selectedLocationName, setSelectedLocationName] = useState("");

  if (Object.keys(user).length === 0) {
    redirect("/login");
  }

  const fetchItems = async () => {
    // Get the item list
    try {
      const response = await fetch(`http://localhost:8001/item/getByClientId/${user.clientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
      });

      if (!response.ok) {
        alert(`HTTP error when getting item list, status: ${response.status}`);
        return [];
      }
      return response.json();
    } catch (error) {
      alert(`Getting item list failed: ${error}`);
      return [];
    }
  };

  const fetchLocations = async (newItems) => {
    // Iterate through this list and put the locationIds in a set
    // Get the location objects and store them in the array (CHANGE "New location" to an object
    // as well with just the "name" being New location)
    try {
      // For each itemId, get a list of item locations (/itemLocation/getByItemId/{itemId})
      const allItemLocations = [];
      for (const item of newItems) {
        if (item.itemId === -1) continue; // to skip the "New Item" entry
        const response = await fetch(`http://localhost:8001/itemLocation/getByItemId/${item.itemId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
        });

        if (!response.ok) {
          console.error(`HTTP error when getting item location list for ${item.itemId}, status: ${response.status}`);
          continue;
        }
        const itemLocations = await response.json();
        allItemLocations.push(...itemLocations);
      }

      // Deduplicate location Ids (note: at this point, we have a list of ItemLocations, NOT
      // Locations)
      setItemLocations([...allItemLocations]);
      const locationIds = allItemLocations.map(loc => loc.locationId);
      const uniqueLocationIds = Array.from(new Set(locationIds));

      // For each locationId, get the Location information. If any error, just skip it.
      const fetchLocation = async (id) => {
        try {
          const response = await fetch(`http://localhost:8001/location/get/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + user.token
            },
          });

          if (!response.ok) {
            console.error(`HTTP error when getting location detail for ${id}, status: ${response.status}`);
            return null;
          }

          return response.json();
        } catch (error) {
          console.error(`Failed to fetch location ${id}:`, error);
          return null;
        }
      };

      const locationPromises = uniqueLocationIds.map(fetchLocation);
      const locations = await Promise.all(locationPromises);
      return locations.filter(location => location !== null);
    } catch (error) {
      alert(`Getting location list failed: ${error}`);
      return [];
    }
  };

  const fetchOrderData = async (newItems, newLocations) => {
    try {
      const response = await fetch(`http://localhost:8001/order/retrieve/order/${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
      });
      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setOrderData(data[0]);
      setOrderStatus(data[0].orderStatus);
      const dueDateFormat = new Date(data[0].dueDate).toISOString().split("T")[0];
      setDueDate(dueDateFormat);
      setFormData({
        itemId: data[0].itemId.toString(),
        locationId: data[0].locationId.toString(),
        quantity: data[0].quantity.toString()
      });
      // Note: selected item and selected location remain -1, so we can tell if the user
      // selected anything in the first place
      const targetItem = newItems.find(item => item.itemId === data[0].itemId);
      if (!targetItem) {
        alert("Cannot find item during initialization");
        return;
      } else {
        setSelectedItemName(targetItem.name);
      }
      const targetLocation = newLocations.find(loc => loc.locationId === data[0].locationId);
      if (!targetLocation) {
        alert("Cannot find location during initialization");
      } else {
        setSelectedLocationName(targetLocation.name);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      setError(error.message || "Error fetching order data");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const newItems = await fetchItems();
      setItems([...newItems]);
      setItemsDisplay([...newItems]);
      const newLocations = await fetchLocations(newItems);
      setLocations([...newLocations]);
      setLocationsDisplay([...newLocations]);
      fetchOrderData(newItems, newLocations);
    };

    fetchData();
  }, [params.id]);

  const orderId = params.id;
  const closeModal = () => {
    setError("");
  };

  const handleInputChange = (event) => {
    const {id, value} = event.target;
    setFormData({...formData, [id]: value});
  };

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setOrderStatus(status);
  };

  const handleItemSelect = (key) => {
    if (selectedItem === -1 && selectedLocation === -1) {
      // if item was changed from default, clear out location selection as it may not be
      // available anymore
      setSelectedLocation(-1);
      setSelectedLocationName("");
      setFormData({...formData, locationId: "-1"});
    }

    // Key is a string!! convert it to number
    const keyNum = parseInt(key, 10);
    setSelectedItem(keyNum);
    setFormData({...formData, itemId: key});
    const targetItem = items.find(item => item.itemId === keyNum);
    if (!targetItem) {
      alert(`Cannot find selected item in state.`);
      return;
    }
    setSelectedItemName(targetItem.name);

    // Updates location list to those that have the item
    const filteredItemLocs = itemLocations.filter(itemLoc => itemLoc.itemId === keyNum);
    const newLocArr = filteredItemLocs.map(itemLoc => {
      return locations.find(loc => loc.locationId === itemLoc.locationId);
    }).filter(location => location !== undefined);

    setLocationsDisplay([...newLocArr]);
  };

  const handleLocationSelect = (key) => {
    if (selectedItem === -1 && selectedLocation === -1) {
      // if location was changed from default, clear out item selection as it may not be
      // available anymore
      setSelectedItem(-1);
      setSelectedItemName("");
      setFormData({...formData, itemId: "-1"});
    }

    // Key is a string!! convert it to number
    const keyNum = parseInt(key, 10);
    setSelectedLocation(keyNum);
    setFormData({...formData, locationId: key});
    const targetLocation = locations.find(loc => loc.locationId === keyNum);
    if (!targetLocation) {
      alert(`Cannot find selected location in state.`);
      return;
    }
    setSelectedLocationName(targetLocation.name);

    // Updates location list to those that have the item
    const filteredItemLocs = itemLocations.filter(itemLoc => itemLoc.locationId === keyNum);
    const newItemArr = filteredItemLocs.map(itemLoc => {
      return items.find(item => item.itemId === itemLoc.itemId);
    }).filter(location => location !== undefined);

    setItemsDisplay([...newItemArr]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.itemId === -1) {
      alert("Please select an item for the order");
      return;
    }

    if (formData.locationId === -1) {
      alert("Please select a location for the order");
      return;
    }

    const orderUpdateData = {
      orderId: orderId,
      orderStatus: orderStatus
    };

    if (orderStatus !== "") {
      orderUpdateData.orderStatus = orderStatus;
    }

    const orderDetailUpdateData = {
      orderId: orderId,
      itemId: formData.itemId,
      quantity: formData.quantity,
      locationId: formData.locationId,
      dueDate: dueDate
    };

    try {
      await fetch("http://localhost:8001/order/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
        body: JSON.stringify(orderUpdateData)
      });

      await fetch("http://localhost:8001/order/detail/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
        body: JSON.stringify(orderDetailUpdateData)
      });

      alert("Order updated successfully");
      router.push("/client");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error updating order");
    }
  };

  return (
    <div className="pt-12 pb-12">
      <div
        className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div
          className="flex flex-row items-center justify-center w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-full xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="w-3/5 px-6 py-8 flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
              Update Order
            </h2>

            <form className="px-8 pt-6 pb-8 mb-4 bg-white rounded" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="itemID">
                  Item ID
                </label>
                {/*<input*/}
                {/*  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"*/}
                {/*  id="itemId" type="text" value={formData.itemId} onChange={handleInputChange}/>*/}
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">{selectedItemName || "Select Item"}</Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Items"
                    onAction={handleItemSelect}
                  >
                    {itemsDisplay.map((item) => (
                      <DropdownItem key={item.itemId}>{item.name}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="locationID">
                  Location ID
                </label>
                {/*<input*/}
                {/*  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"*/}
                {/*  id="locationId" type="text" value={formData.locationId}*/}
                {/*  onChange={handleInputChange}/>*/}
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">{selectedLocationName || "Select Location"}</Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Locations"
                    onAction={handleLocationSelect}
                  >
                    {locationsDisplay.map((location) => (
                      <DropdownItem key={location.locationId}>{location.name}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="quantity" type="text" value={formData.quantity} onChange={handleInputChange}/>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="orderStatus">
                  Order Status
                </label>
                <select
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="orderStatus" value={orderStatus} onChange={handleStatusChange}>
                  <option value="">Select Status</option>
                  <option value="In progress">In progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="dueDate">
                  Due Date
                </label>
                <input
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="dueDate" type="date" value={dueDate}
                  onChange={e => setDueDate(e.target.value)}/>
              </div>
              <div className="flex justify-center mt-4">
                <button type="submit"
                        className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline">
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
