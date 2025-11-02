export interface ServiceData {
    rowIndex: number;
    serviceId: string;
    date: string;
    slipNo: string;
    customerName: string;
    contact: string;
    productName: string;
    brand: string;
    colorAndSize: string;
    serviceType: string;
    warrantyStatus: 'Warranty' | 'Non-Warranty';
    estimateAmount: string;
    warrantyInvoiceNumber: string;
    warrantyDate: string;
    imageUrl: string;
    serviceStatus: 'New' | 'In Service' | 'Completed' | 'Informed to Customer' | 'Delivered to Customer';
    servicemanAmount: string;
    servicemanName: string;
    customerPaidAmount: string;
    invoiceNumber: string;
}

export type NewServicePayload = Omit<ServiceData, 'rowIndex' | 'serviceId' | 'serviceStatus' | 'imageUrl' | 'servicemanName'> & {
    imageName: string;
    image: string; // base64
    imageMimeType: string;
};

export type UpdateServicePayload = Omit<ServiceData, 'imageUrl'> & {
    imageName?: string;
    image?: string; // base64
    imageMimeType?: string;
    imageUrl_existing?: string;
};

export enum ServiceStatus {
    New = 'New',
    InService = 'In Service',
    Completed = 'Completed',
    Informed = 'Informed to Customer',
    Delivered = 'Delivered to Customer'
}