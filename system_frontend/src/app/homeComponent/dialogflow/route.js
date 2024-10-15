// import { NextResponse } from 'next/server';

// export async function POST(request) {
//     const body = await request.json();
//     const intentName = body.queryResult.intent.displayName;

//     let responseText = '';

//     // Handle intents from Dialogflow
//     if (intentName === 'StartBookingIntent') {
//         responseText = 'Sure, I can help you book a vehicle. What type of vehicle are you looking for?';
//     } else if (intentName === 'SpecifyVehicleType') {
//         responseText = 'Great! What date would you like to book this vehicle for?';
//     } else {
//         responseText = 'I am sorry, I didn’t understand that. Can you please try again?';
//     }

//     // Return the response to Dialogflow with CORS headers
//     const response = NextResponse.json({
//         fulfillmentText: responseText
//     });

//     response.headers.set('Access-Control-Allow-Origin', '*');
//     response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

//     return response;
// }

// export async function OPTIONS() {
//     const response = NextResponse.json({});
//     response.headers.set('Access-Control-Allow-Origin', '*');
//     response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
//     response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
//     return response;
// }
