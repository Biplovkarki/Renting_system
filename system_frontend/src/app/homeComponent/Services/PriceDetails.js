import { TableCellsIcon } from "@heroicons/react/20/solid";

export default function PriceDetails() {
  return (
    <div className="text-center pl-6 pr-6 h-fit">
      <h1 className="text-2xl md:text-3xl lg:text-4xl lg:text-start text-white font-bold border-b border-white pb-4 mb-6">
        Price Details
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse mt-5">
          <thead>
            <tr className="border-b">
              <th className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Vehicle Type</th>
              <th className="shadow-2xl shadow-slate-500 border-gray-300 p-2">1 <br/>Day</th>
              <th className="shadow-2xl shadow-slate-500 border-gray-300 p-2">2 <br/> Days</th>
              <th className="shadow-2xl shadow-slate-500 border-gray-300 p-2">3  <br/> Days</th>
              <th className="shadow-2xl shadow-slate-500 border-gray-300 p-2">A <br/> Week</th>
              <th className="shadow-2xl shadow-slate-500 border-gray-300 p-2">2 <br/> Weeks</th>
            </tr>
          </thead>
          <tbody>
            {/* Cars Pricing */}
            <tr className="shadow-2xl border-b shadow-slate-500">
              <td className="shadow-2xl shadow-slate-500 border-gray-300">Cars</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300">Rs.<br/> XXXX</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> YYYY</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> ZZZZ</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> AAAAA</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> AAAAA</td>
            </tr>

            {/* Bikes Pricing */}
            <tr className="shadow-2xl border-b shadow-slate-500">
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Bikes</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> CCCC</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> DDDD</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs. <br/>EEEE</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> FFFF</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> GGGG</td>
            </tr>

            {/* Scooters Pricing */}
            <tr className="shadow-2xl border-b shadow-slate-500">
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Scooters</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> HHHH</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> IIII</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> JJJJ</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> KKKK</td>
              <td className="shadow-2xl shadow-slate-500 border-gray-300 p-2">Rs.<br/> LLLL</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
