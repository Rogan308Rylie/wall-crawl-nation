export type DeliveryAddress = {
  isNitkkr?: boolean;
  fullName: string;
  phone: string;
  email: string;

  hostelNumber?: string;
  roomNumber?: string;
  block?: string;

  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;

  gender: "male" | "female" | "other";

  additionalNotes?: string;
};



export type OrderItem =
  | {
    type: "poster"
    id: string
    title: string
    price: number
    quantity: number
  }
  | {
    type: "collection"
    id: string
    title: string
    price: number
    quantity: number
    posterIds: string[]
  }
  | {
    type: "custom"
    id: string
    title: string
    price: number
    quantity: number
    images: string[]
  }

export type Order = {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  cartTotal?: number;
  deliveryFee?: number;

  deliveryAddress: DeliveryAddress;

  status: "pending" | "paid" | "cancelled";
  createdAt: number;
};

