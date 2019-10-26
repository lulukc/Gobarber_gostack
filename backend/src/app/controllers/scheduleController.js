import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

import Appointmen from '../models/Appointmen';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({
      where: { id: req.userID, provider: true },
    });
    if (!checkUserProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    const { date } = req.query;
    const parceDate = parseISO(date);

    const appointmen = await Appointmen.findAll({
      where: {
        provider_id: req.userID,
        canseled_at: null,
        date: {
          [Op.between]: [startOfDay(parceDate), endOfDay(parceDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointmen);
  }
}

export default new ScheduleController();
