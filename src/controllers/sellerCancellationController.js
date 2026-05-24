const OrderCancellation = require('../models/OrderCancellation');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Shop = require('../models/Shop');
const User = require('../models/User');

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

module.exports = {
    getCancellations,
    updateCancellationStatus
};
