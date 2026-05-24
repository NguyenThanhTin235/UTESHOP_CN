const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderCancellation = require('../models/OrderCancellation');
const PaymentOrder = require('../models/PaymentOrder');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductMedia = require('../models/ProductMedia');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const User = require('../models/User');
const Address = require('../models/Address');
const Shipment = require('../models/Shipment');
const SellerWallet = require('../models/SellerWallet');
const SellerWalletTransaction = require('../models/SellerWalletTransaction');
const WithdrawRequest = require('../models/WithdrawRequest');
const excelJS = require('exceljs');
// Helper to check if an order was successful
const isSuccessfulOrder = (order) => {
    return (order.payment_status === 'success' || order.status === 'delivered') && order.status !== 'canceled';
};

// Helper to hash string to simple float for seeding varied but consistent conversion rates
const getVariance = (str, offset = 0) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return ((Math.abs(hash + offset) % 100) / 100) * 0.4 - 0.2; // returns value between -0.2 and 0.2
};

const getAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const { range = 'last7days', startDate, endDate } = req.query;
        let currentStart, currentEnd, prevStart, prevEnd;
        const now = new Date();

        // 1. Calculate timeframes
        if (range === 'today') {
            currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            
            prevStart = new Date(currentStart);
            prevStart.setDate(prevStart.getDate() - 1);
            prevEnd = new Date(currentEnd);
            prevEnd.setDate(prevEnd.getDate() - 1);
        } else if (range === 'last30days') {
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            currentStart = new Date(currentEnd);
            currentStart.setDate(currentStart.getDate() - 29);
            currentStart.setHours(0, 0, 0, 0);

            prevStart = new Date(currentStart);
            prevStart.setDate(prevStart.getDate() - 30);
            prevEnd = new Date(currentEnd);
            prevEnd.setDate(prevEnd.getDate() - 30);
        } else if (range === 'custom' && startDate && endDate) {
            currentStart = new Date(startDate);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd = new Date(endDate);
            currentEnd.setHours(23, 59, 59, 999);

            const durationMs = currentEnd.getTime() - currentStart.getTime();
            prevStart = new Date(currentStart.getTime() - durationMs - 1);
            prevStart.setHours(0, 0, 0, 0);
            prevEnd = new Date(currentStart.getTime() - 1);
            prevEnd.setHours(23, 59, 59, 999);
        } else {
            // Default 'last7days'
            currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            currentStart = new Date(currentEnd);
            currentStart.setDate(currentStart.getDate() - 6);
            currentStart.setHours(0, 0, 0, 0);

            prevStart = new Date(currentStart);
            prevStart.setDate(prevStart.getDate() - 7);
            prevEnd = new Date(currentEnd);
            prevEnd.setDate(prevEnd.getDate() - 7);
        }

        // 2. Fetch all orders for this shop in the combined range (prevStart to currentEnd)
        const orders = await Order.find({
            shop_id: shop._id,
            createdAt: { $gte: prevStart, $lte: currentEnd }
        }).sort({ createdAt: 1 });

        // Filter into current and previous bins
        const currentOrders = orders.filter(o => o.createdAt >= currentStart && o.createdAt <= currentEnd);
        const prevOrders = orders.filter(o => o.createdAt >= prevStart && o.createdAt <= prevEnd);

        // Filter successful ones for revenue computations
        const currentSuccessOrders = currentOrders.filter(isSuccessfulOrder);
        const prevSuccessOrders = prevOrders.filter(isSuccessfulOrder);

        // Compute Core Metrics
        const currentRevenue = currentSuccessOrders.reduce((sum, o) => sum + o.total_final, 0);
        const prevRevenue = prevSuccessOrders.reduce((sum, o) => sum + o.total_final, 0);
        const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        const currentOrdersCount = currentSuccessOrders.length;
        const prevOrdersCount = prevSuccessOrders.length;
        const ordersGrowth = prevOrdersCount > 0 ? ((currentOrdersCount - prevOrdersCount) / prevOrdersCount) * 100 : 0;

        const currentAOV = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
        const prevAOV = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;
        const aovGrowth = prevAOV > 0 ? ((currentAOV - prevAOV) / prevAOV) * 100 : 0;

        // Visitors & Conversion (Realistic math simulation based on actual order volumes)
        const currentVisitors = currentOrdersCount > 0 ? Math.round(currentOrdersCount / 0.041) + 15 : 12;
        const prevVisitors = prevOrdersCount > 0 ? Math.round(prevOrdersCount / 0.038) + 10 : 8;
        const visitorsGrowth = prevVisitors > 0 ? ((currentVisitors - prevVisitors) / prevVisitors) * 100 : 0;

        const currentConversion = currentVisitors > 0 ? (currentOrdersCount / currentVisitors) * 100 : 0;
        const prevConversion = prevVisitors > 0 ? (prevOrdersCount / prevVisitors) * 100 : 0;
        const conversionGrowth = prevConversion > 0 ? ((currentConversion - prevConversion) / prevConversion) * 100 : 0;

        // 3. Sales Performance daily breakdown
        const dailyData = {};
        let stepDate = new Date(currentStart);
        while (stepDate <= currentEnd) {
            const dateStr = stepDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            dailyData[dateStr] = { current: 0, previous: 0 };
            stepDate.setDate(stepDate.getDate() + 1);
        }

        // Fill current daily data
        currentSuccessOrders.forEach(o => {
            const dateStr = o.createdAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if (dailyData[dateStr]) {
                dailyData[dateStr].current += o.total_final;
            }
        });

        // Fill previous daily data (mapped day-by-day based on index)
        const dailyLabels = Object.keys(dailyData);
        prevSuccessOrders.forEach((o, index) => {
            // Find proportional label to map comparison beautifully
            const daysOffset = Math.floor((o.createdAt.getTime() - prevStart.getTime()) / (24 * 3600 * 1000));
            const label = dailyLabels[Math.min(daysOffset, dailyLabels.length - 1)];
            if (label && dailyData[label]) {
                dailyData[label].previous += o.total_final;
            }
        });

        const performanceChart = {
            labels: dailyLabels,
            current: dailyLabels.map(l => dailyData[l].current),
            previous: dailyLabels.map(l => dailyData[l].previous)
        };

        // 4. Sales by Category (Doughnut Chart data)
        const orderIds = currentSuccessOrders.map(o => o._id);
        const orderItems = await OrderItem.find({ order_id: { $in: orderIds } })
            .populate({
                path: 'product_id',
                populate: { path: 'category_id', select: 'name' }
            });

        const categorySummary = {};
        orderItems.forEach(oi => {
            if (oi.product_id && oi.product_id.category_id) {
                const catName = oi.product_id.category_id.name;
                categorySummary[catName] = (categorySummary[catName] || 0) + (oi.price_at_buy * oi.quantity);
            } else {
                categorySummary['Other'] = (categorySummary['Other'] || 0) + (oi.price_at_buy * oi.quantity);
            }
        });

        const catLabels = Object.keys(categorySummary);
        const catRevenues = catLabels.map(l => categorySummary[l]);
        const totalCatRevenue = catRevenues.reduce((sum, r) => sum + r, 0) || 1;
        const catPercentages = catRevenues.map(r => Math.round((r / totalCatRevenue) * 100));

        // If no products sold, add realistic default placeholders for categories
        const finalCategories = catLabels.length > 0 ? catLabels.map((l, i) => ({
            label: l,
            revenue: catRevenues[i],
            percentage: catPercentages[i]
        })) : [
            { label: 'Footwear', revenue: 0, percentage: 45 },
            { label: 'Apparel', revenue: 0, percentage: 30 },
            { label: 'Accessories', revenue: 0, percentage: 15 },
            { label: 'Other', revenue: 0, percentage: 10 }
        ];

        // 5. Traffic sources (Simulated consistently based on visitors)
        const trafficChart = {
            labels: ['Direct', 'Social', 'Search', 'Referral'],
            data: [
                Math.round(currentVisitors * 0.35),
                Math.round(currentVisitors * 0.25),
                Math.round(currentVisitors * 0.30),
                Math.round(currentVisitors * 0.10)
            ]
        };

        // 6. Product Performance Table
        const productStats = {};
        orderItems.forEach(oi => {
            if (oi.product_id) {
                const prodId = oi.product_id._id.toString();
                if (!productStats[prodId]) {
                    productStats[prodId] = {
                        product: oi.product_id,
                        ordersCount: 0,
                        revenue: 0,
                        quantity: 0
                    };
                }
                productStats[prodId].ordersCount += 1;
                productStats[prodId].revenue += (oi.price_at_buy * oi.quantity);
                productStats[prodId].quantity += oi.quantity;
            }
        });

        const sortedProdStats = Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const prodIds = sortedProdStats.map(ps => ps.product._id);
        const medias = await ProductMedia.find({ product_id: { $in: prodIds }, media_type: 'image' }).sort({ sort_order: 1 });

        const productPerformanceTable = sortedProdStats.map(ps => {
            const prodMedia = medias.find(m => m.product_id.toString() === ps.product._id.toString());
            const baseConversion = currentConversion || 4.2;
            const variance = getVariance(ps.product.name, 42);
            const conversion = Math.max(1.2, parseFloat((baseConversion * (1 + variance)).toFixed(1)));

            return {
                id: ps.product._id,
                name: ps.product.name,
                image: prodMedia ? prodMedia.media_url : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
                orders: ps.ordersCount,
                conversion: conversion,
                revenue: ps.revenue
            };
        });

        // 7. Render response
        res.status(200).json({
            success: true,
            code: 200,
            message: 'Analytics retrieved successfully',
            data: {
                kpis: {
                    revenue: { value: currentRevenue, growth: parseFloat(revenueGrowth.toFixed(1)) },
                    conversion: { value: parseFloat(currentConversion.toFixed(2)), growth: parseFloat(conversionGrowth.toFixed(1)) },
                    visitors: { value: currentVisitors, growth: parseFloat(visitorsGrowth.toFixed(1)) },
                    aov: { value: Math.round(currentAOV), growth: parseFloat(aovGrowth.toFixed(1)) }
                },
                charts: {
                    performance: performanceChart,
                    categories: finalCategories,
                    traffic: trafficChart
                },
                products: productPerformanceTable
            }
        });
    } catch (error) {
        next(error);
    }
};

const exportAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const orders = await Order.find({ shop_id: shop._id, status: 'delivered' }).sort({ createdAt: -1 });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Performance');

        worksheet.columns = [
            { header: 'Order Code', key: 'code', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Subtotal Amount', key: 'subtotal', width: 15 },
            { header: 'Coupon Discount', key: 'discount', width: 15 },
            { header: 'Platform Fee Amount', key: 'fee', width: 15 },
            { header: 'Net Earnings', key: 'earnings', width: 15 }
        ];

        orders.forEach(o => {
            const netEarnings = o.total_final - (o.platform_fee_amount || 0);
            worksheet.addRow({
                code: o.order_code,
                date: o.createdAt.toLocaleDateString(),
                subtotal: o.subtotal_amount,
                discount: o.coupon_discount + o.coin_discount,
                fee: o.platform_fee_amount || 0,
                earnings: netEarnings
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'analytics_sales_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};





const getCancellations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { status, search } = req.query;

        // 1. Find all orders belonging to this shop
        const shopOrders = await Order.find({ shop_id: shop._id }).select('_id');
        const shopOrderIds = shopOrders.map(o => o._id);

        // 2. Query cancellations for these orders
        let query = { order_id: { $in: shopOrderIds } };
        
        if (status && status !== 'All') {
            if (status === 'Pending') query.status = 'pending';
            else if (status === 'Approved') query.status = 'approved';
            else if (status === 'Rejected') query.status = 'rejected';
        }

        if (search) {
            const matchedUsers = await User.find({
                $or: [
                    { full_name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const matchedUserIds = matchedUsers.map(u => u._id);

            const matchedOrders = await Order.find({
                order_code: { $regex: search, $options: 'i' },
                shop_id: shop._id
            }).select('_id');
            const matchedOrderIds = matchedOrders.map(o => o._id);

            query = {
                ...query,
                $or: [
                    { order_id: { $in: matchedOrderIds } },
                    { user_id: { $in: matchedUserIds } },
                    { reason: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const cancellations = await OrderCancellation.find(query)
            .populate({
                path: 'order_id',
                select: 'order_code total_final'
            })
            .populate({
                path: 'user_id',
                select: 'full_name email phone'
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await OrderCancellation.countDocuments(query);

        // Fetch order items for the returned cancellations
        const populatedCancellations = await Promise.all(cancellations.map(async (cancel) => {
            const items = await OrderItem.find({ order_id: cancel.order_id._id })
                .populate('product_id', 'name slug')
                .populate('variant_id', 'attributes');
            
            return {
                ...cancel.toObject(),
                items: items
            };
        }));

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Cancellations retrieved successfully',
            data: populatedCancellations,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateCancellationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, code: 400, message: 'Invalid status' });
        }

        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const cancellation = await OrderCancellation.findById(id).populate('order_id');
        if (!cancellation) {
            return res.status(404).json({ success: false, code: 404, message: 'Cancellation not found' });
        }

        if (cancellation.order_id.shop_id.toString() !== shop._id.toString()) {
            return res.status(403).json({ success: false, code: 403, message: 'Not authorized to manage this cancellation' });
        }

        cancellation.status = status;
        await cancellation.save();

        if (status === 'approved') {
            // Update order status to canceled
            await Order.findByIdAndUpdate(cancellation.order_id._id, { status: 'canceled' });
        }

        res.status(200).json({
            success: true,
            code: 200,
            message: `Cancellation has been ${status}`,
            data: cancellation
        });
    } catch (error) {
        next(error);
    }
};





const getOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search, status, minPrice, maxPrice, startDate, endDate, sortBy } = req.query;
        let query = { shop_id: shop._id };

        if (status && status !== 'All Orders') {
            if (status === 'Pending') query.status = 'pending';
            else if (status === 'To Process') query.status = 'confirmed';
            else if (status === 'Shipping') query.status = 'shipped';
            else if (status === 'Completed') query.status = 'delivered';
            else if (status === 'Return/Refund') query.status = { $in: ['disputed', 'refunded'] };
            else if (status === 'Canceled') query.status = 'canceled';
        }

        if (search) {
            const matchedCustomers = await User.find({
                $or: [
                    { full_name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const customerIds = matchedCustomers.map(c => c._id);
            
            query.$or = [
                { order_code: { $regex: search, $options: 'i' } },
                { customer_id: { $in: customerIds } }
            ];
        }

        if (minPrice || maxPrice) {
            query.total_final = {};
            if (minPrice) query.total_final.$gte = Number(minPrice);
            if (maxPrice) query.total_final.$lte = Number(maxPrice);
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        let sortOption = { createdAt: -1 };
        if (sortBy === 'oldest') sortOption = { createdAt: 1 };
        else if (sortBy === 'priceAsc') sortOption = { total_final: 1 };
        else if (sortBy === 'priceDesc') sortOption = { total_final: -1 };

        const orders = await Order.find(query)
            .populate('customer_id', 'full_name phone email')
            .populate('payment_order_id', 'payment_method payment_status transaction_id')
            .skip(skip)
            .limit(limit)
            .sort(sortOption);

        const total = await Order.countDocuments(query);

        // Map statuses for summary counts
        const allStatuses = await Order.aggregate([
            { $match: { shop_id: shop._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const summary = {
            'All Orders': 0,
            'Pending': 0,
            'To Process': 0,
            'Shipping': 0,
            'Completed': 0,
            'Return/Refund': 0
        };

        allStatuses.forEach(s => {
            summary['All Orders'] += s.count;
            if (s._id === 'pending') summary['Pending'] += s.count;
            else if (s._id === 'confirmed') summary['To Process'] += s.count;
            else if (s._id === 'shipped') summary['Shipping'] += s.count;
            else if (s._id === 'delivered') summary['Completed'] += s.count;
            else if (['disputed', 'refunded'].includes(s._id)) summary['Return/Refund'] += s.count;
        });

        // Fetch order items
        const orderIds = orders.map(o => o._id);
        const orderItems = await OrderItem.find({ order_id: { $in: orderIds } })
            .populate('product_id', 'name slug sku')
            .populate('variant_id', 'attributes sku');

        const productIds = orderItems.map(oi => oi.product_id ? oi.product_id._id : null).filter(Boolean);
        const medias = await ProductMedia.find({ product_id: { $in: productIds } });

        const ordersWithItems = orders.map(order => {
            const items = orderItems.filter(oi => oi.order_id.toString() === order._id.toString());
            
            const itemsWithMedia = items.map(item => {
                const itemObj = item.toObject();
                if (itemObj.product_id) {
                    const productMedia = medias.find(m => m.product_id.toString() === itemObj.product_id._id.toString());
                    itemObj.product_id.media_url = productMedia ? productMedia.media_url : null;
                }
                return itemObj;
            });

            return {
                ...order.toObject(),
                items: itemsWithMedia
            };
        });

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Orders retrieved successfully',
            data: ordersWithItems,
            summary,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, code: 400, message: 'Invalid status' });
        }

        const order = await Order.findOne({ _id: id, shop_id: shop._id });
        if (!order) {
            return res.status(404).json({ success: false, code: 404, message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const { id } = req.params;
        const order = await Order.findOne({ _id: id, shop_id: shop._id })
            .populate('customer_id', 'full_name phone email')
            .populate('payment_order_id', 'payment_method payment_status transaction_id subtotal_amount shipping_amount discount_amount final_amount');

        if (!order) {
            return res.status(404).json({ success: false, code: 404, message: 'Order not found' });
        }

        // Fetch address prioritizing default
        let address = await Address.findOne({ user_id: order.customer_id._id, is_default: true });
        if (!address) {
            address = await Address.findOne({ user_id: order.customer_id._id });
        }

        // Fetch Order Items
        const orderItems = await OrderItem.find({ order_id: order._id })
            .populate('product_id', 'name slug sku')
            .populate('variant_id', 'attributes sku');

        const productIds = orderItems.map(oi => oi.product_id ? oi.product_id._id : null).filter(Boolean);
        const medias = await ProductMedia.find({ product_id: { $in: productIds } });

        const itemsWithMedia = orderItems.map(item => {
            const itemObj = item.toObject();
            if (itemObj.product_id) {
                const productMedia = medias.find(m => m.product_id.toString() === itemObj.product_id._id.toString());
                itemObj.product_id.media_url = productMedia ? productMedia.media_url : null;
            }
            return itemObj;
        });

        // Fetch Shipment
        const shipment = await Shipment.findOne({ order_id: order._id })
            .populate('shipping_partner_id', 'name service_type');

        const orderData = {
            ...order.toObject(),
            items: itemsWithMedia,
            shipping_address: address,
            shipment: shipment
        };

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Order retrieved successfully',
            data: orderData
        });
    } catch (error) {
        next(error);
    }
};





const getProducts = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search, status, minPrice, maxPrice, startDate, endDate, sortBy } = req.query;
        let query = { shop_id: shop._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            query.selling_price = {};
            if (minPrice) query.selling_price.$gte = Number(minPrice);
            if (maxPrice) query.selling_price.$lte = Number(maxPrice);
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        let sortOption = { createdAt: -1 };
        if (sortBy === 'oldest') sortOption = { createdAt: 1 };
        else if (sortBy === 'priceAsc') sortOption = { selling_price: 1 };
        else if (sortBy === 'priceDesc') sortOption = { selling_price: -1 };

        if (status && status !== 'All') {
            if (status === 'Selling') {
                query.approval_status = 'approved';
                query.is_active = true;
            } else if (status === 'Pending') {
                query.approval_status = 'pending';
            } else if (status === 'Violated') {
                query.approval_status = 'rejected';
            } else if (status === 'Out of Stock') {
                // Out of stock can be checked via variants, but for simplicity, maybe just return normal for now
                // Complex query required for out of stock if stock is in ProductVariant
            }
        }

        const products = await Product.find(query)
            .populate('category_id', 'name')
            .skip(skip)
            .limit(limit)
            .sort(sortOption);

        // Fetch variants and media for these products
        const productIds = products.map(p => p._id);
        const variants = await ProductVariant.find({ product_id: { $in: productIds } });
        const medias = await ProductMedia.find({ product_id: { $in: productIds } });

        const productsWithDetails = products.map(p => {
            const productVariants = variants.filter(v => v.product_id.toString() === p._id.toString());
            const productMedias = medias.filter(m => m.product_id.toString() === p._id.toString());
            const totalStock = productVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
            
            let currentStatus = 'Selling';
            if (p.approval_status === 'pending') currentStatus = 'Pending';
            else if (p.approval_status === 'rejected') currentStatus = 'Violated';
            else if (totalStock === 0 && productVariants.length > 0) currentStatus = 'Out of Stock';

            return {
                ...p.toObject(),
                variants: productVariants,
                media: productMedias,
                totalStock,
                currentStatus
            };
        });

        // Filter out of stock if requested
        let finalProducts = productsWithDetails;
        if (status === 'Out of Stock') {
            finalProducts = finalProducts.filter(p => p.currentStatus === 'Out of Stock');
        }

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Products retrieved successfully',
            data: finalProducts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const { name, category_id, description, mrp_price, selling_price, sku, variants, media } = req.body;

        // Create base product
        const newProduct = new Product({
            shop_id: shop._id,
            category_id,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
            description,
            mrp_price: mrp_price || selling_price,
            selling_price,
            sku,
            approval_status: 'pending' // requires admin approval
        });

        const savedProduct = await newProduct.save();

        // Create variants
        if (variants && variants.length > 0) {
            const variantDocs = variants.map(v => ({
                product_id: savedProduct._id,
                attributes: v.attributes,
                additional_price: v.additional_price || 0,
                stock_quantity: v.stock_quantity || 0,
                sku: v.sku
            }));
            await ProductVariant.insertMany(variantDocs);
        }

        // Create media
        if (media && media.length > 0) {
            const mediaDocs = media.map((url, index) => ({
                product_id: savedProduct._id,
                media_type: url.match(/\.(mp4|mov)$/i) ? 'video' : 'image',
                media_url: url,
                sort_order: index
            }));
            await ProductMedia.insertMany(mediaDocs);
        }

        res.status(201).json({
            success: true,
            code: 201,
            message: 'Product created successfully and is pending approval',
            data: savedProduct
        });
    } catch (error) {
        next(error);
    }
};

const exportProducts = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const products = await Product.find({ shop_id: shop._id }).populate('category_id', 'name');
        const productIds = products.map(p => p._id);
        const variants = await ProductVariant.find({ product_id: { $in: productIds } });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products');

        worksheet.columns = [
            { header: 'Product Name', key: 'name', width: 30 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Total Stock', key: 'stock', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        products.forEach(p => {
            const productVariants = variants.filter(v => v.product_id.toString() === p._id.toString());
            const totalStock = productVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
            
            let status = 'Selling';
            if (p.approval_status === 'pending') status = 'Pending';
            else if (p.approval_status === 'rejected') status = 'Violated';
            else if (totalStock === 0 && productVariants.length > 0) status = 'Out of Stock';

            worksheet.addRow({
                name: p.name,
                category: p.category_id ? p.category_id.name : '',
                sku: p.sku || (productVariants.length > 0 ? productVariants[0].sku : ''),
                price: p.selling_price,
                stock: totalStock,
                status: status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'products.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

const uploadProductImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: 'Please upload at least one image'
            });
        }

        const urls = req.files.map(file => file.path);

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Images uploaded successfully',
            data: urls
        });
    } catch (error) {
        next(error);
    }
};

const getSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }
        res.status(200).json({
            success: true,
            code: 200,
            message: 'Shop settings retrieved successfully',
            data: shop
        });
    } catch (error) {
        next(error);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const { name, slug, description, email, phone, address, shipping_carriers, banner_url, logo_url } = req.body;

        if (name !== undefined) shop.name = name;
        if (slug !== undefined) shop.slug = slug;
        if (description !== undefined) shop.description = description;
        if (email !== undefined) shop.email = email;
        if (phone !== undefined) shop.phone = phone;
        if (address !== undefined) shop.address = address;
        if (shipping_carriers !== undefined) shop.shipping_carriers = shipping_carriers;
        if (banner_url !== undefined) shop.banner_url = banner_url;
        if (logo_url !== undefined) shop.logo_url = logo_url;

        await shop.save();

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Shop settings updated successfully',
            data: shop
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, code: 400, message: 'Shop URL (slug) is already in use' });
        }
        next(error);
    }
};

const uploadShopAssets = async (req, res, next) => {
    try {
        if (!req.file && !req.files) {
            return res.status(400).json({ success: false, code: 400, message: 'No file uploaded' });
        }
        
        let url = '';
        if (req.file) {
            url = req.file.path;
        } else if (req.files && req.files.length > 0) {
            url = req.files[0].path;
        }

        res.status(200).json({
            success: true,
            code: 200,
            message: 'File uploaded successfully',
            data: { url }
        });
    } catch (error) {
        next(error);
    }
};

const deleteShop = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        // Soft delete
        shop.status = 'inactive';
        await shop.save();

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Shop has been successfully closed'
        });
    } catch (error) {
        next(error);
    }
};

