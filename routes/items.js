import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

/**
 * @swagger
 * /items:
 *   get:
 *     description: Returns all items
 *     responses:
 *       200:
 *         description: All items returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  const items = await prisma.items.findMany();
  res.send(items);
});

/**
 * @swagger
 * /items:
 *   get:
 *     description: Creates new item
 *     responses:
 *       200:
 *         description: New item created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/', jsonParser, async (req, res) => {
  const body = req.body;
  const item = await prisma.items.create({
    data: {
      name: body.name,
    },
    select: {
      id: true,
      name: true,
    },
  });
  res.send(item);
});

/**
 * @swagger
 * /items/loan:
 *   post:
 *     description: Creates new loan entry
 *     responses:
 *       200:
 *         description: Item loaned successfully
 *       500:
 *         description: Internal server error
 */
router.post('/loan', jsonParser, async (req, res) => {
  const body = req.body;
  let response = await loanItem(body.userId, body.itemId);
  res.send(response);
});

/**
 * @swagger
 * /items/return:
 *   post:
 *     description: Moves loan entry to history
 *     responses:
 *       200:
 *         description: Loan entry moved to history successfully
 *       500:
 *         description: Internal server error
 */
router.post('/return', jsonParser, async (req, res) => {
  const body = req.body;
  let response = await returnItem(body.itemId);
  //let response = await returnItem('ad7bc101-276a-43d5-a907-3b8e0be16022');
  res.send(response);
});

async function loanItem(userId, itemId) {
  let response;
  try {
    response = await prisma.loanedItems.create({
      data: {
        userId: userId,
        itemId: itemId,
        locationId: '285aa0e8-5e37-4883-8d05-6f064288b89f',
      },
      select: {
        loanId: true,
      },
    });
  } catch (e) {
    response = e;
  }
  return response;
}

async function returnItem(itemId) {
  let response;
  try {
    let row = await prisma.loanedItems.findFirst({
      where: {
        itemId: itemId,
      },
      select: {
        userId: true,
        loanedDate: true,
        locationId: true,
      },
    });
    response = await prisma.$transaction([
      prisma.loanedItems.delete({
        where: {
          itemId: itemId,
        },
        select: {
          loanId: true,
        },
      }),
      prisma.loanedItemsHistory.create({
        data: {
          userId: row.userId,
          itemId: itemId,
          loanedDate: row.loanedDate,
          locationId: row.locationId,
        },
      }),
    ]);
  } catch (e) {
    response = e;
  }
  return response;
}

export default router;
