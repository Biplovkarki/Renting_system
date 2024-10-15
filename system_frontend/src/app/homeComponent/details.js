const Orgdetails = () => {
  return (
    <div className="bg-green-900 flex flex-col lg:flex-row gap-3 p-5 lg:p-10">
      {/* First Section */}
      <div className="lg:w-2/6 text-center mt-5 p-4 bg-lime-700 shadow-2xl shadow-gray-700 rounded-md">
        <h1 className="text-2xl font-bold text-white">Easy Rent Nepal</h1>
        <section className="text-center mt-4 font-Lato font-thin text-white">
          <p>
            Easy Rent Nepal is a platform for those who want the freedom to rent
            and drive vehicles for their personal journeys.
          </p>
          <p className="mt-2">
            We provide a reliable and seamless renting experience. With a
            variety of well-maintained vehicles at competitive rates, we provide
            a hassle-free experience, letting you drive your own way—whether for
            short trips or long adventures.
          </p>
        </section>
      </div>

      {/* Divider */}
      <div className="hidden lg:block border-r-2 bg-black"></div>

      {/* Second Section (Links) */}
      <div className="text-center mt-5 lg:mt-0 flex flex-col items-center lg:w-1/6">
        <h1 className="text-lg text-white font-bold mb-4">Company</h1>
        <div className="flex flex-col gap-4">
          <a href="/" className="text-white hover:text-lime-400 transition">
            Home
          </a>
          <a href="/AboutUS" className="text-white hover:text-lime-400 transition">
            About Us
          </a>
          <a href="/Services" className="text-white hover:text-lime-400 transition">
            Services
          </a>
          <a href="/vehicle" className="text-white hover:text-lime-400 transition">
            Vehicles
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block border-r-2 bg-black"></div>

      {/* Third Section (Map) */}
      <div className="text-center mt-5 lg:w-1/3 p-4 bg-lime-700 shadow-2xl shadow-gray-700 rounded-md">
        <h1 className="text-xl text-white font-bold">Visit Us</h1>
        {/* Google Map Embed Section */}
        <div className="mt-4 bg-white p-2 rounded-md">
          {/* Add your Google Map embed here */}
          <p className="text-gray-800">Google Map coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Orgdetails;