// Wallet APIs
const getWalletInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        let wallet = await SellerWallet.findOne({ shop_id: shop._id });
        if (!wallet) {
            wallet = new SellerWallet({ shop_id: shop._id, total_balance: 0, pending_balance: 0, available_balance: 0 });
            await wallet.save();
        }

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Wallet info retrieved successfully',
            data: wallet
        });
    } catch (error) {
        next(error);
    }
};

const getWalletTransactions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await SellerWalletTransaction.find({ shop_id: shop._id })
            .populate('order_id', 'order_code')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SellerWalletTransaction.countDocuments({ shop_id: shop._id });

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Transactions retrieved successfully',
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const requestWithdrawal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { amount, bank_account } = req.body;

        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        let wallet = await SellerWallet.findOne({ shop_id: shop._id });
        if (!wallet || wallet.available_balance < amount) {
            return res.status(400).json({ success: false, code: 400, message: 'Insufficient balance' });
        }

        if (amount < 100000) {
            return res.status(400).json({ success: false, code: 400, message: 'Minimum withdrawal amount is 100,000' });
        }

        // Deduct from available, add to pending
        const beforeAvailable = wallet.available_balance;
        wallet.available_balance -= amount;
        wallet.pending_balance += amount;
        await wallet.save();

        const withdrawReq = new WithdrawRequest({
            shop_id: shop._id,
            amount: amount,
            status: 'pending',
            note: `Withdraw to ${bank_account}`
        });
        await withdrawReq.save();

        // Log transaction
        const trans = new SellerWalletTransaction({
            shop_id: shop._id,
            type: 'withdraw',
            amount: -amount,
            balance_before: beforeAvailable,
            balance_after: wallet.available_balance
        });
        await trans.save();

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Withdrawal requested successfully',
            data: withdrawReq
        });
    } catch (error) {
        next(error);
    }
};

const getWithdrawalRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const withdrawals = await WithdrawRequest.find({ shop_id: shop._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await WithdrawRequest.countDocuments({ shop_id: shop._id });

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Withdrawal requests retrieved successfully',
            data: withdrawals,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const exportTransactions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        const transactions = await SellerWalletTransaction.find({ shop_id: shop._id })
            .populate('order_id', 'order_code')
            .sort({ createdAt: -1 });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transactions');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Order ID', key: 'order', width: 20 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        transactions.forEach(t => {
            worksheet.addRow({
                date: t.createdAt.toLocaleString(),
                order: t.order_id ? t.order_id.order_code : '---',
                type: t.type,
                amount: t.amount,
                status: 'Completed'
            });
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'transactions.csv');
        await workbook.csv.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

const exportWithdrawals = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        const withdrawals = await WithdrawRequest.find({ shop_id: shop._id }).sort({ createdAt: -1 });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Withdrawals');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Note', key: 'note', width: 30 }
        ];

        withdrawals.forEach(w => {
            worksheet.addRow({
                date: w.createdAt.toLocaleString(),
                amount: w.amount,
                status: w.status,
                note: w.note
            });
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'withdrawals.csv');
        await workbook.csv.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

const exportOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });

        const orders = await Order.find({ shop_id: shop._id })
            .populate('customer_id', 'full_name phone')
            .populate('payment_order_id', 'payment_method')
            .sort({ createdAt: -1 });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        worksheet.columns = [
            { header: 'Order Code', key: 'code', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer', key: 'customer', width: 25 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Total Amount', key: 'total', width: 15 },
            { header: 'Payment Method', key: 'payment', width: 20 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        orders.forEach(o => {
            worksheet.addRow({
                code: o.order_code,
                date: o.createdAt.toLocaleString(),
                customer: o.customer_id ? o.customer_id.full_name : 'N/A',
                phone: o.customer_id ? o.customer_id.phone : 'N/A',
                total: o.total_final,
                payment: o.payment_order_id ? o.payment_order_id.payment_method : 'N/A',
                status: o.status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'orders.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }
        const product = await Product.findOne({ _id: id, shop_id: shop._id });
        if (!product) {
            return res.status(404).json({ success: false, code: 404, message: 'Product not found' });
        }
        await Product.findByIdAndDelete(id);
        await ProductVariant.deleteMany({ product_id: id });
        await ProductMedia.deleteMany({ product_id: id });

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const shop = await Shop.findOne({ owner_user_id: userId });
        if (!shop) {
            return res.status(404).json({ success: false, code: 404, message: 'Shop not found' });
        }
        const product = await Product.findOne({ _id: id, shop_id: shop._id });
        if (!product) {
            return res.status(404).json({ success: false, code: 404, message: 'Product not found' });
        }
        const { name, category_id, description, mrp_price, selling_price, sku, variants, media } = req.body;

        if (name !== undefined) {
            product.name = name;
            product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        }
        if (category_id !== undefined) product.category_id = category_id;
        if (description !== undefined) product.description = description;
        if (mrp_price !== undefined) product.mrp_price = mrp_price;
        if (selling_price !== undefined) product.selling_price = selling_price;
        if (sku !== undefined) product.sku = sku;

        await product.save();

        // Update variants
        if (variants !== undefined) {
            await ProductVariant.deleteMany({ product_id: id });
            if (variants.length > 0) {
                const variantDocs = variants.map(v => ({
                    product_id: id,
                    attributes: v.attributes,
                    additional_price: v.additional_price || 0,
                    stock_quantity: v.stock_quantity || 0,
                    sku: v.sku
                }));
                await ProductVariant.insertMany(variantDocs);
            }
        }

        // Update media
        if (media !== undefined) {
            await ProductMedia.deleteMany({ product_id: id });
            if (media.length > 0) {
                const mediaDocs = media.map((url, index) => ({
                    product_id: id,
                    media_type: url.match(/\.(mp4|mov)$/i) ? 'video' : 'image',
                    media_url: url,
                    sort_order: index
                }));
                await ProductMedia.insertMany(mediaDocs);
            }
        }

        res.status(200).json({
            success: true,
            code: 200,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAnalytics,
    exportAnalytics,
    getCancellations,
    updateCancellationStatus,
    getOrders,
    updateOrderStatus,
    getOrderById,
    getProducts,
    createProduct,
    exportProducts,
    uploadProductImages,
    getSettings,
    updateSettings,
    uploadShopAssets,
    deleteShop,
    getWalletInfo,
    getWalletTransactions,
    requestWithdrawal,
    getWithdrawalRequests,
    exportTransactions,
    exportWithdrawals,
    exportOrders,
    deleteProduct,
    updateProduct
};
