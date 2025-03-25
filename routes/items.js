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
  let response = await readItems();
  res.send(response);
});

router.get('/id/:id?', async (req, res) => {
  const params = req.params;
  let response = await readItems(params.id);
  res.send(response);
});

router.get('/available', async (req, res) => {
  let response = await readAvailableItems();
  res.send(response);
});

router.get('/unavailable', async (req, res) => {
  let response = await readUnavailableItems();
  res.send(response);
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
  console.log(body);
  let response = await createItem(body.name, body.description, body.category, body.location, body.manufacturedYear);
  res.send(response);
});

/**
 * @swagger
 * /items:
 *   delete:
 *     description: Deletes item
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
  const params = req.params;
  let response = await deleteItem(params.id);
  res.send(response);
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
router.post('/loan/:itemId', jsonParser, async (req, res) => {
  const params = req.params;
  const body = req.body;
  let response = await loanItem(body.userId, params.itemId);
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
router.post('/return/:itemId', jsonParser, async (req, res) => {
  const params = req.params;
  const body = req.body;
  let response = await returnItem(params.itemId, body.locationName);
  res.send(response);
});

router.post('/loanhistory', jsonParser, async (req, res) => {
  const body = req.body;
  let response = await loanHistory(body.user, body.page);
  res.send(response);
});

async function readItems(itemId = '') {
  let response;
  try {
    response = itemId ? await prisma.items.findFirst({ where: { id: itemId } }) : await prisma.items.findMany();
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function readAvailableItems() {
  let response;
  try {
    response =
      await prisma.$queryRaw`SELECT "Items"."id","Items"."description","Items"."name" FROM "Items" LEFT JOIN "LoanedItems" ON "Items"."id"="LoanedItems"."itemId" WHERE "LoanedItems"."itemId" IS NULL`;
  } catch (e) {
    response = e;
    console.log(e);
  }
  console.log(response);
  return response;
}

async function readUnavailableItems() {
  let response;
  try {
    response = await prisma.loanedItems.findMany({
      include: {
        item: true,
      },
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function createItem(itemName, itemDescription, category, location, manufacturedYear) {
  let response;
  try {
    let existingCategory = await prisma.categories.findFirst({ where: { name: category } });
    if (!existingCategory) {
      await prisma.categories.create({ data: { name: category } });
    }
    let existingLocation = await prisma.locations.findFirst({ where: { name: location } });
    if (!existingLocation) {
      await prisma.locations.create({ data: { name: location } });
    }
    response = await prisma.items.create({
      data: {
        name: itemName,
        description: itemDescription,
        categoryName: category,
        currentLocation: location,
        manufacturedYear: parseInt(manufacturedYear),
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function deleteItem(itemId) {
  let response;
  try {
    response = await prisma.items.delete({
      where: {
        itemId: itemId,
      },
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function loanItem(userId, itemId) {
  let response;
  try {
    response = await prisma.loanedItems.create({
      data: {
        userId: userId,
        itemId: itemId,
        locationName: 'With User',
      },
      select: {
        loanId: true,
      },
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function returnItem(itemId, locationName) {
  let response;
  try {
    let row = await prisma.loanedItems.findFirst({
      where: {
        itemId: itemId,
      },
      select: {
        userId: true,
        loanedDate: true,
      },
    });
    response = await prisma.$transaction([
      prisma.loanedItems.delete({
        where: {
          itemId: itemId,
        },
      }),
      prisma.loanedItemsHistory.create({
        data: {
          userId: row.userId,
          itemId: itemId,
          loanedDate: row.loanedDate,
          locationName: locationName,
        },
      }),
    ]);
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function loanHistory(userId, pageNumber) {
  let response;
  try {
    response = await prisma.loanedItemsHistory.findMany({
      skip: (pageNumber - 1) * 10,
      take: 10,
      where: { userId: userId },
      include: { item: true },
      omit: {
        itemId: true,
        loanId: true,
        userId: true,
      },
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

export default router;
