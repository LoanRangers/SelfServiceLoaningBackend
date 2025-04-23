import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

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
router.post('/', authenticateJWT, async (req, res) => {
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
router.delete('/:id', authenticateJWT, async (req, res) => {
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
router.post('/loan/:itemId', authenticateJWT, async (req, res) => {
  const params = req.params;
  let response = await loanItem(req.user, [params.itemId]);
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
router.post('/return/:itemId', authenticateJWT, async (req, res) => {
  const params = req.params;
  const body = req.body;
  let response = await returnItem(req.user, params.itemId, body.locationName);
  res.send(response);
});

router.post('/loanhistory', authenticateJWT, async (req, res) => {
  const body = req.body;
  let response = await loanHistory(req.user, body.page, body.maxItems);
  res.send(response);
});

router.post('/currentlyloaned', authenticateJWT, async (req, res) => {
  const body = req.body;
  let response = await currentlyLoaned(req.user, body.page, body.maxItems);
  res.send(response);
});

/**
 * @swagger
 * /items/return:
 *   post:
 *     description: Audit log
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.post('/auditlog', async (req, res) => {
  const body = req.body;
  let response = await auditLog(body.user, body.page);
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

async function createItem(itemName, itemDescription, categoryName, location, manufacturedYear) {
  let response;
  try {
    // Ensure the location exists or create it
    await prisma.locations.upsert({
      where: { name: location },
      update: {}, // If it exists, do nothing
      create: { name: location }, // If it doesn't exist, create it
    });

    // Create the item without referencing the category
    response = await prisma.items.create({
      data: {
        name: itemName,
        description: itemDescription,
        currentLocation: location,
        manufacturedYear: parseInt(manufacturedYear),
        category: categoryName,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    await prisma.auditLogs.create({
      data: {
        ssoId: userId,
        Action: 'CREATE_ITEM',
        Table: 'Items',
        Details: {
          name: itemName,
          category: categoryNames,
        },
      },
    });
    // Log the audit entry
    /*
    await prisma.auditLogs.create({
      data: {
        ssoId: 'system', // Replace with the actual user ID performing the action
        Action: 'CREATE',
        Table: 'Items',
        Details: {
          itemId: response.id,
          itemName: itemName,
          itemDescription: itemDescription,
          location: location,
          manufacturedYear: manufacturedYear,
        },
      },
    });
    */
  } catch (e) {
    console.error('Error in createItem:', e); // Log the error for debugging
    response = { error: e.message };
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
    await prisma.auditLogs.create({
      data: {
        ssoId: userId,
        Action: 'DELETE_ITEM',
        Table: 'Items',
        Details: { device: itemId },
      },
    });

    // Log the audit entry
    /*
    await logAudit(null, 'DELETE_ITEM', null, {
      itemId: itemId,
      itemName: item?.name,
      itemDescription: item?.description,
    });
    */
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function loanItem(userId, items) {
  let response;
  try {
    items.map(async (itemId) => {
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
      await prisma.items.update({
        data: {
          isAvailable: false,
          currentLocation: 'With User',
        },
        where: {
          id: itemId,
        },
      });
      await prisma.auditLogs.create({
        data: {
          ssoId: userId,
          Action: 'LOAN_DEVICE',
          Table: 'LoanedItem',
          Details: { device: itemId },
        },
      });
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function returnItem(userId, itemId, locationName) {
  let response;
  try {
    let row = await prisma.loanedItems.findFirst({
      where: {
        itemId: itemId,
      },
      select: {
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
          userId: userId,
          itemId: itemId,
          loanedDate: row.loanedDate,
          locationName: locationName,
        },
      }),
      prisma.items.update({
        data: {
          isAvailable: true,
          currentLocation: locationName,
        },
        where: {
          id: itemId,
        },
      }),
    ]);
    await prisma.auditLogs.create({
      data: {
        ssoId: userId,
        Action: 'RETURN_DEVICE',
        Table: 'LoanedItem',
        Details: { device: itemId },
      },
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function auditLog(userId, pageNumber) {
  let response;
  try {
    response = await prisma.auditLog.findMany({
      skip: (pageNumber - 1) * 10,
      take: 10,
      where: { userId: userId },
      select: {
        LogId: true,
        Action: true,
        Table: true,
        Details: true,
        timestamp: true,
      },
    });
  } catch (e) {
    response = e;
    console.log(e);
  }
  return response;
}

async function loanHistory(userId, pageNumber, maxItems) {
  let response;
  try {
    response = await prisma.loanedItemsHistory.findMany({
      skip: (pageNumber - 1) * maxItems,
      take: maxItems,
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

async function currentlyLoaned(userId, pageNumber, maxItems) {
  let response;
  try {
    response = await prisma.loanedItems.findMany({
      skip: (pageNumber - 1) * maxItems,
      take: maxItems,
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
