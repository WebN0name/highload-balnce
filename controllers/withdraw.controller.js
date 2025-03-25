const { body, param, validationResult } = require('express-validator');
const withdrawService = require('../services/withdraw.service');

module.exports = {
    async withdraw(req, res) {
        await param('userId')
        .isUUID().withMessage('User ID must be a valid UUID')
        .run(req);
  
      await body('amount')
        .isNumeric().withMessage('Amount must be a number')
        .isFloat({ min: 1 }).withMessage('Amount must be greater than 0')
        .run(req);
  
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        const { userId } = req.params;
        const { amount } = req.body; 
    
        try {
          const result = await withdrawService.processWithdrawal(userId, amount);
          return res.status(200).json(result);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
    },
  };