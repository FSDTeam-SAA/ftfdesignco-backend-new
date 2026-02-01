import { User } from '../user/user.model';
import { Product } from '../product/product.model';
import { Order } from '../order/order.model';
import { Parser } from '@json2csv/plainjs';

const getAdminDashboardStats = async () => {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
    ]);

    // Optional: Calculate total revenue if you have an 'amount' field in Orders
    const revenueData = await Order.aggregate([
        { $match: { status: 'completed' } }, // Only count successful orders
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    return {
        totalUsers,
        totalProducts,
        totalOrders,
        // totalRevenue: revenueData[0]?.totalRevenue || 0,
    };
};

const exportOrdersToCSV = async () => {
    const orders = await Order.find()
        .populate('user', 'firstName lastName email')
        .populate('products.productId', 'title price');

    const flattenedData = orders.map((order: any) => ({
        OrderID: order._id.toString(),
        Customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
        Email: order.user?.email || 'N/A',
        TotalAmount: order.totalAmount,
        Status: order.status,
        Date: new Date(order.createdAt).toLocaleDateString(),
    }));

    try {
        const opts = {}; // You can add options here if needed
        const parser = new Parser(opts);
        const csv = parser.parse(flattenedData);
        return csv;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const analyticsService = {
    getAdminDashboardStats,
    exportOrdersToCSV,

};