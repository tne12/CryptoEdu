"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { RefreshCw, Lock, Unlock } from "lucide-react"

export default function AffineCipher() {
  const [plaintext, setPlaintext] = useState("")
  const [ciphertext, setCiphertext] = useState("")
  const [a, setA] = useState(17)
  const [b, setB] = useState(20)
  const [aInverse, setAInverse] = useState(0)
  const [isValidA, setIsValidA] = useState(true)
  const [mostFrequent, setMostFrequent] = useState({ first: "E", second: "T" })
  const [crackedA, setCrackedA] = useState(0)
  const [crackedB, setCrackedB] = useState(0)
  const [crackedText, setCrackedText] = useState("")
  const [activeTab, setActiveTab] = useState("encrypt")
  const [stepByStep, setStepByStep] = useState<string[]>([])

  // Calculate a^-1 (multiplicative inverse of a)
  useEffect(() => {
    calculateAInverse()
  }, [a])

  const calculateAInverse = () => {
    let inverse = 0
    let valid = false

    for (let i = 0; i < 26; i++) {
      if ((a * i) % 26 === 1) {
        inverse = i
        valid = true
        break
      }
    }

    setAInverse(inverse)
    setIsValidA(valid)
  }

  // Handle direct input for 'a' value
  const handleAInput = (value: string) => {
    const numValue = Number.parseInt(value) || 0
    // Apply modulo 26 to the input value
    const modValue = ((numValue % 26) + 26) % 26
    // Ensure 'a' is not 0 (which would make it not coprime with 26)
    setA(modValue === 0 ? 1 : modValue)
  }

  // Handle direct input for 'b' value
  const handleBInput = (value: string) => {
    const numValue = Number.parseInt(value) || 0
    // Apply modulo 26 to the input value
    setB(((numValue % 26) + 26) % 26)
  }

  const encryptMessage = async () => {
    if (!isValidA) return

    let cipher = ""
    const steps: string[] = []
    steps.push(`Starting with plaintext: ${plaintext}`)
    steps.push(`Using key values: a = ${a}, b = ${b}`)

    for (let i = 0; i < plaintext.length; i++) {
      const char = plaintext[i]

      if (!/[a-zA-Z]/.test(char)) {
        cipher += char
        continue
      }

      const isUpperCase = char === char.toUpperCase()
      const x = char.toUpperCase().charCodeAt(0) - 65
      const encryptedVal = (a * x + b) % 26
      const encryptedChar = String.fromCharCode(encryptedVal + (isUpperCase ? 65 : 97))

      steps.push(`Character '${char}' (value ${x}): (${a} × ${x} + ${b}) mod 26 = ${encryptedVal} → '${encryptedChar}'`)
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
          user_id: 1,
          cipher_type: 'affine',
          plaintext,
          encrypted_text: cipher,
          key_a: a,
          key_b: b,
          operation: 'encrypt'
        })
      })
    } catch (err) {
      console.error('Failed to save history:', err)
    }
  }

  const decryptMessage = async () => {
    if (!isValidA) return

    let plain = ""
    const steps: string[] = []
    steps.push(`Starting with ciphertext: ${ciphertext}`)
    steps.push(`Using key values: a = ${a}, b = ${b}, a⁻¹ = ${aInverse}`)

    for (let i = 0; i < ciphertext.length; i++) {
      const char = ciphertext[i]

      if (!/[a-zA-Z]/.test(char)) {
        plain += char
        continue
      }

      const isUpperCase = char === char.toUpperCase()
      const y = char.toUpperCase().charCodeAt(0) - 65
      let decryptedVal = (aInverse * (y - b)) % 26
      if (decryptedVal < 0) decryptedVal += 26
      const decryptedChar = String.fromCharCode(decryptedVal + (isUpperCase ? 65 : 97))

      steps.push(`Character '${char}' (value ${y}): (${aInverse} × (${y} - ${b})) mod 26 = ${decryptedVal} → '${decryptedChar}'`)
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
          user_id: 1,
          cipher_type: 'affine',
          plaintext: ciphertext,
          encrypted_text: plain,
          key_a: a,
          key_b: b,
          operation: 'decrypt'
        })
      })
    } catch (err) {
      console.error('Failed to save history:', err)
    }
  }
  // Update the crackCipher function to match the approach in the handwritten solution
  const crackCipher = async() => {
    // Get the two most frequent letters in ciphertext from user input
    const y1 = mostFrequent.first.charCodeAt(0) - 65 // First most frequent in ciphertext
    const y2 = mostFrequent.second.charCodeAt(0) - 65 // Second most frequent in ciphertext

    // E and T are the most frequent letters in English
    const x1 = 4 // E = 4 in 0-25 indexing
    const x2 = 19 // T = 19 in 0-25 indexing

    const steps: string[] = []
    steps.push(`Setting up the system of equations:`)
    steps.push(`${mostFrequent.first} (${y1}) = (a×E(4) + b) mod 26 ... (1)`)
    steps.push(`${mostFrequent.second} (${y2}) = (a×T(19) + b) mod 26 ... (2)`)

    // Subtract equation (1) from (2) to eliminate b
    let diff = (y2 - y1) % 26
    if (diff < 0) diff += 26

    let xDiff = (x2 - x1) % 26
    if (xDiff < 0) xDiff += 26

    steps.push(`Subtracting equation (1) from (2):`)
    steps.push(`${y2} - ${y1} ≡ a(${x2} - ${x1}) mod 26`)
    steps.push(`${diff} ≡ ${xDiff}a mod 26`)

    // Solve for a using modular arithmetic
    // We need to find a such that (xDiff * a) mod 26 = diff
    let a_cracked = 0
    for (let a = 1; a < 26; a++) {
      if ((xDiff * a) % 26 === diff) {
        a_cracked = a
        break
      }
    }

    steps.push(`Solving for a: ${diff} ≡ ${xDiff}a mod 26`)
    steps.push(`a = ${a_cracked}`)

    // Now find b by substituting a back into equation (1)
    let b_cracked = (y1 - a_cracked * x1) % 26
    if (b_cracked < 0) b_cracked += 26

    steps.push(`Substituting a = ${a_cracked} into equation (1):`)
    steps.push(`${y1} ≡ (${a_cracked}×${x1} + b) mod 26`)
    steps.push(`${y1} ≡ (${a_cracked * x1} + b) mod 26`)
    steps.push(`b ≡ ${y1} - ${a_cracked * x1} mod 26`)
    steps.push(`b = ${b_cracked}`)

    setCrackedA(a_cracked)
    setCrackedB(b_cracked)

    // Try to decrypt with the cracked key
    let decrypted = ""

    // Calculate a^-1 for the cracked a
    let a_inverse = 0
    for (let i = 0; i < 26; i++) {
      if ((a_cracked * i) % 26 === 1) {
        a_inverse = i
        break
      }
    }

    for (let i = 0; i < ciphertext.length; i++) {
      const char = ciphertext[i]

      // Skip non-alphabetic characters
      if (!/[a-zA-Z]/.test(char)) {
        decrypted += char
        continue
      }

      // Determine if uppercase or lowercase
      const isUpperCase = char === char.toUpperCase()

      // Convert to 0-25 range
      const y = char.toUpperCase().charCodeAt(0) - 65

      // Apply decryption formula a^-1(y - b) mod 26
      let decryptedVal = (a_inverse * (y - b_cracked)) % 26
      // Handle negative modulo
      if (decryptedVal < 0) decryptedVal += 26

      // Convert back to ASCII and maintain case
      const decryptedChar = String.fromCharCode(decryptedVal + (isUpperCase ? 65 : 97))

      decrypted += decryptedChar
    }

    setCrackedText(decrypted)
    steps.push(`Cracked key: a = ${a_cracked}, b = ${b_cracked}`)
    steps.push(`Decrypted text: ${decrypted}`)

    setStepByStep(steps)
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:        1,
          cipher_type:    'affine',
          plaintext:      ciphertext,   // the text you input to crack
          encrypted_text: decrypted,    // the result of the crack
          key_a:          a_cracked,
          key_b:          b_cracked,
          operation:      'crack'       // <— NEW
        })
      });
    } catch (err) {
      console.error('Failed to save crack history:', err);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-emerald-700">Affine Cipher</h1>
        <p className="mt-2 text-gray-600">C = (aP + b) mod 26, where gcd(a, 26) = 1</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
              <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
              <TabsTrigger value="crack">Crack</TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">Encryption</CardTitle>
                  <CardDescription>
                    Convert plaintext to ciphertext using the Affine cipher formula: C = (aP + b) mod 26
                  </CardDescription>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="a-value">Key a:</Label>
                        <Input
                          id="a-value-input"
                          type="number"
                          className="w-20 text-center"
                          value={a}
                          onChange={(e) => handleAInput(e.target.value)}
                        />
                      </div>
                      <Slider
                        id="a-value"
                        min={1}
                        max={25}
                        step={2}
                        value={[a]}
                        onValueChange={(value) => setA(value[0])}
                      />
                      {!isValidA && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription>
                            The value of 'a' must be coprime with 26. Current value has no multiplicative inverse.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="b-value">Key b:</Label>
                        <Input
                          id="b-value-input"
                          type="number"
                          className="w-20 text-center"
                          value={b}
                          onChange={(e) => handleBInput(e.target.value)}
                        />
                      </div>
                      <Slider id="b-value" min={0} max={25} value={[b]} onValueChange={(value) => setB(value[0])} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={encryptMessage}
                      disabled={!isValidA || !plaintext}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Lock className="mr-2 h-4 w-4" /> Encrypt
                    </Button>
                  </div>

                  {ciphertext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="ciphertext">Ciphertext</Label>
                      <div className="p-4 bg-blue-50 rounded-md font-mono break-all">{ciphertext}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Decryption</CardTitle>
                  <CardDescription>
                    Convert ciphertext back to plaintext using the formula: P = a⁻¹(C - b) mod 26
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="a-value-decrypt">Key a:</Label>
                        <Input
                          id="a-value-decrypt-input"
                          type="number"
                          className="w-20 text-center"
                          value={a}
                          onChange={(e) => handleAInput(e.target.value)}
                        />
                      </div>
                      <Slider
                        id="a-value-decrypt"
                        min={1}
                        max={25}
                        step={2}
                        value={[a]}
                        onValueChange={(value) => setA(value[0])}
                      />
                      {!isValidA && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription>
                            The value of 'a' must be coprime with 26. Current value has no multiplicative inverse.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="b-value-decrypt">Key b:</Label>
                        <Input
                          id="b-value-decrypt-input"
                          type="number"
                          className="w-20 text-center"
                          value={b}
                          onChange={(e) => handleBInput(e.target.value)}
                        />
                      </div>
                      <Slider
                        id="b-value-decrypt"
                        min={0}
                        max={25}
                        value={[b]}
                        onValueChange={(value) => setB(value[0])}
                      />
                    </div>
                  </div>

                  {isValidA && (
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm">
                        Multiplicative inverse of a (a⁻¹): <span className="font-mono font-bold">{aInverse}</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={decryptMessage}
                      disabled={!isValidA || !ciphertext}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Unlock className="mr-2 h-4 w-4" /> Decrypt
                    </Button>
                  </div>

                  {plaintext && (
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="plaintext-output">Plaintext</Label>
                      <div className="p-4 bg-emerald-50 rounded-md font-mono break-all">{plaintext}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crack">
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">Cipher Cracking</CardTitle>
                  <CardDescription>Crack the Affine cipher using the two most frequent letters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-cipher-letter">First Most Frequent Cipher Letter</Label>
                      <Input
                        id="first-cipher-letter"
                        maxLength={1}
                        placeholder="e.g., J"
                        value={mostFrequent.first}
                        onChange={(e) => setMostFrequent({ ...mostFrequent, first: e.target.value.toUpperCase() })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="second-cipher-letter">Second Most Frequent Cipher Letter</Label>
                      <Input
                        id="second-cipher-letter"
                        maxLength={1}
                        placeholder="e.g., X"
                        value={mostFrequent.second}
                        onChange={(e) => setMostFrequent({ ...mostFrequent, second: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm">Assuming 'E' and 'T' are the most frequent letters in English plaintext</p>
                    <p className="text-sm mt-1">E = 4, T = 19 in 0-25 indexing</p>
                  </div>

                  <div className="space-y-4">
                    {(crackedA > 0 || crackedB > 0) && (
                      <div className="p-3 bg-emerald-100 rounded-md border border-emerald-200">
                        <p className="text-center font-medium text-emerald-800">
                          Cracked key values: a = <span className="font-mono font-bold">{crackedA}</span>, b ={" "}
                          <span className="font-mono font-bold">{crackedB}</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        onClick={crackCipher}
                        className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> Crack Cipher
                      </Button>
                    </div>
                  </div>

                  {crackedText && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm">
                          Cracked key values: a = <span className="font-mono font-bold">{crackedA}</span>, b ={" "}
                          <span className="font-mono font-bold">{crackedB}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ciphertext-input">Ciphertext to Decrypt</Label>
                        <Input
                          id="ciphertext-input"
                          placeholder="Enter ciphertext to decrypt with cracked key"
                          value={ciphertext}
                          onChange={(e) => setCiphertext(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cracked-text">Decrypted Text</Label>
                        <div className="p-4 bg-emerald-50 rounded-md font-mono break-all">{crackedText}</div>
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
              <CardTitle className="text-blue-700">Step-by-Step Explanation</CardTitle>
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
              <CardTitle className="text-emerald-700">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold">Encryption</h3>
                  <p>For each letter in the plaintext:</p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">C = (aP + b) mod 26</p>
                  <p className="mt-1">Where P is the position of the plaintext letter (A=0, B=1, ..., Z=25)</p>
                </div>

                <div>
                  <h3 className="font-bold">Decryption</h3>
                  <p>For each letter in the ciphertext:</p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">P = a⁻¹(C - b) mod 26</p>
                  <p className="mt-1">Where a⁻¹ is the modular multiplicative inverse of a</p>
                </div>

                <div>
                  <h3 className="font-bold">Requirements</h3>
                  <p>The value of 'a' must be coprime with 26 (gcd(a, 26) = 1)</p>
                  <p className="mt-1">Valid values for 'a': 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

