import Dialogboxes from "./dailogbox";
import Chatbot from "../dialogflow/chatbot";
import Navbar from "../navbar";

export default function Aboutus() {
    
    return (
        <>
        
        <Navbar/>
            <div className="bg-slate-400  h-fit">
                <Dialogboxes/>
            
               
            </div>
            

            <Chatbot />
        </>
    );
}
