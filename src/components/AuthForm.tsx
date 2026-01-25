import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AuthFormProps {
    onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [localError, setLocalError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { signIn, signUp, isLoading } = useStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        try {
            if (mode === 'signup') {
                await signUp(email, password, fullName);
                // Show email confirmation message instead of closing
                setShowConfirmation(true);
            } else {
                await signIn(email, password);
                // Sign in closes modal immediately
                onSuccess?.();
            }
        } catch (error) {
            setLocalError(error instanceof Error ? error.message : 'Authentication failed');
        }
    };

    // Show email confirmation message after signup
    if (showConfirmation) {
        return (
            <div className="auth-form">
                <div className="auth-confirmation">
                    <CheckCircle size={48} className="confirmation-icon" />
                    <h3>Check your email!</h3>
                    <p>We've sent a confirmation link to:</p>
                    <p className="confirmation-email">{email}</p>
                    <p className="confirmation-note">
                        Click the link in the email to activate your account, then you can sign in.
                    </p>
                    <button
                        type="button"
                        className="btn btn-primary btn-lg auth-submit"
                        onClick={() => {
                            setShowConfirmation(false);
                            setMode('signin');
                        }}
                    >
                        <Mail size={18} />
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-form">
            <div className="auth-tabs">
                <button
                    className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
                    onClick={() => setMode('signin')}
                    type="button"
                >
                    Sign In
                </button>
                <button
                    className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                    onClick={() => setMode('signup')}
                    type="button"
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {mode === 'signup' && (
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter your name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="input-group">
                    <label className="input-label">Email</label>
                    <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            className="input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Password</label>
                    <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            className="input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                {localError && (
                    <div className="auth-error">
                        {localError}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary btn-lg auth-submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                        </>
                    ) : (
                        <>
                            {mode === 'signin' ? 'Sign In' : 'Create Account'}
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <p className="auth-switch">
                {mode === 'signin' ? (
                    <>
                        Don't have an account?{' '}
                        <button type="button" onClick={() => setMode('signup')}>
                            Sign up
                        </button>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <button type="button" onClick={() => setMode('signin')}>
                            Sign in
                        </button>
                    </>
                )}
            </p>
        </div>
    );
}
