import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /qrcodes:
 *   get:
 *     description: Returns all QR codes
 *     responses:
 *       200:
 *         description: All QR codes returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const qrCodes = await prisma.qRCodes.findMany();
    res.status(200).send(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).send({ error: 'Failed to fetch QR codes' });
  }
});

router.get('/generate/:count', authenticateJWT, async (req, res) => {
  const params = req.params;
  try {
    const qrCodes = await prisma.qRCodes.createManyAndReturn({
      data: Array.from({ length: params.count }, () => ({})),
    });
    res.status(200).send(qrCodes);
  } catch (error) {
    console.error('Error generating QR codes: ', error);
    res.status(500).send({ error: 'Failed to generate QR codes' });
  }
});

router.get('/item/:id', authenticateJWT, async (req, res) => {
  const params = req.params;
  try {
    let item = await prisma.items.findFirst({
      where: { qr: parseInt(params.id) },
    });
    res.status(200).send(item);
  } catch (error) {
    console.error('Failed to get item by qr', error);
    res.status(500).send({ error: 'Failed to get item by qr' });
  }
});

router.get('/location/:id', authenticateJWT, async (req, res) => {
  const params = req.params;
  try {
    let item = await prisma.locations.findFirst({
      where: { qr: parseInt(params.id) },
    });
    res.status(200).send(item);
  } catch (error) {
    console.error('Failed to get location by qr', error);
    res.status(500).send({ error: 'Failed to get location by qr' });
  }
});

router.get('/id', authenticateJWT, async (req, res) => {
  try {
    const id = await prisma.qRCodes.aggregate({
      _max: {
        id: true,
      },
    });
    res.status(200).send(id);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get latest qr Id' });
  }
});

/**
 * @swagger
 * /qrcodes:
 *   post:
 *     description: Create new QR codes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - guid
 *                 - name
 *               properties:
 *                 guid:
 *                   type: string
 *                   description: The unique GUID for the QR code.
 *                 name:
 *                   type: string
 *                   description: The name of the QR code.
 *     responses:
 *       200:
 *         description: QR codes created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const qrCodes = req.body;

  if (!Array.isArray(qrCodes) || qrCodes.some((qr) => !qr.guid || !qr.name)) {
    return res.status(400).send({ error: 'Invalid request body. Each QR code must have a guid and name.' });
  }

  try {
    const createdQRCodes = await prisma.qRCodes.createMany({
      data: qrCodes.map((qr) => ({
        guid: qr.guid,
        name: qr.name,
      })),
      skipDuplicates: true, // Avoid duplicate GUIDs
    });

    res.status(200).send({ message: 'QR codes created successfully', count: createdQRCodes.count });
  } catch (error) {
    console.error('Error creating QR codes:', error);
    res.status(500).send({ error: 'Failed to create QR codes' });
  }
});

export default router;
