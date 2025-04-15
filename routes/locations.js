import prisma from '../services/dbservice.js';
import express from 'express';
//import authenticate from '../middleware/authtoken.js';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

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
  const locations = await prisma.locations.findMany();
  res.send(locations);
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
 *                type: string
 *                description: The description of the location to create.
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
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  // Validate the request body
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).send({ error: 'Location name is required and must be a non-empty string' });
  }

  try {
    const location = await prisma.locations.upsert({
      where: { name: name.trim() },
      update: { description: description?.trim() || null },
      create: { name: name.trim(), description: description?.trim() || null }, // Create with name and optional description
    });

    res.status(200).send(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).send({ error: 'Failed to create location' });
  }
});

/**router.post('/', async (req, res) => {
  const { name, description } = req.body;

  // Extract the user from the request (populated by auth middleware)
  const ssoId = req.user?.ssoId || 'unknown'; // Replace 'unknown' with a fallback value if no user is found

  // Validate the request body
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).send({ error: 'Location name is required and must be a non-empty string' });
  }

  try {
    // Create or update the location
    const location = await prisma.locations.upsert({
      where: { name: name.trim() },
      update: { description: description?.trim() || null },
      create: { name: name.trim(), description: description?.trim() || null },
    });

    // Log the creation in the audit log
    await prisma.auditLogs.create({
      data: {
        ssoId, // Use the user ID from the request
        Action: 'CREATE',
        Table: 'Locations',
        Details: {
          locationName: location.name,
          description: location.description,
        },
      },
    });

    res.status(200).send(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).send({ error: 'Failed to create location' });
  }
});*/

export default router;
