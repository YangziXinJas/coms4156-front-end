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

  const [needNewItemLocation, setNeedItemLocation] = useState(false);
  const [itemLocations, setItemLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locFieldsDisabled, setLocFieldsDisabled] = useState(false);

  // selected location identified by locationId
  const [selectedLocation, setSelectedLocation] = useState(-1);
  const [selectedLocationName, setSelectedLocationName] = useState("");

  // Location form values
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
      setItems(items => [{name: "New Item", itemId: -1}, ...newItems]);
      const newLocations = await fetchLocations(newItems);
      setLocations(locations => [{name: "New Location", locationId: -1}, ...newLocations]);
    };

    fetchData();

    // TODO: summary:
    //  - new item, new location -> create item, create location, create ItemLocation
    //  - new item, existing location -> create item, create ItemLocation
    //  - existing item, new location -> potentially update the item, create location, create
    //  ItemLocation
    //  - existing item, existing location -> update ItemLocation
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // TODO: Keep in mind the new item and new location have IDs of -1!! DO NOT INCLUDE THIS IN
    //  THE UPDATE/NEW ENTRY -> create an itemData locationData construct like below.

    const itemData = {
      clientId: user.clientId,
      name: itemName,
      currentStockLevel: parseInt(itemStockLevel, 10),
      description: itemDescription,
      price: parseFloat(itemPrice)
    };

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
    } catch (error) {
      console.error("Adding item failed: ", error);
      return;
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
      const targetItemLocation = itemLocations.find(iL => (iL.itemID === keyNum && iL.locationId === selectedLocation));
      if (!targetItemLocation) {
        setItemStockLevel("");
        setNeedItemLocation(true);
      } else {
        setItemStockLevel(targetItemLocation.quantityAtLocation);
        setNeedItemLocation(false);
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
      setAddressLine1("");
      setAddressLine2("");
      setZipcode("");
      setLocFieldsDisabled(false);
    } else {
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
