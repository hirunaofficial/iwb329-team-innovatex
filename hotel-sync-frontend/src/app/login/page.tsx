'use client';
import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { storeToken, getToken } from '@/lib/tokenManager';

interface Login {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<Login["email"]>("");
  const [password, setPassword] = useState<Login["password"]>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:9090/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      // Check for response status
      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid credentials. Please check your email and password.");
        } else {
          const errorData = await response.json();
          setError(errorData.message || "An error occurred. Please try again.");
        }
        return;
      }

      const data = await response.json();
      // Handle successful login
      storeToken(data.token);
      router.push("/");

    } catch (error) {
      setError("Network error. Please check your connection.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark w-full max-w-lg">
        <div className="w-full p-6 sm:p-12 xl:p-16">
          <h2 className="mb-9 text-3xl font-bold text-black dark:text-white text-center">
            Welcome to Hotel Sync
          </h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            Please sign in to continue managing your bookings and hotel services.
          </p>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                <span className="absolute right-4 top-4">
                  <FaEnvelope className="text-gray-500" />
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                />
                <span className="absolute right-4 top-4">
                  <FaLock className="text-gray-500" />
                </span>
              </div>
            </div>

            <div className="mb-5">
              <input
                type="submit"
                value="Sign In"
                className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;