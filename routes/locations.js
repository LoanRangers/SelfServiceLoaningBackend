import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /locations:
 *   get:
 *     description: Returns all locations
 *     responses:
 *       200:
 *         description: All locations returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const locations = await prisma.locations.findMany();
    res.status(200).send(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).send({ error: 'Failed to fetch locations' });
  }
});

/**
 * @swagger
 * /locations:
 *   post:
 *     description: Create a new location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the location to create.
 *               description:
 *                 type: string
 *                 description: The description of the location to create.
 *     responses:
 *       200:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Location name is required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const body = req.body;
  console.log(body);
  let response = await createLocation(body, req.user);
  res.send(response);
});

async function createLocation(locationData, userId) {
  let response;
  try {
    const { name, description } = locationData;

    // Validate the location name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Location name is required and must be a non-empty string.');
    }

    // Upsert the location
    const location = await prisma.locations.upsert({
      where: { name: name.trim() },
      update: { description: description?.trim() || null },
      create: { name: name.trim(), description: description?.trim() || null },
    });

    // Audit Log
    await prisma.auditLogs.create({
      data: {
        ssoId: userId,
        Action: 'CREATE',
        Table: 'Locations',
        Details: {
          locationId: location.id,
          name: location.name,
          description: location.description,
        },
      },
    });

    response = location;
  } catch (error) {
    console.error('Error in createLocation:', error);
    response = { error: error.message };
  }
  return response;
}

export default router;