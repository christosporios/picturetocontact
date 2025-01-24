"use client"

import { useState, useRef } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Download, RefreshCw, User, Phone, Mail, Briefcase, MapPin } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ContactDetails {
  name?: string
  phone?: string
  email?: string
  company?: string
  jobTitle?: string
  address?: string
  error?: string
}

export default function ImageCapture() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [vCardUrl, setVCardUrl] = useState<string | null>(null)
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      generateVCard(imageSrc)
    }
  }

  const generateVCard = async (imageSrc: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/generate-vcard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageSrc }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.details.error) {
          toast.error(data.details.error)
          resetCapture()
          return
        }
        const blob = new Blob([data.vcard], { type: "text/vcard" })
        const url = URL.createObjectURL(blob)
        setVCardUrl(url)
        setContactDetails(data.details)
      } else {
        console.error("Failed to generate vCard")
        toast.error("Failed to generate vCard")
      }
    } catch (error) {
      console.error("Error generating vCard:", error)
      toast.error("Error generating vCard")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setVCardUrl(null)
    setContactDetails(null)
  }

  return (
    <div className="screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-0">
          {!capturedImage ? (
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full aspect-[3/4] object-cover rounded-t-lg"
              />
              <Button
                onClick={captureImage}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-white text-black hover:bg-gray-200"
                variant="outline"
              >
                <Camera className="mr-2 h-4 w-4" /> Capture
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Image
                src={capturedImage || "/placeholder.svg"}
                alt="Captured"
                className="w-full aspect-[3/4] object-cover rounded-t-lg"
              />
              {isProcessing ? (
                <div className="flex items-center justify-center p-4">
                  <RefreshCw className="animate-spin h-6 w-6 text-primary" />
                  <span className="ml-2 text-sm text-gray-600">Processing...</span>
                </div>
              ) : (
                contactDetails && (
                  <div className="p-4 space-y-3">
                    <h2 className="text-lg font-semibold text-gray-800">Contact Details</h2>
                    <div className="space-y-2 text-sm">
                      <DetailItem icon={User} value={contactDetails.name} />
                      <DetailItem icon={Phone} value={contactDetails.phone} />
                      <DetailItem icon={Mail} value={contactDetails.email} />
                      <DetailItem icon={Briefcase} value={`${contactDetails.jobTitle} at ${contactDetails.company}`} />
                      <DetailItem icon={MapPin} value={contactDetails.address} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      {vCardUrl && (
                        <Button asChild className="flex-1" variant="outline">
                          <a href={vCardUrl} download="contact.vcf">
                            <Download className="mr-2 h-4 w-4" /> vCard
                          </a>
                        </Button>
                      )}
                      <Button onClick={resetCapture} className="flex-1">
                        <Camera className="mr-2 h-4 w-4" /> Retake
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({ icon: Icon, value }: { icon: any; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-center">
      <Icon className="h-4 w-4 mr-2 text-gray-500" />
      <span className="text-gray-700">{value}</span>
    </div>
  )
}

