const Notification = require('../models/Notification');
const response = require('../utils/response');

exports.getNotifications = async (req, res) => {
  try {
    let notifications = [];
    if (req.user) {
      notifications = await Notification.find({ user_id: req.user._id }).sort({ createdAt: -1 }).lean();
      notifications = notifications.map(n => ({ ...n, id: n._id.toString() }));
    }



    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Successfully fetched notifications',
      data: notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Server error while fetching notifications',
      data: []
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      // Hỗ trợ cả user đăng nhập lẫn fallback data khi test
      const query = req.user ? { _id: id, user_id: req.user._id } : { _id: id };
      await Notification.findOneAndUpdate(query, { is_read: true });
    }
    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Marked as read'
    });
  } catch (error) {
    console.error('Mark As Read Error:', error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal server error'
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    if (req.user) {
      await Notification.updateMany({ user_id: req.user._id }, { is_read: true });
    } else {
      await Notification.updateMany({}, { is_read: true });
    }
    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Marked all as read'
    });
  } catch (error) {
    console.error('Mark All As Read Error:', error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal server error'
    });
  }
};

exports.clearAll = async (req, res) => {
  try {
    if (req.user) {
      await Notification.deleteMany({ user_id: req.user._id });
    }
    return res.status(200).json({
      success: true,
      code: 200,
      message: 'Cleared all notifications'
    });
  } catch (error) {
    console.error('Clear All Error:', error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: 'Internal server error'
    });
  }
};
