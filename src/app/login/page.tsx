'use client';
import { Form, TextInput } from '@/components/input';
import BgImage from '../../../public/loginBg.jpeg';
import AppLogo from '../../../public/AppLogo.png';
import Image from 'next/image';
import { useForm } from '@tanstack/react-form';
import ButtonSecondary from '@/components/buttons/buttonSecondary';
import { IconLogin } from '@/components/icons/icons';
import { useAuth } from '_context';
import { LoginUserDto } from '@/types';
import { useEffect } from 'react';
import AppLoader from '@/components/misc/loader';
import { useRouter } from 'next/navigation';
import AppNotification from '@/components/misc/appNotification';

const defaultUser: LoginUserDto = {
  email: '',
  password: '',
};

export default function Login() {
  const { loginUser, isLoggedIn, error, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      console.log('Login Page: User already logged in!');
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { Field, Subscribe, reset, handleSubmit } = useForm({
    defaultValues: defaultUser,
    onSubmit: async ({ value }) => {
      loginUser(value);
      reset();
    },
  });

  return (
    <main className="relative w-full min-h-screen flex items-center justify-center">
      {error && <AppNotification notification={error} />}
      {isLoading && <AppLoader />}
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
          <Form action={handleSubmit} direction="col">
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
                    type="email"
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
                    type="password"
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
