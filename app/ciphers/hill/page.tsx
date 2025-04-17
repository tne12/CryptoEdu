"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Unlock } from "lucide-react"

export default function HillCipher() {
  const [plaintext, setPlaintext] = useState("")
  const [ciphertext, setCiphertext] = useState("")
  const [matrixSize, setMatrixSize] = useState<"2" | "3">("2")
  const [keyMatrix, setKeyMatrix] = useState<number[][]>([
    [1, 2],
    [3, 4],
  ])
  const [inverseMatrix, setInverseMatrix] = useState<number[][]>([])
  const [determinant, setDeterminant] = useState(0)
  const [isValidMatrix, setIsValidMatrix] = useState(true)
  const [activeTab, setActiveTab] = useState("encrypt")
  const [stepByStep, setStepByStep] = useState<string[]>([])

  // Update key matrix when size changes
  useEffect(() => {
    if (matrixSize === "2") {
      // Example of a valid 2x2 matrix (the one from Exercise 5)
      setKeyMatrix([
        [7, 8],
        [17, 3],
      ])
    } else {
      // Example of a valid 3x3 matrix
      setKeyMatrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
    }
  }, [matrixSize])

  // Calculate determinant and inverse matrix when key matrix changes
  useEffect(() => {
    calculateDeterminantAndInverse()
  }, [keyMatrix])

  // Calculate determinant and inverse matrix
  const calculateDeterminantAndInverse = () => {
    if (matrixSize === "2") {
      // For 2x2 matrix
      const a = keyMatrix[0][0]
      const b = keyMatrix[0][1]
      const c = keyMatrix[1][0]
      const d = keyMatrix[1][1]

      // Calculate determinant: ad - bc
      let det = (a * d - b * c) % 26
      if (det < 0) det += 26
      setDeterminant(det)

      // Check if determinant is invertible (gcd(det, 26) = 1)
      let isInvertible = false
      let detInverse = 0

      for (let i = 0; i < 26; i++) {
        if ((det * i) % 26 === 1) {
          isInvertible = true
          detInverse = i
          break
        }
      }

      setIsValidMatrix(isInvertible)

      if (isInvertible) {
        // Calculate adjugate matrix
        const adjugate = [
          [d, -b < 0 ? -b + 26 : -b],
          [-c < 0 ? -c + 26 : -c, a],
        ]

        // Calculate inverse matrix: (detInverse * adjugate) mod 26
        const inverse = adjugate.map((row) =>
          row.map((val) => {
            const modVal = (val * detInverse) % 26
            return modVal < 0 ? modVal + 26 : modVal
          }),
        )

        setInverseMatrix(inverse)
      } else {
        setInverseMatrix([])
      }
    } else {
      // For 3x3 matrix
      const a = keyMatrix[0][0]
      const b = keyMatrix[0][1]
      const c = keyMatrix[0][2]
      const d = keyMatrix[1][0]
      const e = keyMatrix[1][1]
      const f = keyMatrix[1][2]
      const g = keyMatrix[2][0]
      const h = keyMatrix[2][1]
      const i = keyMatrix[2][2]

      // Calculate determinant for 3x3 matrix
      let det = (a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)) % 26

      if (det < 0) det += 26
      setDeterminant(det)

      // Check if determinant is invertible
      let isInvertible = false
      let detInverse = 0

      for (let j = 0; j < 26; j++) {
        if ((det * j) % 26 === 1) {
          isInvertible = true
          detInverse = j
          break
        }
      }

      setIsValidMatrix(isInvertible)

      if (isInvertible) {
        // Calculate cofactor matrix
        const cofactor = [
          [(((e * i - f * h) % 26) + 26) % 26, ((-(d * i - f * g) % 26) + 26) % 26, (((d * h - e * g) % 26) + 26) % 26],
          [
            ((-(b * i - c * h) % 26) + 26) % 26,
            (((a * i - c * g) % 26) + 26) % 26,
            ((-(a * h - b * g) % 26) + 26) % 26,
          ],
          [(((b * f - c * e) % 26) + 26) % 26, ((-(a * f - c * d) % 26) + 26) % 26, (((a * e - b * d) % 26) + 26) % 26],
        ]

        // Calculate adjugate (transpose of cofactor)
        const adjugate = [
          [cofactor[0][0], cofactor[1][0], cofactor[2][0]],
          [cofactor[0][1], cofactor[1][1], cofactor[2][1]],
          [cofactor[0][2], cofactor[1][2], cofactor[2][2]],
        ]

        // Calculate inverse matrix: (detInverse * adjugate) mod 26
        const inverse = adjugate.map((row) =>
          row.map((val) => {
            const modVal = (val * detInverse) % 26
            return modVal < 0 ? modVal + 26 : modVal
          }),
        )

        setInverseMatrix(inverse)
      } else {
        setInverseMatrix([])
      }
    }
  }

  // Handle key matrix input change
  const handleMatrixChange = (row: number, col: number, value: string) => {
    const numValue = Number.parseInt(value) || 0
    const newMatrix = [...keyMatrix]
    newMatrix[row][col] = numValue % 26 // Ensure value is within 0-25
    setKeyMatrix(newMatrix)
  }

  // Prepare text for Hill cipher (convert to numbers, pad if necessary)
  const prepareText = (text: string) => {
    // Convert to uppercase and remove non-alphabetic characters
    const prepared = text.toUpperCase().replace(/[^A-Z]/g, "")

    // Convert to numbers (A=0, B=1, ..., Z=25)
    const numbers = prepared.split("").map((char) => char.charCodeAt(0) - 65)

    // Pad with 'X' (23) if necessary to make complete blocks
    const blockSize = Number.parseInt(matrixSize)
    while (numbers.length % blockSize !== 0) {
      numbers.push(23) // 'X' is 23
    }

    return numbers
  }

  // Convert numbers back to text
  const numbersToText = (numbers: number[]) => {
    return numbers.map((num) => String.fromCharCode((num % 26) + 65)).join("")
  }

  // Matrix multiplication for encryption/decryption
  const multiplyMatrix = (matrix: number[][], vector: number[]) => {
    const size = matrix.length
    const result = new Array(size).fill(0)

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        result[i] = (result[i] + matrix[i][j] * vector[j]) % 26
      }
    }

    return result
  }

  const encryptMessage = async () => {
    if (!isValidMatrix) return
    const nums = prepareText(plaintext)
    const cipherNums: number[] = []
    const steps: string[] = []
    steps.push(`Starting with plaintext: ${plaintext}`)
    steps.push(`Numeric blocks: ${nums.join(", ")}`)
    const blockSize = Number.parseInt(matrixSize)
    for (let i = 0; i < nums.length; i += blockSize) {
      const block = nums.slice(i, i + blockSize)
      const enc = multiplyMatrix(keyMatrix, block)
      steps.push(`Block ${i/blockSize+1}: [${block.join(", ")}] → [${enc.join(", ")}]`)
      cipherNums.push(...enc)
    }
    const cipherText = numbersToText(cipherNums)
    setCiphertext(cipherText)
    setStepByStep(steps)
    // log history
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          user_id: 1,
          cipher_type: 'hill',
          plaintext,
          encrypted_text: cipherText,
          key_a: matrixSize === '2' ? keyMatrix.flat()[0] : keyMatrix.flat()[0],
          key_b: Number.parseInt(matrixSize),
          operation: 'encrypt'
        })
      })
    } catch(err) { console.error(err) }
  }


  const decryptMessage = async () => {
    if (!isValidMatrix || inverseMatrix.length === 0) return
    const nums = prepareText(ciphertext)
    const plainNums: number[] = []
    const steps: string[] = []
    steps.push(`Starting with ciphertext: ${ciphertext}`)
    steps.push(`Numeric blocks: ${nums.join(", ")}`)
    const blockSize = Number.parseInt(matrixSize)
    for (let i = 0; i < nums.length; i += blockSize) {
      const block = nums.slice(i, i + blockSize)
      const dec = multiplyMatrix(inverseMatrix, block)
      steps.push(`Block ${i/blockSize+1}: [${block.join(", ")}] → [${dec.join(", ")}]`)
      plainNums.push(...dec)
    }
    const plainText = numbersToText(plainNums)
    setPlaintext(plainText)
    setStepByStep(steps)
    // log history
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          user_id: 1,
          cipher_type: 'hill',
          plaintext: ciphertext,
          encrypted_text: plainText,
          key_a: matrixSize === '2' ? keyMatrix.flat()[0] : keyMatrix.flat()[0],
          key_b: Number.parseInt(matrixSize),
          operation: 'decrypt'
        })
      })
    } catch(err) { console.error(err) }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-emerald-700">Hill Cipher</h1>
        <p className="mt-2 text-gray-600">A polygraphic substitution cipher based on linear algebra</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
              <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt">
              <Card>
                <CardHeader>
                  <CardTitle className="text-emerald-700">Encryption</CardTitle>
                  <CardDescription>Convert plaintext to ciphertext using the Hill cipher</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="matrix-size">Matrix Size</Label>
                    <Select value={matrixSize} onValueChange={(value) => setMatrixSize(value as "2" | "3")}>
                      <SelectTrigger id="matrix-size">
                        <SelectValue placeholder="Select matrix size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2×2</SelectItem>
                        <SelectItem value="3">3×3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Key Matrix Input Section - ENCRYPT */}
                  <div className="space-y-2">
                    <Label>
                      Key Matrix ({matrixSize}×{matrixSize})
                    </Label>
                    <div className={`grid ${matrixSize === "2" ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
                      {Array.from({ length: Number.parseInt(matrixSize) }).map((_, rowIndex) =>
                        Array.from({ length: Number.parseInt(matrixSize) }).map((_, colIndex) => (
                          <div key={`${rowIndex}-${colIndex}`} className="space-y-1">
                            <Label className="text-xs text-gray-500">
                              K[{rowIndex},{colIndex}]
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="25"
                              value={keyMatrix[rowIndex][colIndex]}
                              onChange={(e) => handleMatrixChange(rowIndex, colIndex, e.target.value)}
                            />
                          </div>
                        )),
                      )}
                    </div>

                    {!isValidMatrix && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          The key matrix is not invertible modulo 26. Please choose a different matrix.
                        </AlertDescription>
                      </Alert>
                    )}

                    {isValidMatrix && (
                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm">Determinant: {determinant}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plaintext">Plaintext</Label>
                    <Input
                      id="plaintext"
                      placeholder="Enter text to encrypt"
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Only alphabetic characters will be used. Text will be padded if necessary.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={encryptMessage}
                      disabled={!plaintext || !isValidMatrix}
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
                  <CardDescription>Convert ciphertext back to plaintext using the Hill cipher</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="matrix-size-decrypt">Matrix Size</Label>
                    <Select value={matrixSize} onValueChange={(value) => setMatrixSize(value as "2" | "3")}>
                      <SelectTrigger id="matrix-size-decrypt">
                        <SelectValue placeholder="Select matrix size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2×2</SelectItem>
                        <SelectItem value="3">3×3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Key Matrix Input Section - DECRYPT */}
                  <div className="space-y-2">
                    <Label>
                      Key Matrix ({matrixSize}×{matrixSize})
                    </Label>
                    <div className={`grid ${matrixSize === "2" ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
                      {Array.from({ length: Number.parseInt(matrixSize) }).map((_, rowIndex) =>
                        Array.from({ length: Number.parseInt(matrixSize) }).map((_, colIndex) => (
                          <div key={`${rowIndex}-${colIndex}`} className="space-y-1">
                            <Label className="text-xs text-gray-500">
                              K[{rowIndex},{colIndex}]
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="25"
                              value={keyMatrix[rowIndex][colIndex]}
                              onChange={(e) => handleMatrixChange(rowIndex, colIndex, e.target.value)}
                            />
                          </div>
                        )),
                      )}
                    </div>

                    {!isValidMatrix && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          The key matrix is not invertible modulo 26. Please choose a different matrix.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {isValidMatrix && inverseMatrix.length > 0 && (
                    <div className="space-y-2">
                      <Label>Inverse Matrix</Label>
                      <div className={`grid ${matrixSize === "2" ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
                        {Array.from({ length: Number.parseInt(matrixSize) }).map((_, rowIndex) =>
                          Array.from({ length: Number.parseInt(matrixSize) }).map((_, colIndex) => (
                            <div key={`inv-${rowIndex}-${colIndex}`} className="space-y-1">
                              <Label className="text-xs text-gray-500">
                                K⁻¹[{rowIndex},{colIndex}]
                              </Label>
                              <div className="p-2 bg-blue-50 rounded-md text-center font-mono">
                                {inverseMatrix[rowIndex][colIndex]}
                              </div>
                            </div>
                          )),
                        )}
                      </div>
                    </div>
                  )}

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
                    <Button
                      onClick={decryptMessage}
                      disabled={!ciphertext || !isValidMatrix || inverseMatrix.length === 0}
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
                  <h3 className="font-bold">Key Matrix</h3>
                  <p>A square matrix (2×2 or 3×3) is used as the encryption key.</p>
                  <p className="mt-1">
                    The determinant of the matrix must be coprime with 26 for decryption to be possible.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">Encryption</h3>
                  <p>The plaintext is divided into blocks of size n (where n is the matrix size).</p>
                  <p className="mt-1">Each block is multiplied by the key matrix to produce the ciphertext block.</p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">C = K × P (mod 26)</p>
                </div>

                <div>
                  <h3 className="font-bold">Decryption</h3>
                  <p>The inverse of the key matrix is calculated.</p>
                  <p className="mt-1">
                    Each ciphertext block is multiplied by the inverse matrix to recover the plaintext.
                  </p>
                  <p className="p-2 bg-gray-50 rounded-md mt-1 font-mono">P = K⁻¹ × C (mod 26)</p>
                </div>

                <div>
                  <h3 className="font-bold">Historical Note</h3>
                  <p>
                    Invented by Lester S. Hill in 1929, it was the first polygraphic cipher that was practical for
                    manual encryption of text.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

