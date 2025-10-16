"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Gallery", href: "/dashboard" },
  { name: "Upload", href: "/dashboard/upload" },
];

export default function DashboardNav({
  userName,
  userRole,
}: {
  userName?: string | null;
  userRole?: string;
}) {
  const pathname = usePathname();

  function handleSignOut() {
    signOut({ callbackUrl: "/auth/login" });
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="The Care Ranch"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
                <h1 className="text-xl font-bold text-gray-900">
                  Media Platform
                </h1>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    pathname === item.href
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-sm text-gray-700">
                {userName}{" "}
                {userRole && (
                  <span className="text-xs text-gray-500">({userRole})</span>
                )}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-4 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
