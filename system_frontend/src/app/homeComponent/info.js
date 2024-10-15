import Image from "next/image";
import caricon from "../../../public/caricon.png";
import wallet from "../../../public/wallet.png";
import guarantee from "../../../public/guarantee.png";
import responsive from "../../../public/responsive.png";
import file from "../../../public/fileicon.png";

export default function Infodiv() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-around p-6 bg-slate-300 rounded-3xl gap-4">
      {/* First Image */}
      <div className="flex flex-col items-center justify-between w-full sm:w-52 h-48 shadow-2xl rounded-3xl p-4 backdrop-blur-sm">
        <Image src={caricon} alt="Car Icon" width={100} height={100} />
        <div className="  text-center">
          <p className=" text-gray-950 text-sm">Easy Rental</p>
          <p className="text-gray-950 font-extralight lg:font-thin">Quick and hassle-free rentals</p>
        </div>
      </div>

      {/* Second Image */}
      <div className="flex flex-col items-center justify-between w-full sm:w-52 h-48 shadow-2xl rounded-3xl p-4 backdrop-blur-sm">
        <Image src={wallet} alt="Wallet Icon" width={100} height={100} className=" -mt-1"/>
        <div className="mb-4  text-center">
          <p className=" text-gray-950 text-sm">Affordable Prices</p>
          <p className="text-gray-950 font-extralight">Budget-friendly rentals</p>
        </div>
      </div>

      {/* Third Image (Satisfaction Guaranteed) */}
      <div className="flex flex-col items-center justify-between w-full sm:w-52 h-48 shadow-2xl rounded-3xl p-4 backdrop-blur-sm">
        <Image src={guarantee} alt="Guarantee Icon" width={100} height={100} />
        <div className=" text-center">
          <p className=" text-gray-950 text-sm">Satisfaction Guaranteed</p>
          <p className="text-gray-950 font-extralight leading-tight">Smooth and reliable experience</p>
        </div>
      </div>

      {/* Fourth Image */}
      <div className="flex flex-col items-center justify-between w-full sm:w-52 h-48 shadow-2xl rounded-3xl p-4 backdrop-blur-sm">
        <Image src={responsive} alt="Responsive Icon" width={100} height={100} />
        <div className="mb-4  text-center">
          <p className=" text-gray-950 text-sm">Responsive</p>
          <p className="text-gray-950 font-extralight">Access from any device</p>
        </div>
      </div>

      {/* Fifth Image (Proper Documentation) */}
      <div className="flex flex-col items-center justify-between w-full sm:w-60 h-48 shadow-2xl rounded-3xl p-4 backdrop-blur-sm">
        <Image src={file} alt="File Icon" width={100} height={100} />
        <div className=" text-center">
          <p className=" text-gray-950 text-sm">Proper Documentation</p>
          <p className="text-gray-950 font-thin leading-tight">Transparent and secure process</p>
        </div>
      </div>
    </div>
  );
}
