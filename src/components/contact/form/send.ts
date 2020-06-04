import ky from 'ky';
import formurlencoded from 'form-urlencoded';

interface FormValues {
  name: string;
  email: string;
  message: string;
}

export async function sendForm(formValues: FormValues): Promise<void> {
  await ky.post('/', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({ 'form-name': 'contact', ...formValues }),
  });
}
