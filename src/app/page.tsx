"use client";

import { ArrowRight, Award, FileCheck, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Green Gradient */}
      <section className="relative py-20 md:py-32 overflow-hidden h-vh">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-teal-50 dark:from-green-950/30 dark:via-green-900/20 dark:to-teal-950/30 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-400/20 rounded-full blur-3xl dark:bg-green-700/20" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl dark:bg-teal-700/20" />
        
        <div className="container max-w-3xl px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">
                Secure Digital Certificates on the Blockchain
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-400">
                Issue, verify, and manage tamper-proof certificates with DeCerts - the decentralized certification platform built on Solana.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/issue" className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-teal-600 px-6 text-sm font-medium text-white shadow transition-colors hover:bg-gradient-to-r hover:from-green-700 hover:to-teal-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                Issue Certificate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/verify" className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background/60 backdrop-blur-sm px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                Verify Certificate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-6 md:gap-10 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Why Choose DeCerts?
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-lg dark:text-gray-400">
                  Our platform leverages blockchain technology to provide secure, verifiable, and immutable digital certificates.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Tamper-Proof</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Once issued, certificates cannot be altered or forged, ensuring complete authenticity.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-full">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Instant Verification</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Verify any certificate in seconds with our simple verification tool.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-full">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Decentralized</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Built on Solana blockchain for speed, security, and low transaction costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tl from-green-50 via-transparent to-transparent dark:from-green-950/30 dark:via-transparent dark:to-transparent -z-10" />
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Get Started?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-lg dark:text-gray-400">
                Connect your wallet and start issuing or verifying blockchain certificates today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/issue" className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-teal-600 px-6 text-sm font-medium text-white shadow transition-colors hover:bg-gradient-to-r hover:from-green-700 hover:to-teal-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}