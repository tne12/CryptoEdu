import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, History, User } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-emerald-700">Classical Encryption</h1>
        <p className="mt-2 text-lg text-gray-600">Explore and learn about classical encryption techniques</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-emerald-200 hover:border-emerald-400 transition-colors">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-emerald-700">Affine Cipher</CardTitle>
            <CardDescription>C = aP + b mod 26</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              Encrypt or decrypt messages using the Affine cipher. Includes functionality to crack the cipher using
              frequency analysis.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/ciphers/affine" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Try Affine Cipher <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700">Caesar Cipher</CardTitle>
            <CardDescription>Shift each letter by a fixed number</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Encrypt or decrypt messages by shifting each letter in the alphabet by a fixed number of positions.</p>
          </CardContent>
          <CardFooter>
            <Link href="/ciphers/caesar" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Try Caesar Cipher <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-emerald-200 hover:border-emerald-400 transition-colors">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-emerald-700">Vigenère Cipher</CardTitle>
            <CardDescription>Polyalphabetic substitution cipher</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Encrypt or decrypt messages using a keyword to determine multiple shift values across the message.</p>
          </CardContent>
          <CardFooter>
            <Link href="/ciphers/vigenere" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Try Vigenère Cipher <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700">Playfair Cipher</CardTitle>
            <CardDescription>Digraph substitution cipher</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Encrypt or decrypt messages using a 5×5 matrix of letters constructed using a keyword.</p>
          </CardContent>
          <CardFooter>
            <Link href="/ciphers/playfair" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Try Playfair Cipher <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-emerald-200 hover:border-emerald-400 transition-colors">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-emerald-700">Hill Cipher</CardTitle>
            <CardDescription>Matrix-based encryption</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Encrypt or decrypt messages using matrix multiplication with a key matrix.</p>
          </CardContent>
          <CardFooter>
            <Link href="/ciphers/hill" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Try Hill Cipher <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700">Extended Euclid</CardTitle>
            <CardDescription>Find modular multiplicative inverse</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Calculate the modular multiplicative inverse of an integer using the Extended Euclidean Algorithm.</p>
          </CardContent>
          <CardFooter>
            <Link href="/ciphers/euclid" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Try Extended Euclid <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center">
        <Link href="/login">
          <Button className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600">
            <User className="mr-2 h-4 w-4" /> Login / Register
          </Button>
        </Link>
        <Link href="/history">
          <Button
            variant="outline"
            className="w-full md:w-auto border-emerald-500 text-emerald-700 hover:bg-emerald-50"
          >
            <History className="mr-2 h-4 w-4" /> View History
          </Button>
        </Link>
      </div>
    </div>
  )
}

