import * as Yup from 'yup';
import { parseISO, startOfHour } from 'date-fns';
import Appointmen from '../models/Appointmen';
import User from '../models/User';

class AppointmenController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { provider_id, date } = req.body;
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    const appointmen = await Appointmen.create({
      user_id: req.userID,
      provider_id,
      date,
    });
    return res.json(appointmen);
  }
}

export default new AppointmenController();
