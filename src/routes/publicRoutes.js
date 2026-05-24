const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

const { getOTPTemplate, getAlertTemplate } = require('../utils/emailTemplates');

router.get('/homepage', publicController.getHomepageData);
router.get('/categories', publicController.getCategories);
router.get('/products', publicController.searchProducts);
router.get('/product/:slug', publicController.getProductDetail);
router.get('/shop/:slug', publicController.getShopDetail);

router.get('/preview-email', (req, res) => {
  const type = req.query.type || 'reset';
  if (type === 'reset') {
    return res.send(getOTPTemplate(
      'Password Reset Request',
      'We received a request to reset your password for your UTEShop account. Please use the verification code below to reset your password.',
      '698821',
      10,
      'If you did not request a password reset, please safely ignore this email.',
      'red'
    ));
  } else if (type === '2fa') {
    return res.send(getOTPTemplate(
      'Two-Factor Auth Verification',
      'A login request was detected for your account. Please use the verification code below to proceed with two-factor authentication.',
      '123456',
      5,
      'If you did not make this request, please ignore this email.',
      'red'
    ));
  } else if (type === 'register') {
    return res.send(getOTPTemplate(
      'Verify Your Registration',
      'Thank you for registering with UTEShop. Please use the verification code below to complete your registration.',
      '789012',
      5,
      'If you did not request this code, please ignore this email.',
      'green'
    ));
  } else if (type === 'login') {
    return res.send(getAlertTemplate(
      'New Login Detected',
      'Hello Jane Doe, we detected a login to your account from a new device or location.',
      [
        { label: 'Time', value: new Date().toLocaleString('en-US') },
        { label: 'Device', value: 'Chrome on Windows' },
        { label: 'IP Address', value: '192.168.1.1' }
      ],
      'red',
      true
    ));
  } else if (type === 'success') {
    return res.send(getAlertTemplate(
      'Password Changed Successfully',
      'Hello Jane Doe, the password for your UTEShop account was successfully updated.',
      [
        { label: 'Date/Time', value: new Date().toLocaleString('en-US') },
        { label: 'Status', value: 'Completed Successfully' }
      ],
      'green',
      false
    ));
  }
  return res.status(400).send('Invalid preview type');
});

module.exports = router;
