import Chatbot from "../dialogflow/chatbot";
import Orgdetails from "../details";
import Footer from "../footer";
import Navbar from "../navbar";
import About from "./about";
import ServicesDetails from "./services";

export default function Services() {
  return (
    <>
    <Navbar/>
      <div className="bg-slate-400 h-fit border-4">
        <h1 className="border  text-white text-4xl md:text-6xl font-Lato font-extrabold drop-shadow-2xl shadow-blue-800 text-center py-5">
          Services
        </h1>
        <div className="bg-slate-400">
          <About/>
        </div>
        <div className="flex flex-row ml-4 justify-center gap-6 mr-6">
          <ServicesDetails />
        </div>
        <Orgdetails/>
        <Footer />
      </div>
      <Chatbot />
    </>
  );
}
