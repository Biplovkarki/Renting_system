import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import PriceDetails from './PriceDetails';

const ServicesDetails = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row lg:justify-between lg:gap-8 px-4 py-8 bg-gray-800">
      {/* FAQ Section */}
      <div className="w-full lg:w-1/2 px-4 py-8 text-center lg:text-left bg-gray-700 rounded-lg">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold border-b border-white pb-4 mb-6">
          FAQs
        </h1>
        <div className="text-start w-full">
          <div className="w-full divide-y divide-white/5 rounded-xl bg-gray-700">
            {/* Question 1 */}
            <Disclosure as="div" className="p-4">
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="text-sm md:text-base lg:text-lg font-bold text-white group-hover:text-white/80">
                  How do I rent a vehicle?
                </span>
                <ChevronDownIcon className="h-5 w-5 fill-white group-hover:fill-white/50 group-data-[open]:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm text-white">
                To rent a vehicle, simply browse our selection, choose your preferred vehicle, and follow the on-screen instructions to book it.
              </DisclosurePanel>
            </Disclosure>

            {/* Question 2 */}
            <Disclosure as="div" className="p-4">
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="text-sm md:text-base lg:text-lg font-bold text-white group-hover:text-white/80">
                  What are your Services?
                </span>
                <ChevronDownIcon className="h-5 w-5 fill-white group-hover:fill-white/50 group-data-[open]:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm text-white">We offer:</DisclosurePanel>
              <DisclosurePanel className="mt-2 text-sm text-white">- Seamless and reliable booking experience</DisclosurePanel>
              <DisclosurePanel className="mt-2 text-sm text-white">- Secure transactions</DisclosurePanel>
              <DisclosurePanel className="mt-2 text-sm text-white">- Vehicle security</DisclosurePanel>
            </Disclosure>

            {/* Question 3 */}
            <Disclosure as="div" className="p-4">
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="text-sm md:text-base lg:text-lg font-bold text-white group-hover:text-white/80">
                  What vehicles do you offer?
                </span>
                <ChevronDownIcon className="h-5 w-5 fill-white group-hover:fill-white/50 group-data-[open]:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm text-white">
                We provide well-maintained cars, jeeps, bikes, and scooters.
              </DisclosurePanel>
            </Disclosure>

            {/* Question 4 */}
            <Disclosure as="div" className="p-4">
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="text-sm md:text-base lg:text-lg font-bold text-white group-hover:text-white/80">
                  Can I rent a vehicle for long-term use?
                </span>
                <ChevronDownIcon className="h-5 w-5 fill-white group-hover:fill-white/50 group-data-[open]:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm text-white">
                Yes, long-term rentals are available. You can choose the rental period that suits your needs, from a few hours to several weeks or months.
              </DisclosurePanel>
            </Disclosure>

            {/* Question 5 */}
            <Disclosure as="div" className="p-4">
              <DisclosureButton className="group flex w-full items-center justify-between">
                <span className="text-sm md:text-base lg:text-lg font-bold text-white group-hover:text-white/80">
                  What documents do I need to rent a vehicle?
                </span>
                <ChevronDownIcon className="h-5 w-5 fill-white group-hover:fill-white/50 group-data-[open]:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm text-white">
                Typically, you’ll need a valid driver’s license and a form of identification. Specific requirements may vary depending on the vehicle and owner.
              </DisclosurePanel>
            </Disclosure>
          </div>
        </div>
      </div>

      {/* Price Details Section */}
      <div className="w-full lg:w-1/2 px-4 py-8 bg-gray-700 rounded-lg">
        <PriceDetails />
      </div>
    </div>
  );
};

export default ServicesDetails;
