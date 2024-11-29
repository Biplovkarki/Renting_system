import express from 'express';
import cors from 'cors'; // Import the cors package
import routerOwner from './owner/ownerAPI.js';
import dotenv from 'dotenv';
import path from 'path'; // Required for serving static files
import { fileURLToPath } from 'url'; // Required to mimic __dirname in ES modules
import imageOwner from './owner/image-uploads.js';
import routerAdmin from './admin/adminAPI.js';
import AdminAPI from './admin/AdminWorkAPI.js';
import priceRouter from './admin/price.js';
import discountApi from './admin/discount.js';
import vehicleRouter from './owner/vehicle.js';
import { cat_owner } from './owner/category.js';
import routerUser from './user/userAPI.js';
import fetchRouter from './admin/fetchAPI.js';
import vehicleRoutes from './admin/vehicle.js';
import fetchRoutes from './user/fetchVehicle.js';
import orderRouter from './order/order.js';
import routerRent from './order/rent.js';
import routerRate from './rate/rate.js';
import AverageRate from './rate/fetchAverage.js';
import commentRouter from './rate/comment.js';
import khaliRoutes from './payment/khalti.js';
import search from './algorithms/search.js';
import sortRouter from './algorithms/sorting.js';
//import orderRouter from './order/order.js';
// import vehicleRouter from './owner/vehicle.js';

dotenv.config();

const app = express();

// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use CORS middleware
app.use(cors()); // Allow all origins

// Middleware for parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "uploads" folder
app.use('/uploads', express.static('uploads')); // Ensure the correct absolute path is used

// Use your APIs
app.use('/owners', routerOwner);
app.use('/ownersImage', imageOwner); // Use the image upload route
app.use('/admin', routerAdmin); // Use the image upload route
app.use('/adminAPI',AdminAPI);
app.use('/Adminprice',priceRouter);
app.use('/discountAPI',discountApi);
app.use('/vehicle',vehicleRouter);
app.use('/cat_owner',cat_owner);
app.use('/users',routerUser);
app.use('/fetch',fetchRouter);
app.use('/vehicleApi',vehicleRoutes);
app.use('/fetchdetails',fetchRoutes);
app.use('/order',orderRouter);
app.use('/rent',routerRent);
app.use('/rating',routerRate);
app.use('/Average',AverageRate);
app.use('/comments',commentRouter);
app.use('/khalti',khaliRoutes);
app.use('/search',search);
app.use('/sort',sortRouter);
//app.use('/order',orderRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
