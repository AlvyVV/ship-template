"use client";

import {ReactNode} from "react";
import PlausibleProvider from "next-plausible";
import ClarityAnalytics from "@/components/analytics/clarity";

interface AnalyticsProps {
    children?: ReactNode;
}

export default function Analytics({children}: AnalyticsProps) {
    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    const plausibleScriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL;


    if (!plausibleDomain || !plausibleScriptUrl) {
        return <>{children}</>;
    }

    return (
        <PlausibleProvider
            domain={plausibleDomain}
            hash={true}
            trackOutboundLinks={true}
            taggedEvents={true}
            trackFileDownloads={true}
            selfHosted={true}
            customDomain={plausibleScriptUrl}
        >
            {children}
            <ClarityAnalytics></ClarityAnalytics>
        </PlausibleProvider>
    );
}
