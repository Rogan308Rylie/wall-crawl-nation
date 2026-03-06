export type DeliveryAddress = {
  fullName: string;
  phone: string;
  email: string;

  hostelNumber: string;
  roomNumber: string;
  block: string;

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

export type Order = {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;

  deliveryAddress: DeliveryAddress;

  status: "pending" | "paid" | "cancelled";
  createdAt: number;
};

