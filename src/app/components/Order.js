"use client";
import React, { useState, useEffect } from "react";
import { getOrdersByEmail } from "../../../sanity/sanity-utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pagination from "./Pagination";

export default function Order() {
  const router = useRouter();
  const user = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.data?.user?.email) {
          const fetchedOrders = await getOrdersByEmail(user?.data?.user?.email);
          setOrders(fetchedOrders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user.status === "authenticated") {
      fetchData();
    } else if (user.status === "unauthenticated") {
      setLoading(false);
      router?.push("/cart/login");
    }
  }, [user, router]);

  // Format creation date & time nicely
  const formatOrderDateTime = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    } catch {
      return null;
    }
  };

  if (user.status === "unauthenticated") {
    return null;
  }

  if (user.status === "loading" || loading) {
    return (
      <div className="space min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-gray">Loading your orders...</p>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="space py-8  mx-auto">
      {/* Header section matching app aesthetic */}
      <div className="border-b-2 border-white pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">ORDERS</h1>
            <span className="text-xs md:text-sm text-gray font-mono uppercase tracking-widest">
              ({orders.length})
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-gray mt-1">
            Account: {user?.data?.user?.email}
          </p>
        </div>

        {orders.length > 0 && (
          <p className="text-xs uppercase tracking-widest text-gray">
            Showing Page {currentPage} of {totalPages || 1}
          </p>
        )}
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <div className="border border-white/20 p-12 md:p-20 text-center my-8 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-2">
            No Orders Yet
          </h2>
          <p className="text-xs uppercase tracking-widest text-gray max-w-md mb-6">
            You haven&apos;t placed any orders yet. Browse our latest drops and gear up.
          </p>
          <Link href="/allproducts" className="login-btn text-xs uppercase tracking-widest">
            Explore Collection
          </Link>
        </div>
      ) : (
        /* Orders list */
        <div className="flex flex-col gap-6">
          {currentOrders.map((product) => {
            const createdAtFormatted = formatOrderDateTime(product.createdAt || product._createdAt);
            const shortId = product._id ? product._id.slice(-8).toUpperCase() : "";

            return (
              <div
                key={product._id}
                className="border border-white/20 bg-airblack/40 p-4 md:p-6 transition-colors duration-200 hover:border-white/40"
              >
                {/* Order Top Bar: Reference, Date/Time, and Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {shortId && (
                      <span className="text-xs font-mono font-semibold tracking-wider text-white">
                        REF #{shortId}
                      </span>
                    )}

                    {createdAtFormatted && (
                      <span className="text-xs uppercase tracking-wider text-gray flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray inline-block"></span>
                        {createdAtFormatted}
                      </span>
                    )}
                  </div>

                  {/* Redesigned Status Badges: Paid & Delivery status side-by-side */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment Status Pill */}
                    {product.paid ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border border-green/40 bg-green/10 text-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-green"></span>
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border border-red/40 bg-red/10 text-red">
                        <span className="w-1.5 h-1.5 rounded-full bg-red"></span>
                        Unpaid
                      </span>
                    )}

                    {/* Delivery Status Pill */}
                    {product.delivered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border border-green/40 bg-green/10 text-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-green"></span>
                        Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border border-yellow/40 bg-yellow/10 text-yellow">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow animate-pulse"></span>
                        In Transit
                      </span>
                    )}
                  </div>
                </div>

                {/* Product details row */}
                <div className="flex items-start gap-4 md:gap-6">
                  {/* Product thumbnail */}
                  <div className="w-[90px] h-[90px] md:w-[130px] md:h-[130px] bg-white flex-shrink-0 flex items-center justify-center p-2">
                    {product.image2 ? (
                      <img
                        className="w-full h-full object-contain"
                        src={product.image2}
                        alt={product.name || "Order item"}
                      />
                    ) : (
                      <div className="text-black text-xs uppercase font-mono">No Image</div>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="flex-1 flex flex-col justify-between self-stretch">
                    <div>
                      <h3 className="text-base md:text-xl font-bold uppercase tracking-tight text-white mb-2">
                        {product.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs uppercase font-mono">
                        {product.sizes && (
                          <span className="px-2.5 py-1 border border-white/20 bg-darkwind/60 text-offwhite">
                            Size: <strong className="text-white">{product.sizes}</strong>
                          </span>
                        )}
                        {product.qty !== undefined && (
                          <span className="px-2.5 py-1 border border-white/20 bg-darkwind/60 text-offwhite">
                            Qty: <strong className="text-white">{product.qty}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price if present */}
                    {product.price !== undefined && product.price !== null && (
                      <div className="pt-2 text-sm md:text-base font-bold tracking-tight text-white">
                        NGN{" "}
                        {(product.price > 1000
                          ? product.price / 100
                          : product.price
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            totalItems={orders.length}
            itemsPerPage={ordersPerPage}
            itemName="orders"
          />
        </div>
      )}
    </div>
  );
}
