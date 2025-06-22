import {Button} from "@/types/blocks/base";

export interface StyleOption {
    id: string;
    name: string;
    description: string;
    icon: string;
    gradient: string;
    bgColor: string;
    borderColor: string;
}

export interface ImageStyleTransfer {
    disabled?: boolean;
    name?: string;
    title?: string;
    description?: string;
    uploadSection?: {
        title?: string;
        description?: string;
        uploadPlaceholder?: {
            title?: string;
            description?: string;
            buttonText?: string;
        };
        changeButtonText?: string;
    };
    resultSection?: {
        title?: string;
        uploadFirstMessage?: {
            title?: string;
            description?: string;
        };
        processingMessage?: {
            title?: string;
            description?: string;
        };
        readyMessage?: {
            title?: string;
            description?: string;
        };
        downloadButton?: Button;
        tryAnotherButton?: Button;
    };
    styleSelection?: {
        title?: string;
        description?: string;
        uploadFirstMessage?: string;
        selectedBadgeText?: string;
    };
    styleOptions?: StyleOption[];
    fileFormats?: string;
    processingDuration?: number;
    progressTexts?: {
        processing?: string;
        complete?: string;
    };
}