"use client"

import type React from "react"
import {useRef, useState} from "react"
import type {ImageStyleTransfer} from "@/types/blocks/image-style-transfer"
import Image from "next/image"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Progress} from "@/components/ui/progress"
import Icon from "@/components/icon"
import {cn} from "@/lib/utils"


export default function ImageStyleTransferBlock({
                                                    imageStyleTransfer
                                                }: {
    imageStyleTransfer: ImageStyleTransfer
}) {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (imageStyleTransfer.disabled) {
        return null
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string)
                setProcessedImage(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleStyleSelect = async (styleId: string) => {
        setSelectedStyle(styleId)

        if (uploadedImage) {
            setIsProcessing(true)
            setProgress(0)

            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(progressInterval)
                        return 100
                    }
                    return prev + 10
                })
            }, 200)

            setTimeout(() => {
                const selectedStyleData = imageStyleTransfer.styleOptions?.find((s) => s.id === styleId)
                setProcessedImage(
                    `/placeholder.svg?height=500&width=500&query=${selectedStyleData?.name} style processed image`,
                )
                setIsProcessing(false)
                setProgress(0)
            }, imageStyleTransfer.processingDuration || 2000)
        }
    }

    const handleDownload = () => {
        if (processedImage) {
            const link = document.createElement("a")
            link.href = processedImage
            link.download = `styled-image-${selectedStyle}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <section id={imageStyleTransfer.name} className="w-full py-16 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <Icon name="LuSparkles" className="h-8 w-8 text-purple-600"/>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {imageStyleTransfer.title}
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {imageStyleTransfer.description}
                    </p>
                </div>

                {/* Image Comparison Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icon name="LuImage" className="h-5 w-5"/>
                            {imageStyleTransfer.uploadSection?.title}
                        </CardTitle>
                        <CardDescription>{imageStyleTransfer.uploadSection?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column - Original/Upload */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-center">{imageStyleTransfer.uploadSection?.title}</h3>
                                {!uploadedImage ? (
                                    <Card className="border-dashed border-2 border-muted-foreground/25 h-96">
                                        <CardContent className="h-full flex items-center justify-center p-8">
                                            <div className="text-center space-y-4">
                                                <div
                                                    className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                    <Icon name="LuUpload" className="h-8 w-8 text-muted-foreground"/>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{imageStyleTransfer.uploadSection?.uploadPlaceholder?.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{imageStyleTransfer.fileFormats}</p>
                                                </div>
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                >
                                                    <Icon name="LuImage" className="mr-2 h-4 w-4"/>
                                                    {imageStyleTransfer.uploadSection?.uploadPlaceholder?.buttonText}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
                                            <Image
                                                src={uploadedImage || "/placeholder.svg"}
                                                alt="Original image"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex justify-center">
                                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                                {imageStyleTransfer.uploadSection?.changeButtonText}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Processed Result */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-center">{imageStyleTransfer.resultSection?.title}</h3>
                                {!uploadedImage ? (
                                    <Card className="border-dashed border-2 border-muted-foreground/25 h-96">
                                        <CardContent className="h-full flex items-center justify-center p-8">
                                            <div className="text-center space-y-4">
                                                <div
                                                    className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                    <Icon name="LuSparkles" className="h-8 w-8 text-muted-foreground"/>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{imageStyleTransfer.resultSection?.uploadFirstMessage?.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{imageStyleTransfer.resultSection?.uploadFirstMessage?.description}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : isProcessing ? (
                                    <Card className="h-96">
                                        <CardContent className="h-full flex items-center justify-center p-8">
                                            <div className="text-center space-y-4">
                                                <div
                                                    className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <Icon name="LuSparkles"
                                                          className="h-8 w-8 text-purple-600 animate-spin"/>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{imageStyleTransfer.resultSection?.processingMessage?.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{imageStyleTransfer.resultSection?.processingMessage?.description}</p>
                                                </div>
                                                <div className="max-w-xs mx-auto">
                                                    <Progress value={progress} className="h-2"/>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {progress}% {imageStyleTransfer.progressTexts?.complete}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : processedImage ? (
                                    <div className="space-y-4">
                                        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
                                            <Image
                                                src={processedImage || "/placeholder.svg"}
                                                alt="Processed image"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setProcessedImage(null)
                                                    setSelectedStyle(null)
                                                }}
                                            >
                                                {imageStyleTransfer.resultSection?.tryAnotherButton?.title}
                                            </Button>
                                            <Button
                                                onClick={handleDownload}
                                                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                            >
                                                <Icon name="LuDownload" className="mr-2 h-4 w-4"/>
                                                {imageStyleTransfer.resultSection?.downloadButton?.title}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Card className="border-dashed border-2 border-muted-foreground/25 h-96">
                                        <CardContent className="h-full flex items-center justify-center p-8">
                                            <div className="text-center space-y-4">
                                                <div
                                                    className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                    <Icon name="LuPalette" className="h-8 w-8 text-muted-foreground"/>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{imageStyleTransfer.resultSection?.readyMessage?.title}</h4>
                                                    <p className="text-sm text-muted-foreground">{imageStyleTransfer.resultSection?.readyMessage?.description}</p>
                                                    {selectedStyle && (
                                                        <Badge className="mt-2 bg-purple-600">
                                                            {imageStyleTransfer.styleOptions?.find((s) => s.id === selectedStyle)?.name} {imageStyleTransfer.styleSelection?.selectedBadgeText}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Style Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icon name="LuPalette" className="h-5 w-5"/>
                            {imageStyleTransfer.styleSelection?.title}
                        </CardTitle>
                        <CardDescription>
                            {imageStyleTransfer.styleSelection?.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {imageStyleTransfer.styleOptions?.map((style) => {
                                return (
                                    <Card
                                        key={style.id}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden",
                                            style.bgColor,
                                            style.borderColor,
                                            "border-2",
                                            selectedStyle === style.id && "ring-2 ring-purple-500 ring-offset-2 scale-105",
                                            !uploadedImage && "opacity-75",
                                            !uploadedImage && selectedStyle === style.id && "opacity-100",
                                        )}
                                        onClick={() => handleStyleSelect(style.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div
                                                    className={cn(
                                                        "relative w-full h-20 rounded-md overflow-hidden bg-gradient-to-br",
                                                        style.gradient,
                                                        "flex items-center justify-center",
                                                    )}
                                                >
                                                    <Icon name={style.icon}
                                                          className="h-8 w-8 text-white drop-shadow-lg"/>
                                                </div>

                                                <div className="text-center">
                                                    <h3 className="font-semibold text-sm">{style.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                                                </div>

                                                {selectedStyle === style.id && (
                                                    <Badge
                                                        className="w-full justify-center bg-purple-600 text-white">{imageStyleTransfer.styleSelection?.selectedBadgeText}</Badge>
                                                )}

                                                {!uploadedImage && (
                                                    <Badge variant="outline"
                                                           className="w-full justify-center text-xs opacity-60">
                                                        {imageStyleTransfer.styleSelection?.uploadFirstMessage}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
            </div>
        </section>
    )
}