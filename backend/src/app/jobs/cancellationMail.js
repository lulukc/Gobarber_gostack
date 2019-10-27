import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { appointmen } = data;
    console.log('afila execultou');

    await Mail.sendMail({
      to: `${appointmen.provider.name} <${appointmen.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellations',
      context: {
        provedor: appointmen.provider.name,
        user: appointmen.user.name,
        date: format(
          parseISO(appointmen.date),
          "'dia' dd 'de' MMMM', às' HH:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}
export default new CancellationMail();
