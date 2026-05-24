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

// Cache lưu trữ lượt xem theo IP + Slug để tránh StrictMode gọi 2 lần hoặc spam refresh
const viewedCache = new Map();

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

    let flashDealsRaw = [];
    if (activeCampaigns.length > 0) {
      const targets = await CampaignTarget.find({ campaign_id: activeCampaigns[0]._id }).limit(4);
      const productIds = targets.map(t => t.product_id);
      flashDealsRaw = await Product.find({ _id: { $in: productIds }, approval_status: 'approved' });
    }

    // Helper to attach media and calculate averageRating dynamically from ProductReview
    const attachMediaAndRating = async (products) => {
      return await Promise.all(products.map(async (p) => {
        const media = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 });
        const reviews = await ProductReview.find({ product_id: p._id });
        const avgRating = reviews.length > 0 
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
          : 5.0;

        const soldData = await OrderItem.aggregate([
          { $match: { product_id: p._id } },
          { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' } },
          { $unwind: '$order' },
          { $match: { 'order.status': 'delivered' } },
          { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
        ]);
        const totalSold = soldData.length > 0 ? soldData[0].totalSold : 0;

        const pObj = typeof p.toObject === 'function' ? p.toObject() : p;
        delete pObj.average_rating;

        return {
          ...pObj,
          averageRating: avgRating,
          reviewCount: reviews.length,
          soldCount: totalSold,
          viewCount: pObj.view_count || Math.floor(Math.random() * 500) + 50,
          media: media.map(m => m.media_url)
        };
      }));
    };

    const allApproved = await Product.find({ approval_status: 'approved' });
    const allWithRating = await attachMediaAndRating(allApproved);

    let flashDeals = [];
    if (activeCampaigns.length > 0) {
      const targets = await CampaignTarget.find({ campaign_id: activeCampaigns[0]._id }).limit(4);
      const productIds = targets.map(t => t.product_id.toString());
      flashDeals = allWithRating.filter(p => productIds.includes(p._id.toString()));
    }

    const newArrivals = [...allWithRating].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    const bestSellers = [...allWithRating].sort((a, b) => b.soldCount - a.soldCount).slice(0, 10);
    const mostViewed = [...allWithRating].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);
    const biggestDiscounts = [...allWithRating].sort((a, b) => {
      const discA = 1 - (a.sellingPrice / (a.mrpPrice || a.sellingPrice));
      const discB = 1 - (b.sellingPrice / (b.mrpPrice || b.sellingPrice));
      return discB - discA;
    }).slice(0, 10);
    const recommended = allWithRating.slice(0, 10);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Homepage data fetched successfully',
      data: toCamelCase({
        banners,
        categories,
        flashDeals,
        recommended,
        newArrivals,
        bestSellers,
        mostViewed,
        biggestDiscounts,
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

    // Kiểm tra cache chống StrictMode gọi 2 lần hoặc spam refresh (cooldown 3 giây)
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
    const cacheKey = `${clientIp}_${slug}`;
    const now = Date.now();

    if (!viewedCache.has(cacheKey) || (now - viewedCache.get(cacheKey) > 3000)) {
      await Product.findOneAndUpdate({ slug }, { $inc: { view_count: 1 } });
      viewedCache.set(cacheKey, now);
    }

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

    // 2. Fetch Shop with more stats & calculate shop rating dynamically
    const shopRaw = await Shop.findById(product.shop_id).select('name slug logo_url address status followers response_rate joined_at response_time product_count');
    const shopProducts = await Product.find({ shop_id: product.shop_id }).select('_id');
    const pIds = shopProducts.map(p => p._id);
    const shopReviews = await ProductReview.find({ product_id: { $in: pIds } });
    const shopRating = shopReviews.length > 0 
      ? Number((shopReviews.reduce((acc, r) => acc + r.rating, 0) / shopReviews.length).toFixed(1))
      : 5.0;

    const shop = shopRaw ? shopRaw.toObject() : {};
    delete shop.rating;
    shop.rating = shopRating;

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

    // 6. Calculate Sold Quantity (real data only)
    const soldData = await OrderItem.aggregate([
      { $match: { product_id: product._id } },
      { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' } },
      { $unwind: '$order' },
      { $match: { 'order.status': 'delivered' } },
      { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
    ]);
    const totalSold = soldData.length > 0 ? soldData[0].totalSold : 0;

    // 7. Fetch Reviews with better details
    const reviews = await ProductReview.find({ product_id: product._id })
      .populate('user_id', 'full_name avatar_url')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 5.0;

    // 8. Fetch Related Products (Same category, approved, not current)
    const relatedProductsRaw = await Product.find({ 
      category_id: product.category_id, 
      _id: { $ne: product._id },
      approval_status: 'approved'
    }).limit(4);

    const relatedProducts = await Promise.all(relatedProductsRaw.map(async (p) => {
      const pMedia = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
      const pCat = await Category.findById(p.category_id).select('name');
      const pReviews = await ProductReview.find({ product_id: p._id });
      const pAvg = pReviews.length > 0 ? Number((pReviews.reduce((acc, r) => acc + r.rating, 0) / pReviews.length).toFixed(1)) : 5.0;

      const soldData = await OrderItem.aggregate([
        { $match: { product_id: p._id } },
        { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' } },
        { $unwind: '$order' },
        { $match: { 'order.status': 'delivered' } },
        { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
      ]);
      const totalSold = soldData.length > 0 ? soldData[0].totalSold : 0;

      const relObj = p.toObject();
      delete relObj.average_rating;

      return {
        ...relObj,
        averageRating: pAvg,
        reviewCount: pReviews.length,
        soldCount: totalSold,
        media: pMedia.map(m => m.media_url),
        category: pCat
      };
    }));

    const pObj = product.toObject();
    delete pObj.average_rating;
    pObj.averageRating = avgRating;

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Product details fetched successfully',
      data: toCamelCase({
        product: pObj,
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
      color,
      dimension,
      page = 1,
      limit = 8
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
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        // Find direct children (Level 2 or Level 3)
        const subCats = await Category.find({ parent_id: cat._id });
        const subCatIds = subCats.map(c => c._id);
        // Find grandchildren (Level 3)
        const grandSubCats = await Category.find({ parent_id: { $in: subCatIds } });
        
        const allCatIds = [cat._id, ...subCatIds, ...grandSubCats.map(c => c._id)];
        query.category_id = { $in: allCatIds };
      }
    }

    // 3. Price Range
    if (minPrice || maxPrice) {
      query.selling_price = {};
      if (minPrice) query.selling_price.$gte = Number(minPrice);
      if (maxPrice) query.selling_price.$lte = Number(maxPrice);
    }

    // Fetch all matching products first to calculate dynamic rating
    const allProducts = await Product.find(query);

    // Attach Media, Categories, Variants & dynamically calculate averageRating from ProductReview
    let results = await Promise.all(allProducts.map(async (p) => {
      const media = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
      const cat = await Category.findById(p.category_id).select('name slug');
      const reviews = await ProductReview.find({ product_id: p._id });
      const variants = await ProductVariant.find({ product_id: p._id });
      const avgRating = reviews.length > 0 
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 5.0;

      const soldData = await OrderItem.aggregate([
        { $match: { product_id: p._id } },
        { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' } },
        { $unwind: '$order' },
        { $match: { 'order.status': 'delivered' } },
        { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
      ]);
      const totalSold = soldData.length > 0 ? soldData[0].totalSold : 0;

      const pObj = p.toObject();
      delete pObj.average_rating;

      return {
        ...pObj,
        averageRating: avgRating,
        reviewCount: reviews.length,
        soldCount: totalSold,
        media: media.map(m => m.media_url),
        category: cat,
        variants
      };
    }));

    // 4. Rating Filter in JS
    if (rating) {
      results = results.filter(p => p.averageRating >= Number(rating));
    }

    // Color Filter
    if (color) {
      const targetColor = String(color).toLowerCase();
      results = results.filter(p => {
        if (!p.variants || p.variants.length === 0) return false;
        return p.variants.some(v => {
          if (!v.attributes) return false;
          const cAttr = v.attributes.color || v.attributes.Color || v.attributes.màu || v.attributes.Màu;
          if (!cAttr) return false;
          const val = String(cAttr).toLowerCase();
          if (targetColor === 'black') return val.includes('đen');
          if (targetColor === 'white') return val.includes('trắng');
          if (targetColor === 'blue') return val.includes('xanh') || val.includes('blue') || val.includes('navy');
          if (targetColor === 'grey') return val.includes('xám') || val.includes('bạc') || val.includes('be') || val.includes('vàng');
          return val === targetColor;
        });
      });
    }

    // Dimension Filter
    if (dimension) {
      const targetDim = String(dimension).toLowerCase();
      results = results.filter(p => {
        if (!p.variants || p.variants.length === 0) return false;
        return p.variants.some(v => {
          if (!v.attributes) return false;
          const dAttr = v.attributes.dimension || v.attributes.Dimension || v.attributes.size || v.attributes.Size || v.attributes.kích_thước || v.attributes.Kích_thước;
          if (!dAttr) return false;
          const val = String(dAttr).toLowerCase();
          if (targetDim === 'compact') return val === 's' || val === '28' || val === '30' || val.includes('0-6m') || val.includes('6-12m') || val.includes('compact');
          if (targetDim === 'standard') return val === 'm' || val === 'l' || val === '32' || val === '38' || val === '39' || val === '40' || val.includes('12-18m') || val.includes('tiêu chuẩn') || val.includes('free size') || val.includes('standard');
          if (targetDim === 'large') return val === 'xl' || val === '41' || val === '42' || val.includes('18-24m') || val.includes('large');
          return val === targetDim;
        });
      });
    }

    // 5. Sorting in JS
    if (sort === 'price_asc') {
      results.sort((a, b) => a.selling_price - b.selling_price);
    } else if (sort === 'price_desc') {
      results.sort((a, b) => b.selling_price - a.selling_price);
    } else if (sort === 'top_rated') {
      results.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sort === 'best_sellers') {
      results.sort((a, b) => b.soldCount - a.soldCount);
    } else if (sort === 'most_viewed') {
      results.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sort === 'biggest_discount') {
      results.sort((a, b) => {
        const discA = 1 - (a.selling_price / (a.mrp_price || a.selling_price));
        const discB = 1 - (b.selling_price / (b.mrp_price || b.selling_price));
        return discB - discA;
      });
    } else if (sort === 'oldest') {
      results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default: Newest
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 6. Pagination in JS
    const total = results.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedResults = results.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Products fetched successfully',
      data: toCamelCase(paginatedResults),
      meta: {
        pagination: {
          total,
          count: paginatedResults.length,
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

exports.getShopDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // 1. Fetch Shop by slug
    const shopRaw = await Shop.findOne({ slug });
    if (!shopRaw) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'Shop not found',
        data: null,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }

    // 2. Fetch all approved & active products of the shop
    const productsRaw = await Product.find({
      shop_id: shopRaw._id,
      approval_status: 'approved',
      is_active: true
    });

    // 3. For each product, attach media, variants, rating, and soldCount
    const products = await Promise.all(productsRaw.map(async (p) => {
      const media = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
      const reviews = await ProductReview.find({ product_id: p._id });
      const avgRating = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 5.0;

      const soldData = await OrderItem.aggregate([
        { $match: { product_id: p._id } },
        { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' } },
        { $unwind: '$order' },
        { $match: { 'order.status': 'delivered' } },
        { $group: { _id: null, totalSold: { $sum: '$quantity' } } }
      ]);
      const totalSold = soldData.length > 0 ? soldData[0].totalSold : 0;

      const pObj = p.toObject();
      delete pObj.average_rating;

      return {
        ...pObj,
        averageRating: avgRating,
        reviewCount: reviews.length,
        soldCount: totalSold,
        media: media.map(m => m.media_url)
      };
    }));

    // 4. Group products
    // a. All Products (sorted by newest)
    const allProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // b. Best Sellers (sorted by soldCount desc)
    const bestSellers = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 10);

    // c. Deep Discounts (sorted by discount percentage desc)
    const deepDiscounts = products
      .filter(p => p.mrp_price && p.mrp_price > p.selling_price)
      .sort((a, b) => {
        const discA = 1 - (a.selling_price / a.mrp_price);
        const discB = 1 - (b.selling_price / b.mrp_price);
        return discB - discA;
      })
      .slice(0, 10);

    // 5. Calculate average shop rating dynamically from all products
    const shopRating = products.length > 0
      ? Number((products.reduce((acc, p) => acc + p.averageRating, 0) / products.length).toFixed(1))
      : 5.0;

    const shop = {
      ...shopRaw.toObject(),
      rating: shopRating
    };

    res.status(200).json({
      success: true,
      code: 200,
      message: 'Shop details fetched successfully',
      data: toCamelCase({
        shop,
        bestSellers,
        deepDiscounts,
        allProducts
      }),
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    next(error);
  }
};
