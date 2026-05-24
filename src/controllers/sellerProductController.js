const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductMedia = require('../models/ProductMedia');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const excelJS = require('exceljs');

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

        const { name, category_id, description, mrp_price, selling_price, variants, media } = req.body;

        // Create base product
        const newProduct = new Product({
            shop_id: shop._id,
            category_id,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
            description,
            mrp_price: mrp_price || selling_price,
            selling_price,
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

module.exports = {
    getProducts,
    createProduct,
    exportProducts,
    uploadProductImages
};

