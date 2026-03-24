'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupRedirectContent() {
    const router = useRouter();

    useEffect(() => {
        // We handle signup inside the /auth page with a toggle
        router.replace('/auth');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
    );
}

export default function SignupRedirect() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupRedirectContent />
        </Suspense>
    );
}
