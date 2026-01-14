const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { month, year, category, type } = req.query;
    let query = { user: req.user._id };

    // Filter by month and year
    if (month && year) {
      const startDate = moment(`${year}-${month}-01`).startOf('month');
      const endDate = moment(startDate).endOf('month');
      query.date = { $gte: startDate.toDate(), $lte: endDate.toDate() };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('user', 'name');

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get transaction summary
// @route   GET /api/transactions/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateQuery = {};

    if (month && year) {
      const startDate = moment(`${year}-${month}-01`).startOf('month');
      const endDate = moment(startDate).endOf('month');
      dateQuery = { date: { $gte: startDate.toDate(), $lte: endDate.toDate() } };
    }

    const query = { user: req.user._id, ...dateQuery };

    const transactions = await Transaction.find(query);
    
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      categoryBreakdown: {},
      monthlyData: []
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
      } else {
        summary.totalExpenses += transaction.amount;
        
        // Category breakdown
        if (!summary.categoryBreakdown[transaction.category]) {
          summary.categoryBreakdown[transaction.category] = 0;
        }
        summary.categoryBreakdown[transaction.category] += transaction.amount;
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpenses;

    // Monthly data for charts
    const monthlyData = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    summary.monthlyData = monthlyData;

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', protect, [
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, amount, type, category, date, description } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || new Date(),
      description
    });

    const savedTransaction = await transaction.save();
    const populatedTransaction = await Transaction.findById(savedTransaction._id)
      .populate('user', 'name');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id', protect, [
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, amount, type, category, date, description } = req.body;

    transaction.title = title;
    transaction.amount = amount;
    transaction.type = type;
    transaction.category = category;
    transaction.date = date || transaction.date;
    transaction.description = description;

    const updatedTransaction = await transaction.save();
    const populatedTransaction = await Transaction.findById(updatedTransaction._id)
      .populate('user', 'name');

    res.json(populatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();

    res.json({ message: 'Transaction removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all transactions (DEVELOPMENT ONLY - Remove in production!)
// @route   GET /api/transactions/all
// @access  Private
router.get('/all', protect, async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }
    
    const transactions = await Transaction.find({}).populate('user', 'name email');
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
