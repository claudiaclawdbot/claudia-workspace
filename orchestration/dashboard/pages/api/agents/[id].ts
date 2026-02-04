import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllAgentData, getAgentLogs } from '../../../lib/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }

  try {
    const data = await getAllAgentData();
    const agent = data.agents.find(a => a.id === id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.status(200).json(agent);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
}