
import type { NewServicePayload, UpdateServicePayload, ServiceData } from '../types';

// ===================================================================================
// CRITICAL: Replace this URL with your own deployed Google Apps Script URL.
// 1. Open your Google Apps Script project.
// 2. Click "Deploy" > "New deployment".
// 3. Set "Who has access" to "Anyone".
// 4. Click "Deploy" and copy the "Deployment ID" (URL) here.
// ===================================================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDHRcCXcJLeF_2OMk5Pcuf_NNwXRlnPXOZCVpS7zVwN6saQr_QLzJ2VzO9FczJSuJB2w/exec";

async function apiRequest<T,>(action: string, method: 'GET' | 'POST' = 'GET', payload?: object): Promise<T> {
    const url = new URL(SCRIPT_URL);
    if (method === 'GET') {
        url.searchParams.append('action', action);
        if (payload) {
            Object.entries(payload).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }
    }

    const options: RequestInit = {
        method,
        headers: {},
    };

    if (method === 'POST') {
        options.body = JSON.stringify({ action, ...payload });
        options.headers = { 'Content-Type': 'text/plain;charset=utf-8' }; // Required for Apps Script
    }

    try {
        const response = await fetch(url.toString(), options);

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        // Before parsing, check if the response is actually JSON.
        // A common error is getting an HTML login page from Google if script permissions are wrong.
        if (!contentType || !contentType.includes("application/json")) {
            if (contentType && contentType.includes("text/html")) {
                 throw new Error("Received HTML instead of JSON. Please check your Google Apps Script deployment settings. Ensure 'Who has access' is set to 'Anyone'.");
            }
            throw new Error(`Expected JSON response, but received content type: ${contentType}`);
        }
        
        const result = await response.json();
        if (result.status === 'error') {
            throw new Error(result.message || 'An unknown error occurred in the script');
        }
        return result as T;
    } catch (error) {
        console.error(`Error during ${action}:`, error);
        throw error;
    }
}


interface LastSlipResponse {
    status: 'success';
    lastSlipNumber: number;
}

export const getLastSlipNumber = (): Promise<number> => {
    return apiRequest<LastSlipResponse>('getLastSlip').then(data => data.lastSlipNumber);
};

interface SubmitResponse {
    status: 'success';
    message: string;
    serviceId: string;
}

export const submitService = (formData: NewServicePayload): Promise<SubmitResponse> => {
    return apiRequest<SubmitResponse>('addService', 'POST', formData);
};

interface UpdateResponse {
    status: 'success';
    message: string;
}

export const updateService = (formData: UpdateServicePayload): Promise<UpdateResponse> => {
    console.log("Updating service with payload:", formData); // Added for debugging
    return apiRequest<UpdateResponse>('updateService', 'POST', formData);
};

interface AllServicesResponse {
    status: 'success';
    data: ServiceData[];
}

export const getAllServices = (): Promise<ServiceData[]> => {
    return apiRequest<AllServicesResponse>('getAllServices').then(res => res.data);
};
