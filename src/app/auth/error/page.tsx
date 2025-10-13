"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {error === "Configuration"
                ? "There is a problem with the server configuration."
                : error === "AccessDenied"
                ? "You do not have permission to sign in."
                : error === "Verification"
                ? "The verification token has expired or has already been used."
                : "An error occurred during authentication."}
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
