import Navbar from "./navbar";

const About = () => {
    return (
        
        <div className="flex flex-col md:flex-row border-4 rounded-3xl backdrop-blur-md shadow-2xl">
            <section className="flex flex-col gap-4 rounded text-center w-full md:w-1/2 h-auto p-10">
                <h1 className="text-xl md:text-2xl">Who Are We?</h1>
                <div className="text-center text-md font-Lato font-light h-auto max-w-3xl p-4 ">
                    <p>We are a platform for those who want the freedom to rent and drive vehicles for their personal journeys.</p>
                    <p>Whether it’s a car, bike, or scooter, we connect you with a seamless and straightforward ride for your trip, giving you full control of your journey.</p>
                    <p>Focused on ease, safety, and convenience, we make renting quick, reliable, and provide a seamless rental experience, so you can get on the road with confidence.</p>
                    <p>Whether you need a vehicle for a short trip or an extended journey, we are here to help you get moving with ease.</p>
                </div>
            </section>
            <section className="flex flex-col gap-4 rounded-3xl  border-slate-900 text-center w-full md:w-1/2 h-auto p-10 shadow-2xl shadow-gray-900 ">
                <h1 className="text-xl md:text-2xl">Why Hire a Vehicle From Us?</h1>
                <div className=" font-Lato   text-md font-light p-4">
                    <p>We make vehicle rentals easy, secure, and reliable for your personal journeys. Our platform ensures smooth bookings, proper documentation, and secure transactions for both renters and vehicle owners.</p>
                    <p>With a variety of well-maintained vehicles at competitive rates, we provide a hassle-free experience, letting you drive your own way—whether for short trips or long adventures.</p>
                </div>
            </section>
        </div>
       
    );
}

export default About;
