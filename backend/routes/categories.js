const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all categories for a user
// @route   GET /api/categories
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Transaction.distinct('category', { user: req.user._id });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    let dateQuery = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateQuery = { date: { $gte: startDate, $lte: endDate } };
    }

    const query = { user: req.user._id, type: 'expense', ...dateQuery };

    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
