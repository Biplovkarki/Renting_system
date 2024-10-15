import Image from "next/image";
import cars from "../../public/cars.png";
import SelectVehicle from "./homeComponent/select";
import About from "./homeComponent/aboutus";
import Infodiv from "./homeComponent/info";
import UserComment from "./homeComponent/usertesto";
import Orgdetails from "./homeComponent/details";
import Footer from "./homeComponent/footer";
import Chatbot from "./homeComponent/dialogflow/chatbot";
import Navbar from "./homeComponent/navbar";

export default function Home() {
  return (
    <>
    <Navbar />
      <div className="bg-green-950">
        <div className="flex flex-col md:flex-row border-2 h-auto md:h-96 border-black bg-gradient-to-r from-teal-950 to-blue-800 p-4 md:p-8 ">
          {/* Image Container */}
          <div className="flex justify-center md:justify-start md:w-3/4">
            <Image
              className="mt-5 md:mt-0"
              src={cars}
              alt="cars"
              width={700}
              height={350}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 50vw"
            />
          </div>
          
          {/* Text Container */}
          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left md:pl-10 md:w-1/2 font-serif">
            <h1 className="text-4xl text-gray-100 sm:text-4xl md:text-3xl lg:text-5xl font-semibold md:font-extralight leading-tight md:leading-none">
              Choose. Rent. Drive.
            </h1>
            <h2 className="text-2xl text-yellow-200 sm:text-3xl md:text-base lg:text-2xl mt-2 md:mt-4 text-white-700 lg:font-bold">
              - The Easiest Way to Get Moving!
            </h2>
          </div>
        </div>
        <div className="border bg-slate-500 rounded-3xl text-slate-50 font-serif font-extrabold h-fit backdrop-blur-sm">
          <SelectVehicle />
          <About />
          <Infodiv />
          <UserComment/>
          <Orgdetails/>
          <Footer/>
        
        </div>
      </div>
      <Chatbot className="  text-slate-50"/>
    </>
  );
}