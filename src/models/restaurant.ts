// MenuItem Interface
interface MenuItem {
  id: string;
  name: string;
  price: number;
}

// Restaurant Interface (with imageUrl)
export interface Restaurant {
  restaurantId: string;
  firebaseId: string; // creator ID
  User: string; // Firebase UID or reference to User
  restaurantName: string;
  restaurantNameLower: string; // <-- add this
  city: string;
  cityLower: string; // <-- add this
  country: string;
  deliveryPrice: number;
  estimatedDeliveryTime: number;
  cuisines: string[];
  menuItem: MenuItem[];
  imageUrl: string;
  lastUpdated: FirebaseFirestore.Timestamp;
}


export {MenuItem ,}