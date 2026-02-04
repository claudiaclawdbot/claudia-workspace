import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnAgent } from '../../lib/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, task, priority } = req.body;
    
    if (!name || !task) {
      return res.status(400).json({ error: 'Name and task are required' });
    }
    
    const result = await spawnAgent(name, task, priority || 'normal');
    
    if (result.success) {
      res.status(201).json({ success: true, agentId: result.agentId });
    } else {
      res.status(500).json({ error: result.error || 'Failed to spawn agent' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to spawn agent' });
  }
}