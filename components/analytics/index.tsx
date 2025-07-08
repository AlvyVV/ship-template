import {ReactNode} from "react";
import PlausibleProvider from "next-plausible";
import Clarity from '@microsoft/clarity';

interface AnalyticsProps {
    children?: ReactNode;
}

export default function Analytics({children}: AnalyticsProps) {
    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    const plausibleScriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL;
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

    if (clarityId) {
        Clarity.init(clarityId);

        if (!plausibleDomain || !plausibleScriptUrl) {
            return <>{children}</>;
        }

        if (process.env.NODE_ENV !== "production") {
            if (children) {
                return <>{children}</>;
            }
            return null;
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
            </PlausibleProvider>
        );
    }
}
