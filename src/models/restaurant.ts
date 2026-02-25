
export interface MenuItem {
  id: string;
  name: string;
  nameLower: string;
  price: number;
  imageUrl: string;
}

export interface Restaurant {
  restaurantId: string;
  firebaseId: string;
  userId: string;

  restaurantName: string;
  restaurantNameLower: string;

   address: {
    text: string;
    lat: number;
    lng: number;
  };

  city: string;
  cityLower: string;
  country: string;

  deliveryTimeMinutes: number;
  deliveryPrice: number;


  cuisines: string[];
  cuisinesLower: string[];

  menuItem: MenuItem[];

  imageUrl: string;
  lastUpdated: FirebaseFirestore.Timestamp;
}

