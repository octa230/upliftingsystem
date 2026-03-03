const start = new Date('2026-02-01T00:00:00.000Z');
const end   = new Date('2026-03-01T00:00:00.000Z');

const damages = await Transaction.aggregate([
  {
    $match: {
      type: 'damage',
      createdAt: { $gte: start, $lt: end }
    }
  },
  {
    $group: {
      _id: '$product',
      productName: { $first: '$productName' },
      totalDamaged: { $sum: '$quantity' },
      totalValue: { $sum: { $multiply: ['$purchasePrice', '$quantity'] } }
    }
  },
  { $sort: { totalDamaged: -1 } }
]);