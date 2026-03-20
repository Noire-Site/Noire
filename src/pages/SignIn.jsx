import { SignIn } from '@clerk/react';

export default function SignInPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </main>
  );
}
