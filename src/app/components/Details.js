"use client";
import useSWR from "swr";
import { useState, useEffect } from "react";
import useCartStore from "../cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Trendinglayouts from "./trendinglayout";
import { client } from "../../../sanity/sanity-utils";
import { useParams } from "next/navigation";
import Slider from "react-slick";

import Link from "next/link";
const Details = () => {
  const session = useSession();

  const router = useRouter();
  const [pop, setPopUp] = useState("");
  const [sizes, setSizes] = useState("");
  const cart = useCartStore((state) => state.cart);
  const addToCart = useCartStore((state) => state.addToCart);

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, SetQuantity] = useState(1);

  const [product, setProducts] = useState({});
  const [isLoadings, setIsLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    async function fetchData() {
      const query = `*[_type == "product" && slug.current == "${slug}"][0]
                {
                  _id,
                   name,
                    description,
                    price,
                    soldout,
                    _createdAt,
                    "slug": slug.current,
                    "image":image.asset->url,
                    "image2":image2.asset->url,
                    "image3":image3.asset->url
                   
                  }
                `;
      const fetchedData = await client.fetch(query);
      setProducts(fetchedData);
      setIsLoading(false);
    }

    fetchData();
  }, [slug]);

  //NEW WAY TO FETCH DATA
  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data, mutate, error, isLoading } = useSWR(
    `/api/posts?username=${session?.data?.user.name}`,
    fetcher
  );

  //funtion pop up when cart are added
  function popup() {
    setPopUp("Item added in cart!");
    setTimeout(() => {
      setPopUp("");
    }, "3000");
  }

  //funtion pop up when sizes are not added added

  function sizespop() {
    setSizes("Please select a size");
    setTimeout(() => {
      setSizes("");
    }, "2000");
  }

  const onSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const onsubmit = async (e) => {
    e.preventDefault();

    if (!selectedSize) {
      sizespop();
      return;
    } else {
      popup();
    }

    addToCart({ product, quantity: quantity, size: selectedSize });
    console.log(cart);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: product.name,
          description: product.description,
          image: product.description,
          username: session.data.user.name,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to add post to database: ${response.statusText}`
        );
      }

      // Optionally, handle success, reset form, or perform other actions
      console.log("Post added successfully");
    } catch (err) {
      console.error("Error adding post to the database:", err);
    }
  };




//slider
const settings = {
  dots: true,
  autoplay: true,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,

 
}


  return (
    <div className=" py-4 md:py-6 relative">
      {pop && (
        <div className="cart-items p-2 right-5 w-[300px]  rounded-[6px] bottom-3 fixed bg-white text-black">
          <p className="text-[16px] pb-1">Item in cart</p>
          <Link href="/cart">
            <button className="border-black text-[12px] border-2 py-[4px] rounded-[15px] px-2">
              Visit Cart
            </button>
          </Link>
        </div>
      )}

      {sizes && (
        <div className="cart-items p-2 right-5 w-[300px]  rounded-[6px] bottom-3 fixed bg-white text-black">
          <p className="text-[16px] pb-2">Please select a size</p>
        </div>
      )}

      <div className="flex  flex-col space lg:gap-[30px] lg:flex-row  ">
        <h1 className=" leading-tight pb-2 md:hidden block uppercase text-[2rem] md:text-[4rem] ">
          {product?.name}
        </h1>
        <div className="lg:w-[47%] border-2 bg-white ">
          <Slider className=" " {...settings}>
            <div className="">
              {isLoadings ? (
                <img className="h-[100%] w-[100%] " src="/images/loader.gif" />
              ) : (
                <div className="  h-[100%] ">
                  {product?.image2 && product?.image2 ? (
                    <img
                      className="object-contain w-[100%] h-[400px] md:h-[600px]"
                      src={product?.image2}
                    />
                  ) : (
                    <p>No image available</p>
                  )}
                </div>
              )}
            </div>
            <div className="">
              {isLoadings ? (
                <img className="h-[100%] w-[100%] " src="/images/loader.gif" />
              ) : (
                <div className="  h-[100%] ">
                  {product?.image && product?.image ? (
                    <img
                      className="object-contain w-[100%] h-[400px] md:h-[600px]"
                      src={product?.image}
                    />
                  ) : (
                    <p>No image available</p>
                  )}
                </div>
              )}
            </div>
            {/* Conditionally render the third slide only if product.image3 exists */}
            {product?.image3 && product?.image3 && (
              <div className="">
                {isLoadings ? (
                  <img
                    className="h-[100%] w-[100%] "
                    src="/images/loader.gif"
                  />
                ) : (
                  <div className="  h-[100%] ">
                    {product?.image3 && product?.image3 ? (
                      <img
                        className="object-contain w-[100%] h-[400px] md:h-[600px]"
                        src={product?.image3}
                      />
                    ) : (
                      <p>No image available</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Slider>
        </div>

        <div className=" flex  justify-center flex-col gap-4 ">
          <h1 className="hidden md:block leading-tight uppercase text-[3rem] md:text-[3.9rem] ">
            {product?.name}
          </h1>
          <div className="flex   gap-4 flex-col ">
            <div className="flex gap-3 lg:w-[50%]">
              <button
                className={`sizes  ${
                  selectedSize === "2XL" ? "bg-white text-black" : ""
                }`}
                onClick={() => onSizeSelect("2XL")}
              >
                <p>2XL</p>
              </button>
              <button
                className={`sizes  ${
                  selectedSize === "XL" ? "bg-white text-black" : ""
                }`}
                onClick={() => onSizeSelect("XL")}
              >
                <p>XL</p>
              </button>
              <button
                className={`sizes ${
                  selectedSize === "L" ? "bg-white text-black" : ""
                }`}
                onClick={() => onSizeSelect("L")}
              >
                <p>L</p>
              </button>
              <button
                className={`sizes ${
                  selectedSize === "M" ? "bg-white text-black" : ""
                }`}
                onClick={() => onSizeSelect("M")}
              >
                <p> M</p>
              </button>
              <button
                className={`sizes  ${
                  selectedSize === "S" ? "bg-white text-black" : ""
                }`}
                onClick={() => onSizeSelect("S")}
              >
                <p>S</p>
              </button>
            </div>
            <div className=" order-first md:pt-0 pt-3 md:border-none  pb-3 md:pb-0 md:border-b-2 md:border-white ">
              <p>{product?.description}</p>
            </div>
          </div>

          <div className="flex md:flex-row flex-col gap-2 md:gap-4  bg-transparent justify-between">
            <div className="  border-b-2 border-white w-[100%] md:w-[45%]">
              <input
                className=" h-[100%] pb-3 md:pb-0 pt-2 md:pt-0 px-4 w-[100%] bg-transparent  text-white  "
                placeholder="select Quantity"
                id="input"
                value={quantity}
                onChange={(e) => {
                  SetQuantity(e.target.value);
                }}
                type="number"
              />
            </div>

            <div className="flex gap-4 pt-4"></div>
            <div className="text-darkwind text-center lg:w-[55%] bg-white uppercase">
              {product.soldout ? (
                <button className="bg-gray-400 cursor-not-allowed p-3">
                  SOLD OUT!
                </button>
              ) : (
                <button onClick={onsubmit} className="bg-green-500 p-3">
                  NGN{product && (product.price / 100).toLocaleString()} - ADD
                  TO CART
                </button>
              )}
            </div>
          </div>
          <Link href="/allproducts">
            <button className=" border-2 md:block hidden border-white p-3 w-[100%]">
              GO BACK TO SHOPPING
            </button>
          </Link>
        </div>
      </div>

      <div className=" py-[80px] space">
        <img
          className="w-[100%] h-[400px] md:h-[600px] object-cover"
          src="/images/mock14.jpg"
        />
      </div>

      <div className="flex models px-3 md:px-[70px] lg:gap-[80px] justify-between bg-white py-[80px] lg:flex-row flex-col">
        <div className="lg:w-[50%] ">
          <img
            className="md:h-[600px] h-[400px] object-cover w-[100%]"
            src="/images/wop.jpg"
          />
        </div>

        <div className="text-black md:text-start text-center  lg:w-[50%] justify-between flex-col flex">
          <div className="font-[ellams] md:py-0 py-3 italic">
            <p>Embrace Elegance, Elevate Your Style with Broken</p>
          </div>

          <div className="select pt-5 md:pt-0 ">
            <p className="md:text-end text-start font-semibold md:text-3xl text-[18px] py-2 md:py-6">
              CHECK OUT ALL NEW COLLECTIONS
            </p>

            <div className="border-black collections border-t-2">
              <p>CAP/SNAP BACKS</p>

              <Link href="/allproducts/caps">
                <img src="/icons/dark-arrow.png" alt="arrow" />
              </Link>
            </div>
            <div className="collections">
              <p>T-SHIRTS</p>

              <Link href="/allproducts/tshirts">
                <img src="/icons/dark-arrow.png" alt="arrow" />
              </Link>
            </div>
            <div className="collections">
              <p>SHORTS</p>

              <Link href="/allproducts/shortwear">
                <img src="/icons/dark-arrow.png" alt="arrow" />
              </Link>
            </div>
            <div className="collections">
              <p>HOODIES</p>

              <Link href="/allproducts/hoodies">
                <img src="/icons/dark-arrow.png" alt="arrow" />
              </Link>
            </div>
            <div className="collections">
              <p>ALL COLLECTIONS</p>

              <Link href="/allproducts">
                <img src="/icons/dark-arrow.png" alt="arrow" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="md:text-[6rem] space py-4 text-[3rem]">
        <p>YOU MAY</p>
        <p className="md:text-center ">ALSO LIKE</p>
      </div>
      <Trendinglayouts />
    </div>
  );
};

export default Details;
