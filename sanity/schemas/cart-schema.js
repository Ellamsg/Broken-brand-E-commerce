// cart-schema.js
// Each document = one cart item belonging to one user.
// Keyed by userEmail + productId + size so we can upsert without duplicates.

const cart = {
  name: "cart",
  title: "Cart Items",
  type: "document",
  fields: [
    {
      name: "userEmail",
      title: "User Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "productId",
      title: "Product ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "name",
      title: "Product Name",
      type: "string",
    },
    {
      name: "price",
      title: "Price",
      type: "number",
    },
    {
      name: "image2",
      title: "Image URL",
      type: "url",
    },
    {
      name: "slug",
      title: "Slug",
      type: "string",
    },
    {
      name: "size",
      title: "Size",
      type: "string",
    },
    {
      name: "quantity",
      title: "Quantity",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "userEmail",
    },
  },
};

export default cart;
