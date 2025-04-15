import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

/**
 * @swagger
 * /auditlog:
 *   get:
 *     description: Returns all audit logs
 *     responses:
 *       200:
 *         description: All audit logs returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const auditLogs = await prisma.auditLogs.findMany();
    res.send(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).send({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * @swagger
 * /auditLog:
 *   post:
 *     description: Creates a new audit log entry
 *     parameters:
 *       - in: body
 *         name: auditLog
 *         description: The audit log details.
 *         schema:
 *           type: object
 *           required:
 *             - ssoId
 *             - action
 *             - table
 *             - details
 *           properties:
 *             ssoId:
 *               type: string
 *             action:
 *               type: string
 *               enum: [CREATE, READ, UPDATE, DELETE]
 *             table:
 *               type: string
 *             details:
 *               type: object
 *     responses:
 *       200:
 *         description: Audit log created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  const { ssoId, action, table, details } = req.body;

  // Validate required fields
  if (!ssoId || !action || !table || !details) {
    return res.status(400).send({ error: 'Missing required fields: ssoId, action, table, or details' });
  }

  try {
    const auditLog = await prisma.auditLogs.create({
      data: {
        ssoId,
        Action: action,
        Table: table,
        Details: details,
      },
    });
    res.status(200).send(auditLog);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).send({ error: 'Failed to create audit log' });
  }
});

export default router;
