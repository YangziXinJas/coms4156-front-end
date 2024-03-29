"use client";

import {useEffect, useState} from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Textarea
} from "@nextui-org/react";
import {useUserContext} from "../../AppContext";
import {redirect, useRouter} from "next/navigation";

export default function NewInventoryEntry() {
  const router = useRouter();
  const {user} = useUserContext();
  const [items, setItems] = useState([]);
  // selected item identified by itemId
  const [selectedItem, setSelectedItem] = useState(-1);
  const [selectedItemName, setSelectedItemName] = useState("");

  // Item form values
  const [itemName, setItemName] = useState("");
  const [itemStockLevel, setItemStockLevel] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");

  const [itemLocations, setItemLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locFieldsDisabled, setLocFieldsDisabled] = useState(false);

  // selected location identified by locationId
  const [selectedLocation, setSelectedLocation] = useState(-1);
  const [selectedLocationName, setSelectedLocationName] = useState("");

  // Location form values
  const [locationName, setLocationName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [zipcode, setZipcode] = useState("");

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
      setItems([{name: "New Item", itemId: -1}, ...newItems]);
      const newLocations = await fetchLocations(newItems);
      setLocations([{name: "New Location", locationId: -1}, ...newLocations]);
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const tmpItPrice = parseFloat(itemPrice);
    if (isNaN(tmpItPrice)) {
      alert("Item price must be a number");
      return;
    }
    const tmpStockLevel = parseInt(itemStockLevel, 10);
    if (isNaN(tmpStockLevel)) {
      alert("Stock level must be an integer");
      return;
    }
    const tmpZip = parseInt(zipcode, 10);
    if (isNaN(tmpZip)) {
      alert("Please enter a 5-digit zipcode");
      return;
    }

    const itemData = {
      clientId: user.clientId,
      name: itemName,
      description: itemDescription,
      price: tmpItPrice
    };

    let curItemId = selectedItem;
    if (selectedItem === -1) {
      // New item, need to create one
      try {
        const response = await fetch("http://localhost:8001/item/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
          body: JSON.stringify(itemData)
        });

        if (!response.ok) {
          alert(`HTTP error when adding item, status: ${response.status}`);
          return;
        }

        const bd = await response.text();
        curItemId = parseInt(bd, 10);
      } catch (error) {
        console.error("Adding item failed: ", error);
        return;
      }
    } else {
      // Existing item, update its name, price, description
      itemData.itemId = selectedItem;
      delete itemData.clientId;
      try {
        const response = await fetch("http://localhost:8001/item/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
          body: JSON.stringify(itemData)
        });

        if (!response.ok) {
          alert(`HTTP error when updating item, status: ${response.status}`);
          return;
        }
      } catch (error) {
        console.error("Updating item failed: ", error);
        return;
      }
    }

    const locationData = {
      name: locationName,
      address1: addressLine1,
      address2: addressLine2,
      clientId: user.clientId,
      zipCode: zipcode
    };

    let curLocationId = selectedLocation;
    if (selectedLocation === -1) {
      // New Location, need to create one
      try {
        const response = await fetch("http://localhost:8001/location/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
          body: JSON.stringify(locationData)
        });

        if (!response.ok) {
          alert(`HTTP error when adding location, status: ${response.status}`);
          return;
        }

        const bd = await response.text();
        curLocationId = parseInt(bd, 10);
      } catch (error) {
        console.error("Adding location failed: ", error);
        return;
      }
    }

    // Then check:
    const itemLocationData = {
      itemId: curItemId,
      locationId: curLocationId,
      quantityAtLocation: tmpStockLevel
    };
    if (selectedItem !== -1 && selectedLocation !== -1 &&
      itemLocations.find(iL => (iL.itemId === curItemId && iL.locationId === curLocationId))) {
      // If item is not new, location is not new, and there is an existing item location, update item
      // location's stock
      try {
        const response = await fetch("http://localhost:8001/itemLocation/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
          body: JSON.stringify(itemLocationData)
        });

        if (!response.ok) {
          alert(`HTTP error when updating itemLocation, status: ${response.status}`);
          return;
        }
      } catch (error) {
        console.error("Updating itemLocation failed: ", error);
        return;
      }
    } else {
      // add a new item location
      try {
        const response = await fetch("http://localhost:8001/itemLocation/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + user.token
          },
          body: JSON.stringify(itemLocationData)
        });

        if (!response.ok) {
          alert(`HTTP error when adding itemLocation, status: ${response.status}`);
          return;
        }
      } catch (error) {
        console.error("Adding itemLocation failed: ", error);
        return;
      }
    }
    router.push("/client");
  };

  const handleCancel = () => {
    router.push("/client");
  };

  const handleItemSelect = (key) => {
    // Key is a string!! convert it to number
    const keyNum = parseInt(key, 10);
    setSelectedItem(keyNum);
    const targetItem = items.find(item => item.itemId === keyNum);
    if (!targetItem) {
      alert(`Cannot find selected item in state.`);
      return;
    }
    setSelectedItemName(targetItem.name);
    // Handle new item
    if (keyNum === -1) {
      setItemName("");
      setItemStockLevel("");
      setItemPrice("");
      setItemDescription("");
    } else {
      // Handle existing item
      setItemName(targetItem.name);

      // Try to find if an itemLocation already exists
      const targetItemLocation = itemLocations.find(iL => (iL.itemId === keyNum && iL.locationId === selectedLocation));
      if (!targetItemLocation) {
        setItemStockLevel("");
      } else {
        setItemStockLevel(targetItemLocation.quantityAtLocation);
      }
      setItemPrice(targetItem.price);
      setItemDescription(targetItem.description);
    }
  };

  const handleLocationSelect = (key) => {
    const keyNum = parseInt(key, 10);

    setSelectedLocation(keyNum);
    const targetLocation = locations.find(location => location.locationId === keyNum);
    if (!targetLocation) {
      alert(`Cannot find selected location in state.`);
      return;
    }
    setSelectedLocationName(targetLocation.name);

    if (keyNum === -1) {
      setLocationName("");
      setAddressLine1("");
      setAddressLine2("");
      setZipcode("");
      setLocFieldsDisabled(false);
    } else {
      const targetItemLocation = itemLocations.find(iL => (iL.itemId === selectedItem && iL.locationId === keyNum));
      if (targetItemLocation) {
        setItemStockLevel(targetItemLocation.quantityAtLocation + "");
      } else {
        setItemStockLevel("");
      }
      setLocationName(targetLocation.name);
      setAddressLine1(targetLocation.address1);
      setAddressLine2(targetLocation.address2);
      setZipcode(targetLocation.zipCode);
      setLocFieldsDisabled(true);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow dark:bg-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="text-lg font-semibold">New Inventory Entry</h1>
          <p>Client ID: {user.clientId}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">{selectedItemName || "Select Item"}</Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Items"
                  onAction={handleItemSelect}
                >
                  {items.map((item) => (
                    <DropdownItem key={item.itemId}>{item.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <div className="mt-2"><Input
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              /></div>
              <div className="mt-2"><Input
                fullWidth
                label="Item Stock Level"
                type="number"
                value={itemStockLevel}
                onChange={(e) => setItemStockLevel(e.target.value)}
              /></div>
              <div className="mt-2"><Input
                fullWidth
                label="Item Price"
                type="number"
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              /></div>
              <div className="mt-2"><Textarea
                fullWidth
                label="Item Description"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              /></div>
            </div>
            <div>
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">{selectedLocationName || "Select Location"}</Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Locations"
                  onAction={handleLocationSelect}
                >
                  {locations.map((location) => (
                    <DropdownItem key={location.locationId}>{location.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Location Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  disabled={locFieldsDisabled}
                />
              </div>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  disabled={locFieldsDisabled}
                />
              </div>
              <div className="mb-2">
                <Input
                  fullWidth
                  label="Address Line 2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  disabled={locFieldsDisabled}
                />
              </div>
              <Input
                fullWidth
                label="Zipcode"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                disabled={locFieldsDisabled}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button auto flat color="error" onClick={handleCancel}>
              Cancel
            </Button>
            <Button auto type="submit">
              Add
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
