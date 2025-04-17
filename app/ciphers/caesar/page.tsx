"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Lock, Unlock, RefreshCw } from "lucide-react"

export default function CaesarCipher() {
  const [plaintext, setPlaintext] = useState("")
  const [ciphertext, setCiphertext] = useState("")
  const [shift, setShift] = useState(3)
  const [activeTab, setActiveTab] = useState("encrypt")
  const [stepByStep, setStepByStep] = useState<string[]>([])
  const [allShifts, setAllShifts] = useState<{ shift: number; text: string }[]>([])

  // Handle direct input for shift value
  const handleShiftInput = (value: string) => {
    const numValue = Number.parseInt(value) || 0
    // Apply modulo 26 to the input value
    setShift(((numValue % 26) + 26) % 26)
  }

  // Encryption handler
  const encryptMessage = async () => {
    let cipher = ""
    const steps: string[] = []
    steps.push(`Starting with plaintext: ${plaintext}`)
    steps.push(`Using shift value: ${shift}`)

    for (let i = 0; i < plaintext.length; i++) {
      const char = plaintext[i]
      if (!/[a-zA-Z]/.test(char)) {
        cipher += char
        continue
      }
      const isUpperCase = char === char.toUpperCase()
      const base = isUpperCase ? 65 : 97
      const x = char.charCodeAt(0) - base
      const encryptedVal = (x + shift) % 26
      const encryptedChar = String.fromCharCode(encryptedVal + base)
      steps.push(`Character '${char}' (value ${x}): (${x} + ${shift}) mod 26 = ${encryptedVal} → '${encryptedChar}'`)
      cipher += encryptedChar
    }

    setCiphertext(cipher)
    setStepByStep(steps)

    // Record to history DB
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:        1,
          cipher_type:    'caesar',
          plaintext,
          encrypted_text: cipher,
          key_a:          shift,
          key_b:          null,
          operation:      'encrypt'
        })
      })
    } catch (err) {
      console.error('Failed to save history:', err)
    }
  }

  // Decryption handler
  const decryptMessage = async () => {
    let plain = ""
    const steps: string[] = []
    steps.push(`Starting with ciphertext: ${ciphertext}`)
    steps.push(`Using shift value: ${shift}`)

    for (let i = 0; i < ciphertext.length; i++) {
      const char = ciphertext[i]
      if (!/[a-zA-Z]/.test(char)) {
        plain += char
        continue
      }
      const isUpperCase = char === char.toUpperCase()
      const base = isUpperCase ? 65 : 97
      const y = char.charCodeAt(0) - base
      let decryptedVal = (y - shift) % 26
      if (decryptedVal < 0) decryptedVal += 26
      const decryptedChar = String.fromCharCode(decryptedVal + base)
      steps.push(`Character '${char}' (value ${y}): (${y} - ${shift}) mod 26 = ${decryptedVal} → '${decryptedChar}'`)
      plain += decryptedChar
    }

    setPlaintext(plain)
    setStepByStep(steps)

    // Record to history DB
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:        1,
          cipher_type:    'caesar',
          plaintext:      ciphertext,
          encrypted_text: plain,
          key_a:          shift,
          key_b:          null,
          operation:      'decrypt'
        })
      })
    } catch (err) {
      console.error('Failed to save history:', err)
    }
  }

  const bruteForce = async() => {
    const results: { shift: number; text: string }[] = []
    const steps: string[] = []

    steps.push(`Starting brute force attack on: ${ciphertext}`)

    for (let s = 0; s < 26; s++) {
      let decrypted = ""

      for (let i = 0; i < ciphertext.length; i++) {
        const char = ciphertext[i]

        // Skip non-alphabetic characters
        if (!/[a-zA-Z]/.test(char)) {
          decrypted += char
          continue
        }

        // Determine if uppercase or lowercase
        const isUpperCase = char === char.toUpperCase()
        const base = isUpperCase ? 65 : 97

        // Convert to 0-25 range
        const y = char.charCodeAt(0) - base

        // Apply Caesar shift (reverse)
        let decryptedVal = (y - s) % 26
        // Handle negative modulo
        if (decryptedVal < 0) decryptedVal += 26

        // Convert back to ASCII and maintain case
        const decryptedChar = String.fromCharCode(decryptedVal + base)

        decrypted += decryptedChar
      }

      results.push({ shift: s, text: decrypted })
    }

    steps.push(`Generated all 26 possible shifts`)
    steps.push(`Review the results to find the correct plaintext`)

    setAllShifts(results)
    setStepByStep(steps)
    try {
      // stringify results so we can store them
      const resultText = JSON.stringify(results);
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:        1,
          cipher_type:    'caesar',
          plaintext:      ciphertext,    // the text you tried to crack
          encrypted_text: resultText,    // the full list of shifts/decrypts
          key_a:          null,
          key_b:          null,
          operation:      'brute-force'  // new operation flag
        })
      });
    } catch (err) {
      console.error('Failed to save brute‐force history:', err);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700">Caesar Cipher</h1>
        <p className="mt-2 text-gray-600">
          A simple substitution cipher where each letter is shifted by a fixed number
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
              <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
              <TabsTrigger value="brute-force">Brute Force</TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Encryption</CardTitle>
                  <CardDescription>Convert plaintext to ciphertext by shifting each letter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plaintext">Plaintext</Label>
                    <Input
                      id="plaintext"
                      placeholder="Enter text to encrypt"
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="shift-value">Shift Value:</Label>
                      <Input
                        id="shift-value-input"
                        type="number"
                        className="w-20 text-center"
                        value={shift}
                        onChange={(e) => handleShiftInput(e.target.value)}
                      />
                    </div>
                    <Slider
                      id="shift-value"
                      min={0}
                      max={25}
                      value={[shift]}
                      onValueChange={(value) => setShift(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={encryptMessage}
                      disabled={!plaintext}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Lock className="mr-2 h-4 w-4" /> Encrypt
                    </Button>
                  </div>

                  {ciphertext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="ciphertext">Ciphertext</Label>
                      <div className="p-4 bg-emerald-50 rounded-md font-mono break-all">{ciphertext}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">Decryption</CardTitle>
                  <CardDescription>
                    Convert ciphertext back to plaintext by shifting each letter in reverse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciphertext-input">Ciphertext</Label>
                    <Input
                      id="ciphertext-input"
                      placeholder="Enter text to decrypt"
                      value={ciphertext}
                      onChange={(e) => setCiphertext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="shift-value-decrypt">Shift Value:</Label>
                      <Input
                        id="shift-value-decrypt-input"
                        type="number"
                        className="w-20 text-center"
                        value={shift}
                        onChange={(e) => handleShiftInput(e.target.value)}
                      />
                    </div>
                    <Slider
                      id="shift-value-decrypt"
                      min={0}
                      max={25}
                      value={[shift]}
                      onValueChange={(value) => setShift(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={decryptMessage}
                      disabled={!ciphertext}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Unlock className="mr-2 h-4 w-4" /> Decrypt
                    </Button>
                  </div>

                  {plaintext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="plaintext-output">Plaintext</Label>
                      <div className="p-4 bg-blue-50 rounded-md font-mono break-all">{plaintext}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="brute-force">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Brute Force Attack</CardTitle>
                  <CardDescription>Try all 26 possible shifts to find the correct plaintext</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciphertext-brute">Ciphertext to Crack</Label>
                    <Input
                      id="ciphertext-brute"
                      placeholder="Enter ciphertext to crack"
                      value={ciphertext}
                      onChange={(e) => setCiphertext(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={bruteForce}
                      disabled={!ciphertext}
                      className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Try All Shifts
                    </Button>
                  </div>

                  {allShifts.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label>All Possible Shifts</Label>
                      <div className="max-h-96 overflow-y-auto border rounded-md">
                        {allShifts.map((result, index) => (
                          <div key={index} className={`p-3 border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <p className="font-bold">Shift {result.shift}:</p>
                            <p className="font-mono break-all">{result.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-700">Step-by-Step Explanation</CardTitle>
              <CardDescription>See how the cipher works in detail</CardDescription>
            </CardHeader>
            <CardContent>
              {stepByStep.length > 0 ? (
                <div className="space-y-3">
                  {stepByStep.map((step, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Perform an operation to see the step-by-step explanation</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-blue-700">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold">Encryption</h3>
                  <p>For each letter in the plaintext:</p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">C = (P + shift) mod 26</p>
                  <p className="mt-1">Where P is the position of the plaintext letter (A=0, B=1, ..., Z=25)</p>
                </div>

                <div>
                  <h3 className="font-bold">Decryption</h3>
                  <p>For each letter in the ciphertext:</p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">P = (C - shift) mod 26</p>
                </div>

                <div>
                  <h3 className="font-bold">Historical Note</h3>
                  <p>
                    Named after Julius Caesar, who used it with a shift of 3 to protect messages of military
                    significance.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">Security</h3>
                  <p>The Caesar cipher is extremely weak because there are only 26 possible keys to try.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

