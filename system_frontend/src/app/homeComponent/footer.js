import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faFacebook, faTwitter, faWhatsapp, faViber, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <div className="m-3">
      <div className="border bg-slate-400 h-auto w-full lg:w-11/12 rounded-3xl p-4 lg:ml-14 flex flex-col lg:flex-row justify-between items-center">
        {/* Left Side: Copyright */}
        <div className="flex items-center mb-4 lg:mb-0">
          <FontAwesomeIcon icon={faCopyright} className="w-4 h-4 text-black mr-2" />
          <h1 className="font-serif font-thin text-black text-sm lg:text-base">
            Easy Rent Nepal, All rights reserved
          </h1>
        </div>

        {/* Right Side: Social Icons */}
        <div className="flex flex-row gap-5">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} className="hover:scale-125 transform w-5 h-5 text-black" />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebook} className="hover:scale-125 transform w-5 h-5 text-black" />
          </a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter} className="hover:scale-125 transform w-5 h-5 text-black" />
          </a>
          <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faWhatsapp} className="hover:scale-125 transform w-5 h-5 text-black" />
          </a>
          <a href="https://www.viber.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faViber} className="hover:scale-125 transform w-5 h-5 text-black" />
          </a>
          <a href="https://www.gmail.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faEnvelope} className="hover:scale-125 transform w-5 h-5 text-black" />
          </a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faYoutube} className="hover:scale-125 transform w-5 h-5 text-black" />
          </a>
        </div>
      </div>
    </div>
  );
}
