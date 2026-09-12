"use client";
import React, { useState, useEffect } from "react";
import { getCategory } from "../../../../sanity/sanity-utils";
import All from "@/app/components/All/All";
import Pagination from "@/app/components/Pagination";

const Tshirt = () => {
  const [tshirt, setTshirt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedProducts = await getCategory("Top");
        setTshirt(fetchedProducts || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  const totalproducts = tshirt.length;
  const totalPages = Math.ceil(totalproducts / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = tshirt.slice(indexOfFirstProduct, indexOfLastProduct);

  const imageStyles = [
    "w-[100%] h-[520px]",
    "w-[9%] h-[250px]",
    "w-[100%] h-[520px]",
  ];

  return (
    <div>
      <div className="border-white flex items-baseline justify-between border-b-2 py-4">
        <div className="flex items-baseline gap-3">
          <p className="text-6xl font-bold uppercase tracking-tight">TOP</p>
          <span className="text-lg font-mono text-gray">({totalproducts})</span>
        </div>
        {totalproducts > 0 && (
          <p className="text-xs uppercase tracking-widest text-gray hidden sm:block">
            Page {currentPage} of {totalPages || 1}
          </p>
        )}
      </div>
      <div className="grid md:gap-6 grid-cols-2 gap-3 my-5 lg:grid-cols-3">
        {currentProducts.map((product, index) => (
          <All
            key={product._id}
            imageStyle={imageStyles[(indexOfFirstProduct + index) % imageStyles.length]}
            className=""
            product={product}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        totalItems={totalproducts}
        itemsPerPage={productsPerPage}
        itemName="products"
      />
    </div>
  );
};

export default Tshirt;
