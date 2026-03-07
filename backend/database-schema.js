// backend/database-schema.js
// Documentation-only reference for the intended Firestore structure.
// (Not required by Firebase at runtime.)

export const DATABASE_SCHEMA = {
  users: {
    fields: [
      'uid',
      'fullName',
      'email',
      'phone',
      'role',
      'address',
      'createdAt',
      'updatedAt',
    ],
    subcollections: {
      cart: {
        path: 'users/{uid}/cart/{productId}',
        fields: [
          'productId',
          'name',
          'price',
          'image',
          'quantity',
          'createdAt',
          'updatedAt',
        ],
      },
    },
  },

  products: {
    path: 'products/{productId}',
    fields: [
      'name',
      'description',
      'price',
      'stock',
      'categoryId',
      'images',
      'isActive',
      'sku',
      'createdAt',
      'updatedAt',
      'specifications',
    ],
  },

  categories: {
    path: 'categories/{categoryId}',
    fields: ['name', 'description', 'createdAt'],
  },

  orders: {
    path: 'orders/{orderId}',
    fields: [
      'orderId',
      'userId',
      'customerInfo',
      'items',
      'subtotal',
      'shippingFee',
      'totalAmount',
      'paymentMethod',
      'paymentStatus',
      'orderStatus',
      'transactionId',
      'createdAt',
      'updatedAt',
      'paidAt',
    ],
  },

  transactions: {
    path: 'transactions/{transactionId}',
    fields: [
      'orderId',
      'userId',
      'paymentMethod',
      'providerReference',
      'amount',
      'status',
      'rawCallbackData',
      'createdAt',
    ],
  },

  settings: {
    path: 'settings/global',
    fields: [
      'shippingFee',
      'currency',
      'mpesaEnabled',
      'paypalEnabled',
      'cardEnabled',
      'whatsappNumber',
      'updatedAt',
    ],
  },
};

export default DATABASE_SCHEMA;

