'use client';
import { Form, TextInput } from '@/components/form';
import BgImage from '../../../public/loginBg.jpeg';
import AppLogo from '../../../public/MedicoreLogoLarge.png';
import Image from 'next/image';
import { useForm } from '@tanstack/react-form';
import ButtonSecondary from '@/components/buttons/buttonSecondary';
import { IconLogin } from '@/components/icons/icons';

interface LoginUser {
  email: string;
  password: string;
}
const defaultUser: LoginUser = {
  email: '',
  password: '',
};

export default function Login() {
  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultUser,
    onSubmit: async ({ value }) => {
      console.log(value);
      reset();
    },
  });

  return (
    <main className="relative w-full min-h-screen flex items-center justify-center">
      <Image
        src={BgImage}
        alt="bg"
        fill
        className="fixed top-0 left-0 -z-50 object-cover"
      />
      <div className="bg-panel-light flex flex-row flex-wrap lg:w-[90%] md:w-[65%] h-fit border-default border-border-primary drop-shadow-default">
        <div className="lg:w-[50%] md:w-full sm:w-full object-fill flex flex-col gap-12 bg-background p-14 rounded-tr-large rounded-br-large border-r-default border-border-primary">
          <Image src={AppLogo} alt="Logo" className="w-full" priority />
          <p className="text-default text-left">
            Securely log in to access your hospital&apos;s dashboard, manage
            patients, appointments, staff, and medical records, all in one
            unified platform designed for seamless healthcare operations.
          </p>
          <p className="text-small">© 2025- Shadeer Abdullah</p>
        </div>
        <div className="lg:w-[50%] md:w-full sm:w-full bg-transparent flex items-center justify-center py-14">
          <Form action={handleSubmit} tw="w-fit flex flex-col items-center">
            <Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Email is required!' : undefined,
              }}
            >
              {(field) => {
                return (
                  <TextInput
                    name={field.name}
                    required={true}
                    onChange={(value) => field.handleChange(value)}
                    value={field.state.value}
                    error={field.state.meta.errorMap.onChange ?? ''}
                  />
                );
              }}
            </Field>

            <Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  !value ? 'Password is required!' : undefined,
              }}
            >
              {(field) => {
                return (
                  <TextInput
                    name={field.name}
                    required={true}
                    onChange={(value) => field.handleChange(value)}
                    value={field.state.value}
                    error={field.state.meta.errorMap.onChange ?? ''}
                  />
                );
              }}
            </Field>

            <Subscribe>
              <ButtonSecondary
                type="submit"
                initialState="active"
                buttonText="Login"
                withIcon
                icon={IconLogin}
                onClick={() => {}}
                tw="w-full"
              />
            </Subscribe>
          </Form>
        </div>
      </div>
    </main>
  );
}
