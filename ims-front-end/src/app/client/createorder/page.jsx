"use client";
import React, {useEffect, useState} from "react";
import {useUserContext} from "@/app/AppContext";
import {useRouter, redirect} from "next/navigation";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from "@nextui-org/react";

export default function OrderForm() {
  const [error, setError] = useState("");
  const {user} = useUserContext();
  const router = useRouter();
  const [orderType, setOrderType] = useState("buy");
  const [dueDate, setDueDate] = useState("");
  const [formData, setFormData] = useState({
    itemId: "",
    locationId: "",
    quantity: ""
  });

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

  useEffect(() => {
    const fetchData = async () => {
      const newItems = await fetchItems();
      setItems([...newItems]);
      setItemsDisplay([...newItems]);
      const newLocations = await fetchLocations(newItems);
      setLocations([...newLocations]);
      setLocationsDisplay([...newLocations]);
    };

    fetchData();
  }, []);

  const closeModal = () => {
    setError("");
  };

  const handleInputChange = (event) => {
    const {id, value} = event.target;
    setFormData({...formData, [id]: value});
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setOrderType(type);
    if (type === "buy") {
      setDueDate("");
    }
  };

  const handleItemSelect = (key) => {
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

    if (selectedItem === -1) {
      alert("Please select an item for the order");
      return;
    }

    if (selectedLocation === -1) {
      alert("Please select a location for the order");
      return;
    }

    const orderDate = new Date().toISOString().slice(0, 19);

    const orderData = {
      clientId: user.clientId,
      type: orderType,
      orderDate: orderDate,
      orderStatus: "In progress",
      itemId: formData.itemId,
      quantity: formData.quantity,
      dueDate: dueDate,
      locationId: formData.locationId
    };

    try {
      const response = await fetch("http://localhost:8001/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + user.token
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create order");
      }
      alert("Order created successfully");
      router.push("/client");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Error creating order");
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
              Create New Order
            </h2>

            <form className="px-8 pt-6 pb-8 mb-4 bg-white rounded" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="itemID">
                  Item Name
                </label>
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
                  Location Name
                </label>
                {/*<input*/}
                {/*  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"*/}
                {/*  id="locationId" type="text" placeholder="Location ID"*/}
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
                  id="quantity" type="text" placeholder="Quantity" onChange={handleInputChange}/>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="type">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="type" value={orderType} onChange={handleTypeChange}>
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700" htmlFor="dueDate">
                  Due Date
                </label>
                <input
                  className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                  id="dueDate" type="date" placeholder="yyyy-mm-dd" value={dueDate}
                  onChange={e => setDueDate(e.target.value)} disabled={orderType === "buy"}/>
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
