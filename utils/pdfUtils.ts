
// This tells TypeScript that these variables are provided globally by the scripts in index.html
declare const html2canvas: any;
declare const jspdf: any;

/**
 * Generates a PDF from an HTML element and triggers a download.
 * @param element The HTML element to capture.
 * @param format The paper size, either 'a4' or 'a5'.
 * @param slipNo The slip number, used for the filename.
 * @param customerName The customer's name, used for the filename.
 */
export const downloadSlipAsPdf = async (
    element: HTMLElement,
    format: 'a4' | 'a5',
    slipNo: string,
    customerName: string
): Promise<void> => {
    if (!element) {
        throw new Error("Element to capture is not available.");
    }
    
    // Use html2canvas to render the element to a canvas
    const canvas = await html2canvas(element, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // Important for external images if any
    });
    
    // Get image data from canvas
    const imgData = canvas.toDataURL('image/png');

    // Define dimensions for A4 and A5 in 'mm' (millimeters)
    const pageDimensions = {
        a4: { width: 210, height: 297 },
        a5: { width: 148, height: 210 },
    };

    const { width: pageWidth, height: pageHeight } = pageDimensions[format];
    
    // Initialize jsPDF
    const { jsPDF } = jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: format,
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    // Calculate image dimensions to fit the page while maintaining aspect ratio
    let imgWidth = pageWidth;
    let imgHeight = imgWidth / canvasAspectRatio;

    // If the calculated height is greater than the page height, scale down
    if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = imgHeight * canvasAspectRatio;
    }

    // Center the image on the page
    const xOffset = (pageWidth - imgWidth) / 2;
    const yOffset = (pageHeight - imgHeight) / 2;

    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    
    // Save the PDF with the new filename format
    const filename = `${customerName.replace(/ /g, '_')}_${slipNo}.pdf`;
    pdf.save(filename);
};