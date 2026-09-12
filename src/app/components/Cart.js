"use client";
import React, { useEffect } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useCartStore from "../cartStore";
import Link from "next/link";

const Cart = () => {
  const router = useRouter();
  const session = useSession();
  const cart = useCartStore((state) => state.cart);
  const cartTotal = useCartStore((state) => state.cartTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const loadCart = useCartStore((state) => state.loadCart);
  const isLoaded = useCartStore((state) => state.isLoaded);

  // Load cart from Sanity once the user session is confirmed
  useEffect(() => {
    if (session.status === "authenticated" && !isLoaded) {
      loadCart();
    }
  }, [session.status, isLoaded, loadCart]);

  if (!session) return <div>not logged in</div>;

  if (session.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-gray">Loading...</p>
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    router?.push("/cart/login");
    return null;
  }

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };

  if (session.status === "authenticated") {

    if (!isLoaded) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-widest text-gray">Loading your cart...</p>
        </div>
      );
    }

    return (
      <div className="space py-6">
        <p className="text-[16px]  underline">CART</p>
        <div className="flex py-3 md:text-[16px] text-[9px] justify-between border-white border-b-2 ">
          <p>PRODUCT</p>
          
          <p>PRICE</p>
        </div>

        {cart.length === 0 ? (
          <p className="uppercase py-4">You have no items in your cart!</p>
        ) : (
          cart.map((product) => (
            <div
              className="flex justify-between border-white border-b-2 py-4"
              key={product.id}
            >
              <Link href={`/details/${product.slug}`} className="md:w-[33.3%] flex gap-1 md:gap-5 cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  src={product.image2}
                  className=" size-[90px]  md:size-[200px]"
                  alt="cart-img"
                />
                <div className="uppercase flex flex-col justify-between">
                  <p className="md:text-[16px] text-[10px]">{product.name}</p>{" "}
                  <p className="md:text-[16px] text-[13px]">
                  QTY:{product.quantity}
                </p>
                  <p className="md:text-[16px] text-[13px]">SIZE:{product.size}</p>{" "}
                </div>
              </Link>

          

              <div className="flex   text-end w-[33.3%] flex-col justify-between ">
                <div className="md:text-[16px] text-[13px] items-end justify-items-end flex justify-end ">
                  <p>NGN{product && (product.price / 100).toLocaleString()}</p>
                </div>

                <button
                  className=" "
                  onClick={() => {
                    handleRemoveFromCart(product?._id);
                  }}
                >
                  <p className="text-end underline text-[13px] md:text-[16px] font-light">
                    REMOVE
                  </p>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Only show totals and checkout button when cart has items */}
        {cart.length > 0 && (
          <div className="flex lg:justify-end">
            <div className="lg:w-[50%] w-[100%]">
              <div className="flex py-3 md:text-[16px] text-[13px] border-b-2 border-white justify-between">
                <p className="uppercase md:text-[16px] text-[13px]">SubTotal</p>
                <p>NGN{cartTotal && (cartTotal / 100).toLocaleString()} </p>
              </div>

              <div className=" py-3 flex md:text-[1.5rem] text-[13px] justify-between">
                <p className="uppercase  md:text-[16px] text-[13px]">Total</p>
                <p>NGN{cartTotal && (cartTotal / 100).toLocaleString()} </p>
              </div>

              <Link href="/payments">
                <div className="bg-white text-center text-black py-3 w-[100%]">
                  <p> NGN{cartTotal && (cartTotal / 100).toLocaleString()} GO TO CHECKOUT</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default Cart;
