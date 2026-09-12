"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useCartStore from "../cartStore";
import Link from "next/link";
import { PaystackButton } from "react-paystack";
// NOTE: createOrder is no longer called from the browser.
// Order creation now happens server-side after verifying the payment.

const Orderpayments = () => {
  const router = useRouter();

  const session = useSession();
 
  const cart = useCartStore((state) => state.cart);
  const cartTotal = useCartStore((state) => state.cartTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY;
  const amount = cartTotal.toFixed(0); // Remember, set in kobo!
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Called after Paystack popup closes with a successful reference.
  // We do NOT trust the browser — instead we send the reference to our
  // Next.js API route which verifies with Paystack servers before saving.
  const onPaymentSuccess = async (response) => {
    const reference = response.reference;
    const userEmail = session?.data?.user?.email;

    if (!reference || !userEmail) {
      alert("Something went wrong. Please contact support with your payment reference: " + reference);
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          email: userEmail,
          cart,
        }),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        alert("Thanks for doing business with us! Come back soon!!");
        router?.push("/order");
      } else {
        // Payment failed verification — no order created
        alert(
          `Payment could not be verified. No order was placed. ` +
          `Please contact support with this reference: ${reference}`
        );
      }
    } catch (error) {
      console.error("Verification request failed:", error);
      alert(
        `Network error during verification. Please contact support with this reference: ${reference}`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const componentProps = {
    email,
    amount,
    metadata: {
      custom_fields: [
        {
          display_name: "Cart Items",
          variable_name: "cart_items",
          value: cart
            .map((product) => `${product.quantity} ${product.name} size:  ${product.size}, `)
            .join(", "),
        },
        {
          display_name: "Name",
          variable_name: "name",//login
          value: name, // Assuming 'address' is a variable representing the user's address
        },
     

        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: phone, // Assuming 'phone' is a variable representing the user's phone number
        },
        {
          display_name: "Address",
          variable_name: "address",
          value: address, // Assuming 'phone' is a variable representing the user's phone number
        },
        {
          display_name: "City",
          variable_name: "city",
          value: city, // Assuming 'phone' is a variable representing the user's phone number
        },
        // Add any other custom fields as needed
      ],
      // Add any other key/value pairs as needed
    },
    publicKey,
    text: "PAY NOW",
    onSuccess: (response) => {
      console.log("Paystack reference received:", response.reference);
      onPaymentSuccess(response);
    },
    onClose: () => {
      if (!isVerifying) {
        alert("Payment cancelled. Your cart is still saved.");
      }
    },
  };

  if (!session) return <div>not logged in</div>;

  if (session.status === "loading") {
    return <p>loading...</p>;
  }

  if (session.status === "unauthenticated") {
    router?.push("/cart/login");
  }



  // Function to save cart data to local storage

  if (session.status === "authenticated") {
    return (
      <div className="space py-4">
        <div className=" flex flex-col gap-6 md:flex-row">
          <div className=" md:w-[50%] ">
            <div className="border-b-2 border-white ">
              <p className="text-[16px] uppercase ">INFORMATION</p>
            </div>

            <div className="pt-5  ">
              <form className="flex md:w-auto w-[100%]   flex-col gap-3">
                <p>CUSTOMER DETAILS</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="order-info"
                    placeholder="name"
                  />
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="order-info"
                    placeholder="email"
                  />
                </div>

                <p>DELIVERY ADDRESS</p>
                <div className="flex lg:flex-row  flex-col gap-4">
                  <input
                    className="order-info w-full"
                    placeholder="address"
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <input
                    className="order-info w-full"
                    placeholder="city"
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 flex-col">
                  <input
                    className="order-info"
                    placeholder="phone number"
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </form>

              <div className="flex md:flex-row pt-4 flex-col justify-between">
                {isVerifying ? (
                  <p className="text-white mt-3 p-3 opacity-70 animate-pulse">
                    ⏳ Verifying payment, please wait...
                  </p>
                ) : (
                  <PaystackButton
                    className="text-black mt-3 bg-white p-3 "
                    {...componentProps}
                  />
                )}
              <Link className="md:order-first" href="/cart">
              <button
                disabled={isVerifying}
                className="text-white mt-3 border-2 border-white p-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                  GO BACK{" "}
                </button>
              </Link>
               
              </div>
            </div>
          </div>
          <div className=" md:w-[50%] ">
            <div className="border-b-2 border-white">
              <p>ORDER SUMMARY</p>
            </div>
            {cart.map((product) => (
              <div className="flex  justify-between  py-4" key={product.id}>
                <div className="  flex  gap-1 md:gap-5">
                  <div className=" ">
                  <img
                    src={product.image2}
                    className="  bg-red md:size-[130px] size-[90px]  "
                    alt="cart-img"
                  />
                    </div>
                 
                  <div className="uppercase flex flex-col justify-between">
                    <p className="md:text-[16px] text-[10px]">{product.name}</p>
                    <p className="text-[13px]">QTY:{product.quantity}</p>
                    <p className="text-[13px]">SIZE:{product.size}</p>{" "}
                  </div>
                </div>

                <div className="flex   text-end w-[33.3%] flex-col justify-between ">
                  <div className="md:text-[1.0rem] text-[13px] items-end justify-items-end flex justify-end ">
                    <p>NGN{product && (product.price / 100).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}

            <div>
              <div className="flex lg:justify-end">
                <div className=" w-[100%]">
                  <div className="flex py-3 md:text-[1.2rem] text-[13px] border-b-2 border-white justify-between">
                    <p className="uppercase  ">
                      SubTotal
                    </p>
                    <p>NGN{cartTotal && (cartTotal / 100).toLocaleString()}</p>
                  </div>

                  <div className=" py-3 flex md:text-[1.2rem] text-[13px] justify-between">
                    <p className="uppercase  md:text-[16px] text-[13px]">
                      Total
                    </p>
                    <p>NGN{cartTotal && (cartTotal / 100).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Orderpayments;
