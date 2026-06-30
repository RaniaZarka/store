"use client";

import Header from "../header/Header";
import Footer from "../footer/Footer";

export default function HeroSection() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gray-50 px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Welcome to Our Store!
        </h1>
      </main>

      <Footer />
    </div>
  );
}
