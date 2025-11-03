import React, { forwardRef } from 'react';
import type { ServiceData } from '../types';

interface PrintableSlipProps {
    service: ServiceData;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; boldValue?: boolean; largeValue?: boolean }> = ({ label, value, boldValue = true, largeValue = false }) => (
    <div>
        <p className="text-sm text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-gray-900 ${largeValue ? 'text-xl' : 'text-base'} ${boldValue ? 'font-semibold' : 'font-normal'}`}>{value || '-'}</p>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`print-no-break ${className}`}>
        <h3 className="text-lg font-bold text-purple-700 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const PrintableSlip = forwardRef<HTMLDivElement, PrintableSlipProps>(({ service }, ref) => {
    return (
        <div ref={ref} className="p-8 bg-white font-sans text-gray-800" id="printable-slip">
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    body * { visibility: hidden; }
                    #printable-slip, #printable-slip * { visibility: visible; }
                    #printable-slip {
                         position: absolute;
                         left: 0;
                         top: 0;
                         width: 100%;
                         height: auto;
                         margin: 0;
                         padding: 20px;
                    }
                    .print-no-break { page-break-inside: avoid; }
                }
            `}</style>

            <header className="flex justify-between items-start pb-6 mb-6 border-b border-gray-200 print-no-break">
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-purple-600 p-4 rounded-lg shadow-md">
                        <i className="fas fa-tools text-white text-3xl fa-fw"></i>
                    </div>
                    <div>
                        <h2 className="font-extrabold text-4xl text-gray-800">Roshan Bags</h2>
                        <p className="text-lg text-gray-500">Service Department</p>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                    <p>33, SOUTH USMAN ROAD, NEAR BUS TERMINUS, T.NAGAR</p>
                    <p>CHENNAI-600017</p>
                    <p className="mt-2">Ph: 9345735945 | E-Mail: sales@roshanbags.com</p>
                    <p className="font-semibold text-gray-700 mt-2">GST: 33AAIFR7046M1ZT</p>
                </div>
            </header>

            <div className="bg-purple-50 p-2 my-6 print-no-break">
                <h1 className="text-center text-xl font-bold text-purple-800 tracking-widest uppercase">Service Slip</h1>
            </div>

            <main className="space-y-6">
                <div className="grid grid-cols-2 gap-6 pb-6">
                    <DetailItem label="Slip No." value={service.slipNo} largeValue={true} />
                    <DetailItem label="Date" value={service.date ? service.date.split('T')[0] : '-'} largeValue={true} />
                </div>
                
                <hr className="border-gray-200"/>

                <Section title="Customer Information" className="pt-6">
                    <div className="md:col-span-2">
                        <DetailItem label="Customer Name" value={service.customerName} />
                    </div>
                    <DetailItem label="Contact Number" value={service.contact} />
                </Section>
                
                <hr className="border-gray-200"/>

                <Section title="Product Information" className="pt-6">
                    <DetailItem label="Product Name" value={service.productName} />
                    <DetailItem label="Brand" value={service.brand} />
                    <DetailItem label="Color / Size" value={service.colorAndSize} />
                    <div className="md:col-span-3">
                         <DetailItem label="Service Required" value={service.serviceType} boldValue={false} />
                    </div>
                </Section>

                <hr className="border-gray-200"/>
                
                <Section title="Warranty & Estimate" className="pt-6">
                     <DetailItem label="Warranty Status" value={service.warrantyStatus} />
                        {service.warrantyStatus === 'Warranty' ? (
                            <>
                                <DetailItem label="Warranty Invoice" value={service.warrantyInvoiceNumber} />
                                <DetailItem label="Warranty Date" value={service.warrantyDate ? service.warrantyDate.split('T')[0] : '-'} />
                            </>
                        ) : (
                            <DetailItem label="Estimate Amount" value={service.estimateAmount ? `₹ ${service.estimateAmount}` : '-'} />
                        )}
                </Section>
            </main>

             <footer className="text-center mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500 print-no-break">
                <p className="font-semibold mb-2 text-base text-gray-600">Thank you for your business!</p>
                <p>This is a computer-generated slip and does not require a signature.</p>
                <p>Please keep this slip for future reference.</p>
            </footer>
        </div>
    );
});

export default PrintableSlip;