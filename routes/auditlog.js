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
router.post('/logs', jsonParser, async (req, res) => {
  try {
    const body = req.body
    //const auditLogs = await prisma.auditLogs.findMany();
    const auditLogs = await auditLog(body.page)
    console.log(auditLogs)
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

async function auditLog(pageNumber) {
  let response;
  try {
    response = await prisma.auditLogs.findMany({
      skip: (pageNumber - 1) * 10,
      take: 10,
      select: {
        LogId: true,
        ssoId: true,
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

export default router;
