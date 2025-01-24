import ImageCapture from "@/components/ImageCapture"
import { Contact } from "lucide-react"

export default function Home() {
  return (
    <main className="py-4">
      <div className="mb-6 flex items-center justify-center">
        <div className="flex items-center text-left">
          <Contact className="w-14 h-14 text-gray-700 flex-shrink-0" />
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-gray-800">Image to Contact</h1>
            <span className="text-gray-600 text-sm italic">Take a picture of a business card to turn it into a contact</span>
          </div>
        </div>
      </div>
      <div className="px-4">
        <div className="w-full max-w-lg mx-auto">
          <ImageCapture />
        </div>
      </div>
    </main>
  )
}

