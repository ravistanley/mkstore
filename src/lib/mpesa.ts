// ============================================================
// M-Pesa Daraja API Integration
// ============================================================

const MPESA_BASE_URL =
    process.env.MPESA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

/**
 * Get M-Pesa OAuth access token
 */
export async function getMpesaAccessToken(): Promise<string> {
    const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await fetch(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
            method: "GET",
            headers: {
                Authorization: `Basic ${auth}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get M-Pesa access token");
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * Generate M-Pesa password for STK push
 */
function generateMpesaPassword(): { password: string; timestamp: string } {
    const timestamp = new Date()
        .toISOString()
        .replace(/[-T:\.Z]/g, "")
        .slice(0, 14);

    const password = Buffer.from(
        `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    return { password, timestamp };
}

/**
 * Normalize phone number to 254 format
 */
export function normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");

    if (cleaned.startsWith("+254")) {
        cleaned = cleaned.slice(1); // Remove +
    } else if (cleaned.startsWith("0")) {
        cleaned = "254" + cleaned.slice(1);
    } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
        cleaned = "254" + cleaned;
    }

    return cleaned;
}

/**
 * Initiate M-Pesa STK Push
 */
export async function initiateSTKPush(
    phoneNumber: string,
    amount: number,
    orderNumber: string
): Promise<{
    success: boolean;
    checkoutRequestId?: string;
    error?: string;
}> {
    try {
        const accessToken = await getMpesaAccessToken();
        const { password, timestamp } = generateMpesaPassword();
        const normalizedPhone = normalizePhoneNumber(phoneNumber);

        const response = await fetch(
            `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    BusinessShortCode: process.env.MPESA_SHORTCODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: Math.ceil(amount),
                    PartyA: normalizedPhone,
                    PartyB: process.env.MPESA_SHORTCODE,
                    PhoneNumber: normalizedPhone,
                    CallBackURL: process.env.MPESA_CALLBACK_URL,
                    AccountReference: orderNumber,
                    TransactionDesc: `Payment for ${orderNumber}`,
                }),
            }
        );

        const data = await response.json();

        if (data.ResponseCode === "0") {
            return {
                success: true,
                checkoutRequestId: data.CheckoutRequestID,
            };
        }

        return {
            success: false,
            error: data.errorMessage || data.ResponseDescription || "STK push failed",
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "STK push failed",
        };
    }
}

/**
 * Process M-Pesa callback data
 */
export function processMpesaCallback(body: Record<string, unknown>): {
    success: boolean;
    resultCode: number;
    resultDesc: string;
    mpesaReceipt?: string;
    transactionDate?: string;
    phoneNumber?: string;
    amount?: number;
} {
    const stkCallback = (body.Body as Record<string, unknown>)?.stkCallback as Record<string, unknown>;

    if (!stkCallback) {
        return { success: false, resultCode: -1, resultDesc: "Invalid callback data" };
    }

    const resultCode = stkCallback.ResultCode as number;
    const resultDesc = stkCallback.ResultDesc as string;

    if (resultCode !== 0) {
        return { success: false, resultCode, resultDesc };
    }

    const metadata = (stkCallback.CallbackMetadata as Record<string, unknown>)?.Item as Array<{
        Name: string;
        Value: string | number;
    }>;

    let mpesaReceipt = "";
    let transactionDate = "";
    let phoneNumber = "";
    let amount = 0;

    if (metadata) {
        for (const item of metadata) {
            switch (item.Name) {
                case "MpesaReceiptNumber":
                    mpesaReceipt = String(item.Value);
                    break;
                case "TransactionDate":
                    transactionDate = String(item.Value);
                    break;
                case "PhoneNumber":
                    phoneNumber = String(item.Value);
                    break;
                case "Amount":
                    amount = Number(item.Value);
                    break;
            }
        }
    }

    return {
        success: true,
        resultCode,
        resultDesc,
        mpesaReceipt,
        transactionDate,
        phoneNumber,
        amount,
    };
}
