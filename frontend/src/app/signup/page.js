import AuthForm from '../../components/AuthForm';
import { BookOpen } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-cream">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand text-surface rounded-2xl shadow-sm mb-1">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Raj Exam AI</h1>
          <p className="text-muted text-sm">
            Join Rajasthan's fastest daily exam preparation digest
          </p>
        </div>

        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
