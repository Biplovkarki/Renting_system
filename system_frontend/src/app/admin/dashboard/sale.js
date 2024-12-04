"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sales Service - API Calls
const salesService = {
  getDailySales: async (startDate, endDate) => {
    try {
      const response = await axios.get("http://localhost:5000/salesdetails/sales/daily", {
        params: { startDate, endDate },
      });
      return response.data.sales;
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      return [];
    }
  },

  getMonthlySales: async (year) => {
    try {
      const response = await axios.get("http://localhost:5000/salesdetails/sales/monthly", {
        params: { year },
      });
      return response.data.sales;
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      return [];
    }
  },

  getYearlySales: async () => {
    try {
      const response = await axios.get("http://localhost:5000/salesdetails/sales/yearly");
      return response.data.sales;
    } catch (error) {
      console.error("Error fetching yearly sales:", error);
      return [];
    }
  },
};

// Utility Functions
const generateDaysInMonth = (year, month) => {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date).toISOString().split("T")[0]);
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const generateMonthsInYear = (year) => {
  return Array.from({ length: 12 }, (_, i) => ({ year, month: i + 1 }));
};

const fillDailyData = (data, year, month) => {
  const days = generateDaysInMonth(year, month);
  return days.map((date) => {
    const existing = data.find((d) => d.date === date);
    return existing || { date, total_sales: 0, total_orders: 0 };
  });
};

const fillMonthlyData = (data, year) => {
  const months = generateMonthsInYear(year);
  return months.map(({ year, month }) => {
    const existing = data.find((d) => d.year === year && d.month === month);
    return existing || { year, month, total_sales: 0, total_orders: 0 };
  });
};

// Reusable Chart Component
const SalesChart = ({ data, type }) => {
  const formatXAxis = (value) => {
    switch (type) {
      case "daily":
        return new Date(value).toLocaleDateString();
      case "monthly":
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[value - 1]} ${data.find(d => d.month === value)?.year}`;
      case "yearly":
        return value.toString();
      default:
        return value;
    }
  };

  const formatTooltip = (value) => `Rs ${Math.round(value).toLocaleString("en-NP")}`;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={type === "daily" ? "date" : type === "monthly" ? "month" : "year"}
          tickFormatter={formatXAxis}
        />
        <YAxis tickFormatter={(value) => `Rs ${Math.round(value)}`} />
        <Tooltip formatter={(value) => formatTooltip(value)} labelFormatter={formatXAxis} />
        <Legend />
        <Bar dataKey="total_sales" fill="#8884d8" name="Total Sales" />
        <Bar dataKey="total_orders" fill="#82ca9d" name="Total Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Main Sales Dashboard Component
const SalesDashboard = () => {
  const [salesData, setSalesData] = useState({
    daily: [],
    monthly: [],
    yearly: [],
  });

  const [filters, setFilters] = useState({
    dailyStartDate: null,
    dailyEndDate: null,
    monthlyYear: new Date().getFullYear(),
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllSalesData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        const year = filters.monthlyYear;
        const month = new Date().getMonth(); // Current month

        // Check if the current date is in January (transitioning to the new year)
        if (endDate.getMonth() === 0) {
          setFilters((prevFilters) => ({
            ...prevFilters,
            monthlyYear: prevFilters.monthlyYear + 1, // Increment year for January
          }));
        }

        const [daily, monthly, yearly] = await Promise.all([
          salesService.getDailySales(
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0]
          ),
          salesService.getMonthlySales(year),
          salesService.getYearlySales(),
        ]);

        if (!daily || !monthly || !yearly) {
          setError("No sales data available.");
        } else {
          setSalesData({
            daily: fillDailyData(daily, year, month),
            monthly: fillMonthlyData(monthly, year),
            yearly,
          });
          setError(null);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAllSalesData();
  }, [filters.monthlyYear]);

  const calculateSummary = (data) => {
    if (!data || data.length === 0) return null;

    const totalSales = data.reduce((sum, item) => sum + Math.round(item.total_sales), 0);
    const totalOrders = data.reduce((sum, item) => sum + item.total_orders, 0);
    const averageSale = Math.round(totalSales / data.length);

    return {
      totalSales: `Rs ${totalSales.toLocaleString("en-NP")}`,
      totalOrders,
      averageSale: `Rs ${averageSale.toLocaleString("en-NP")}`,
    };
  };

  const dailySummary = calculateSummary(salesData.daily);
  const monthlySummary = calculateSummary(salesData.monthly);
  const yearlySummary = calculateSummary(salesData.yearly);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Sales Dashboard</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Daily Sales</h2>
          {dailySummary && (
            <>
              <p>Total Sales: {dailySummary.totalSales}</p>
              <p>Total Orders: {dailySummary.totalOrders}</p>
              <p>Avg Sale: {dailySummary.averageSale}</p>
            </>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Monthly Sales</h2>
          {monthlySummary && (
            <>
              <p>Total Sales: {monthlySummary.totalSales}</p>
              <p>Total Orders: {monthlySummary.totalOrders}</p>
              <p>Avg Sale: {monthlySummary.averageSale}</p>
            </>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Yearly Sales</h2>
          {yearlySummary && (
            <>
              <p>Total Sales: {yearlySummary.totalSales}</p>
              <p>Total Orders: {yearlySummary.totalOrders}</p>
              <p>Avg Sale: {yearlySummary.averageSale}</p>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-2 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Daily Sales (Last 30 Days)</h2>
          <SalesChart data={salesData.daily} type="daily" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Monthly Sales ({filters.monthlyYear})
            <select
              value={filters.monthlyYear}
              onChange={(e) =>
                setFilters({ ...filters, monthlyYear: Number(e.target.value) })
              }
              className="ml-2 border rounded p-1"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i} value={2020 + i}>
                  {2020 + i}
                </option>
              ))}
            </select>
          </h2>
          <SalesChart data={salesData.monthly} type="monthly" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Yearly Sales</h2>
          <SalesChart data={salesData.yearly} type="yearly" />
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
