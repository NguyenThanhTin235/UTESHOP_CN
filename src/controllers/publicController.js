const Banner = require('../models/Banner');
const Product = require('../models/Product');
const ProductMedia = require('../models/ProductMedia');
const Category = require('../models/Category');
const Campaign = require('../models/Campaign');
const CampaignTarget = require('../models/CampaignTarget');
const ProductVariant = require('../models/ProductVariant');
const OrderItem = require('../models/OrderItem');
const ProductReview = require('../models/ProductReview');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { toCamelCase } = require('../utils/formatter');

exports.getHomepageData = async (req, res, next) => {
  try {
    // 1. Fetch Banners
    const banners = await Banner.find({ is_active: true }).sort({ sort_order: 1 });

    // 2. Fetch Categories (Top level)
    const categories = await Category.find({ parent_id: null }).limit(6);

    // 3. Fetch Flash Deals (Active campaigns)
    const activeCampaigns = await Campaign.find({
      start_at: { $lte: new Date() },
      end_at: { $gte: new Date() }
    }).limit(1);

    let flashDeals = [];
    if (activeCampaigns.length > 0) {
      const targets = await CampaignTarget.find({ campaign_id: activeCampaigns[0]._id }).limit(4);
      const productIds = targets.map(t => t.product_id);
      flashDeals = await Product.find({ _id: { $in: productIds }, approval_status: 'approved' });
    }

    // 4. Fetch New Arrivals
    const newArrivals = await Product.find({ approval_status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(10);

    // 5. Fetch Best Sellers (Mocked by rating for now)
    const bestSellers = await Product.find({ approval_status: 'approved' })
      .sort({ average_rating: -1 })
      .limit(10);

    // Helper to attach media to products
    const attachMedia = async (products) => {
      return await Promise.all(products.map(async (p) => {
        const media = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 });
        return {
          ...p.toObject(),
          media: media.map(m => m.media_url)
        };
      }));
    };

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Homepage data fetched successfully',
      data: toCamelCase({
        banners,
        categories,
        flashDeals: await attachMedia(flashDeals),
        newArrivals: await attachMedia(newArrivals),
        bestSellers: await attachMedia(bestSellers),
        campaign: activeCampaigns[0] || null
      }),
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // 1. Fetch Product
    const product = await Product.findOne({ slug, approval_status: 'approved', is_active: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'Product not found',
        data: null,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }

    // 2. Fetch Shop with more stats
    const shop = await Shop.findById(product.shop_id).select('name slug logo_url address rating status followers response_rate joined_at response_time');

    // 3. Fetch Category hierarchy (up to 3 levels)
    let breadcrumbs = [];
    let currentCat = await Category.findById(product.category_id);
    while (currentCat) {
      breadcrumbs.unshift({ name: currentCat.name, slug: currentCat.slug });
      if (currentCat.parent_id) {
        currentCat = await Category.findById(currentCat.parent_id);
      } else {
        currentCat = null;
      }
      if (breadcrumbs.length >= 3) break; // Limit to 3 levels as per spec
    }

    // 4. Fetch Media
    const media = await ProductMedia.find({ product_id: product._id }).sort({ sort_order: 1 });

    // 5. Fetch Variants & Calculate Total Stock
    const variants = await ProductVariant.find({ product_id: product._id });
    const totalStock = variants.length > 0 
      ? variants.reduce((acc, v) => acc + (v.stock_quantity || 0), 0)
      : 100;

    // 6. Calculate Sold Quantity
    const soldData = await OrderItem.aggregate([
      { $match: { product_id: product._id } },
      { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
    ]);
    // Base sold count + real sold data
    const baseSold = product.sku ? (parseInt(product.sku.split('-').pop()) || 0) * 10 : 0;
    const totalSold = (soldData.length > 0 ? soldData[0].totalSold : 0) + baseSold + 50;

    // 7. Fetch Reviews with better details
    const reviews = await ProductReview.find({ product_id: product._id })
      .populate('user_id', 'full_name avatar_url')
      .sort({ createdAt: -1 });

    // 8. Fetch Related Products (Same category, approved, not current)
    const relatedProductsRaw = await Product.find({ 
      category_id: product.category_id, 
      _id: { $ne: product._id },
      approval_status: 'approved'
    }).limit(4);

    const relatedProducts = await Promise.all(relatedProductsRaw.map(async (p) => {
      const pMedia = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
      const pCat = await Category.findById(p.category_id).select('name');
      return {
        ...p.toObject(),
        media: pMedia.map(m => m.media_url),
        category: pCat
      };
    }));

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product details fetched successfully',
      data: toCamelCase({
        product,
        shop,
        category: {
          breadcrumbs
        },
        media,
        variants,
        stock: totalStock,
        sold: totalSold,
        reviews: reviews.map(r => ({
          id: r._id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: r.user_id ? {
            fullName: r.user_id.full_name,
            avatarUrl: r.user_id.avatar_url
          } : { fullName: 'Anonymous' }
        })),
        relatedProducts
      }),
      timestamp: Math.floor(Date.now() / 1000)
    });

  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      code: 200,
      message: 'Categories fetched successfully',
      data: toCamelCase(categories),
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    next(error);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {
      approval_status: 'approved',
      is_active: true
    };

    // 1. Keyword Search
    if (q) {
      query.$text = { $search: q };
    }

    // 2. Category Filter
    if (category) {
      // Find category and its children if needed, but for now exact match or specific hierarchy
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        // If it's a parent, we might want to include subcategories. 
        // For simplicity, let's just find products in this exact category or its children.
        const subCats = await Category.find({ parent_id: cat._id });
        const catIds = [cat._id, ...subCats.map(c => c._id)];
        query.category_id = { $in: catIds };
      }
    }

    // 3. Price Range
    if (minPrice || maxPrice) {
      query.selling_price = {};
      if (minPrice) query.selling_price.$gte = Number(minPrice);
      if (maxPrice) query.selling_price.$lte = Number(maxPrice);
    }

    // 4. Rating
    if (rating) {
      query.average_rating = { $gte: Number(rating) };
    }

    // 5. Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sort === 'price_asc') sortOption = { selling_price: 1 };
    else if (sort === 'price_desc') sortOption = { selling_price: -1 };
    else if (sort === 'top_rated') sortOption = { average_rating: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    // 6. Execution with Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // 7. Attach Media & Categories
    const results = await Promise.all(products.map(async (p) => {
      const media = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
      const cat = await Category.findById(p.category_id).select('name slug');
      return {
        ...p.toObject(),
        media: media.map(m => m.media_url),
        category: cat
      };
    }));

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Products fetched successfully',
      data: toCamelCase(results),
      meta: {
        pagination: {
          total,
          count: results.length,
          perPage: Number(limit),
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      timestamp: Math.floor(Date.now() / 1000)
    });

  } catch (error) {
    next(error);
  }
};
