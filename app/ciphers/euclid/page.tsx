"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"

export default function ExtendedEuclid() {
  const [a, setA] = useState("")
  const [m, setM] = useState("")
  const [result, setResult] = useState<number | null>(null)
  const [steps, setSteps] = useState<string[]>([])
  const [error, setError] = useState("")

  const calculateInverse = async() => {
    const numA = Number.parseInt(a)
    const numM = Number.parseInt(m)

    // Validate inputs
    if (isNaN(numA) || isNaN(numM)) {
      setError("Please enter valid numbers")
      setResult(null)
      setSteps([])
      return
    }

    if (numM <= 0) {
      setError("Modulus must be a positive integer")
      setResult(null)
      setSteps([])
      return
    }

    // Check if a and m are coprime
    // Compute extended GCD
    const gcdResult = extendedGCD(numA, numM)
    if (gcdResult.gcd !== 1) {
      setError(`${numA} and ${numM} are not coprime (gcd = ${gcdResult.gcd}). Modular inverse does not exist.`)
      setResult(null)
      setSteps(gcdResult.steps)
      return
    }

    // Compute modular inverse
    let inverse = gcdResult.x % numM
    if (inverse < 0) inverse += numM

    setResult(inverse)
    setError("")
    setSteps(gcdResult.steps)

    // Record to history
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          cipher_type: 'euclid',
          plaintext: a,
          encrypted_text: inverse.toString(),
          key_a: numA,
          key_b: numM,
          operation: 'inverse'
        })
      })
    } catch (err) {
      console.error('Failed to save history:', err)
    }
  }

  // Extended Euclidean Algorithm
  const extendedGCD = (a: number, b: number) => {
    const steps: string[] = []
    steps.push(`Finding the modular inverse of ${a} modulo ${b} using the Extended Euclidean Algorithm`)

    if (b === 0) {
      steps.push(`gcd(${a}, 0) = ${a}`)
      return { gcd: a, x: 1, y: 0, steps }
    }

    let old_r = a, r = b
    let old_s = 1, s = 0
    let old_t = 0, t = 1
    steps.push(`Initial: r₀=${old_r}, r₁=${r}, s₀=${old_s}, s₁=${s}, t₀=${old_t}, t₁=${t}`)

    let iteration = 1
    while (r !== 0) {
      const q = Math.floor(old_r / r)
      steps.push(`Iteration ${iteration}: ${old_r} = ${q}×${r} + ${old_r - q*r}`)
      ;[old_r, r] = [r, old_r - q*r]
      ;[old_s, s] = [s, old_s - q*s]
      ;[old_t, t] = [t, old_t - q*t]
      steps.push(`  r=${r}, s=${s}, t=${t}`)
      iteration++
    }
    steps.push(`GCD = ${old_r}`)
    if (old_r === 1) {
      steps.push(`Bézout: s=${old_s}, t=${old_t}`)
      steps.push(`Inverse of ${a} mod ${b} is ${old_s < 0 ? old_s + b : old_s}`)
    } else {
      steps.push(`No inverse since gcd ≠ 1`)
    }
    return { gcd: old_r, x: old_s, y: old_t, steps }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700">Extended Euclidean Algorithm</h1>
        <p className="mt-2 text-gray-600">Calculate the modular multiplicative inverse of an integer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-700">Calculate Modular Inverse</CardTitle>
            <CardDescription>Find x such that (a × x) ≡ 1 (mod m)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="a-value">Value of a</Label>
                <Input
                  id="a-value"
                  type="number"
                  placeholder="Enter an integer"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="m-value">Modulus (m)</Label>
                <Input
                  id="m-value"
                  type="number"
                  placeholder="Enter modulus"
                  value={m}
                  onChange={(e) => setM(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={calculateInverse}
                disabled={!a || !m}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
              >
                <Calculator className="mr-2 h-4 w-4" /> Calculate Inverse
              </Button>
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

            {result !== null && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                <p className="font-medium">Modular Inverse:</p>
                <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{result}</p>
                <p className="text-sm text-gray-600 mt-2">
                  ({a} × {result}) mod {m} = 1
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Step-by-Step Calculation</CardTitle>
            <CardDescription>See how the Extended Euclidean Algorithm works</CardDescription>
          </CardHeader>
          <CardContent>
            {steps.length > 0 ? (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Calculate an inverse to see the step-by-step explanation</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-emerald-700">How It Works</CardTitle>
            <CardDescription>Understanding the Extended Euclidean Algorithm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">Modular Inverse</h3>
                <p className="mt-1">
                  The modular multiplicative inverse of an integer a modulo m is an integer x such that:
                </p>
                <p className="p-3 bg-blue-50 rounded-md mt-2 text-center font-mono">(a × x) ≡ 1 (mod m)</p>
                <p className="mt-2">
                  A modular inverse exists if and only if a and m are coprime (their greatest common divisor is 1).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg">Extended Euclidean Algorithm</h3>
                <p className="mt-1">The Extended Euclidean Algorithm finds integers x and y such that:</p>
                <p className="p-3 bg-blue-50 rounded-md mt-2 text-center font-mono">ax + my = gcd(a, m)</p>
                <p className="mt-2">When gcd(a, m) = 1, the value of x is the modular inverse of a modulo m.</p>
              </div>

              <div>
                <h3 className="font-bold text-lg">Applications in Cryptography</h3>
                <p className="mt-1">Modular inverses are essential in various cryptographic algorithms, including:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>RSA encryption and decryption</li>
                  <li>Elliptic Curve Cryptography</li>
                  <li>Digital signatures</li>
                  <li>The Affine cipher (for decryption)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

