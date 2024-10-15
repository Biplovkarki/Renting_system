import Image from "next/image";
import car from "../../../public/whitecar.png";
import bike from "../../../public/bike.png";
import scooty from "../../../public/scooter.png";

export default function SelectVehicle() {
  return (
    <div className="mt-9 flex flex-col items-center bg-opacity-0 backdrop-blur-lg">
      {/* Centered section for vehicle selection */}
      <div className="text-center m-4 bg-slate-600 w-full sm:w-3/4 shadow-2xl shadow-slate-700 bg-transparent p-6 rounded-lg">
        <h1 className="text-2xl sm:text-3xl translate-y-6">Select the type of vehicle you want to rent?</h1>
        
        <section className="flex justify-center mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-20">
            {/* First image for Four Wheels */}
            <div className="mb-3 w-40 h-40 text-center mx-auto">
              <a href="/vehicle">
                <Image
                  src={car}
                  alt="Car"
                  className="w-full h-full object-contain hover:scale-105 transform transition duration-200 ease-in-out"
                />
              </a>
              <p className="mt-2 text-lg sm:text-base lg:text-lg">Four Wheels</p>
            </div>

            {/* Second image for Bikes */}
            <div className="w-44 h-44 text-center mx-auto">
              <a href="/vehicle">
                <Image
                  src={bike}
                  alt="Bike"
                  className="w-full -translate-y-5 h-full  object-contain hover:scale-105 transform transition duration-200 ease-in-out"
                />
              </a>
              <p className="-translate-y-2 text-lg sm:text-base lg:text-lg">Bikes</p>
            </div>

            {/* Third image for Scooters */}
            <div className="w-28 h-28 mt-9 text-center flex flex-col gap-5 sm:gap-3 mx-auto">
              <a href="/vehicle">
                <Image
                  src={scooty}
                  alt="Scooter"
                  className="w-full h-full object-contain   hover:scale-105 transform transition duration-200 ease-in-out"
                />
              </a>
              <p className=" text-lg sm:text-base lg:text-lg">Scooters</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
