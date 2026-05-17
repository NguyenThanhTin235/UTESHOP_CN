/**
 * Utility to convert object keys to camelCase
 */
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    // Handle Dates
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // If it's a Mongoose document, convert to plain object
    let plainObj = obj;
    if (typeof obj.toObject === 'function') {
      plainObj = obj.toObject();
    }

    // Handle ObjectId from Mongoose (if it's already a plain object with buffer/hex)
    if (plainObj.constructor && plainObj.constructor.name === 'ObjectId') {
      return plainObj.toString();
    }

    return Object.keys(plainObj).reduce((result, key) => {
      let val = plainObj[key];
      
      // Convert ObjectId values to string
      if (val && val.constructor && val.constructor.name === 'ObjectId') {
        val = val.toString();
      }

      let newKey = key;
      if (key === '_id') {
        newKey = 'id';
      } else if (key === '__v') {
        newKey = 'version';
      } else {
        newKey = key.replace(/([-_][a-z])/g, group =>
          group.toUpperCase().replace('-', '').replace('_', '')
        );
      }
      result[newKey] = toCamelCase(val);
      return result;
    }, {});
  }
  return obj;
};

/**
 * Format pagination metadata
 */
const formatMeta = (total, count, perPage, currentPage, apiVer = 'v1.0') => {
  return {
    pagination: {
      total,
      count,
      perPage,
      currentPage,
      totalPages: Math.ceil(total / perPage)
    },
    apiVer,
    timestamp: Math.floor(Date.now() / 1000)
  };
};

module.exports = {
  toCamelCase,
  formatMeta
};
