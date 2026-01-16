import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
    title = 'Something went wrong',
    message = 'We encountered an error. Please try again.',
    onRetry
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="primary">
                    Try Again
                </Button>
            )}
        </div>
    );
}
