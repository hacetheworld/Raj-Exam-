import AuthForm from '../../components/AuthForm';
import { BookOpen } from 'lucide-react';

export default function LoginPage({ searchParams }) {
  const isConfirmError = searchParams?.error === 'confirm';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-cream">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand text-surface rounded-2xl shadow-sm mb-1">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Raj Exam AI</h1>
          <p className="text-muted text-sm">
            Daily 2.5-minute audio digest + 5 MCQs for Rajasthan exams
          </p>
        </div>

        {isConfirmError && (
          <div className="p-4 bg-wrong-bg border border-wrong-border text-wrong-text rounded-xl text-sm text-center">
            That link is invalid or expired. Try logging in or sign up again.
          </div>
        )}

        <AuthForm mode="login" />
      </div>
    </div>
  );
}
