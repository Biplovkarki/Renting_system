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
app.use('/fetch',fetchRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
