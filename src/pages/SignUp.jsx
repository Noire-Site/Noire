import { SignUp } from '@clerk/react';

export default function SignUpPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  );
}
