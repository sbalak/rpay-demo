import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import httpClient from '@/lib/httpClient';
import { common } from '@/constants/Styles';

interface BillProps {
  order: any;
}

export default function Bill({ order }: BillProps) {
  const { authState } = useAuth();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Only show if order is delivered
  if (order?.status !== "delivered") {
    return null;
  }

  const generatePDF = async () => {
    if (!order || !order.orderId) {
      Alert.alert('Error', 'Order data not available');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      // Get customer information
      let customerName = 'N/A';
      let customerPhone = 'N/A';
      
      if (authState.authenticated && authState.userId) {
        try {
          const customerResponse = await httpClient.get(`/customer/details?customerId=${authState.userId}`);
          if (customerResponse.data) {
            customerName = customerResponse.data.firstName && customerResponse.data.lastName 
              ? `${customerResponse.data.firstName} ${customerResponse.data.lastName}`
              : customerResponse.data.phone || 'N/A';
            customerPhone = customerResponse.data.phone || 'N/A';
          }
        } catch (error) {
          console.log('Could not fetch customer details, using defaults');
        }
      }

      // Create HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 20px;
              color: #000000;
              font-size: 14px;
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 24px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 20px;
            }
            .subtitle {
              text-align: left;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 16px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 15px;
            }
            .entity-details {
              text-align: left;
              margin-bottom: 20px;
            }
            .entity-detail {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #000000;
              margin-bottom: 5px;
            }
            .invoice-details {
              text-align: left;
              margin-bottom: 20px;
            }
            .invoice-detail {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #000000;
              margin-bottom: 5px;
            }
            .customer-info {
              text-align: left;
              margin-bottom: 20px;
            }
            .customer-detail {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #000000;
              margin-bottom: 5px;
            }
            .section-title {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 18px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 10px;
              text-align: left;
            }
            .body-text {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #000000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-family: Arial, Helvetica, sans-serif;
              color: #000000;
            }
            th {
              background-color: #f2f2f2;
              font-family: Arial, Helvetica, sans-serif;
              font-weight: bold;
              color: #000000;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #000000;
            }
            .gst-info {
              background-color: #f0f8ff;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .gst-title {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 18px;
              font-weight: bold;
              color: #000000;
              margin-bottom: 10px;
            }
            .gst-text {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #000000;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="title">Tax Invoice</div>
              <img src="https://settlnow.com/images/logo.png" alt="SettlNow Logo" style="width: 120px; height: auto; margin-top: 5px;">
            </div>
          </div>
          
          <div class="subtitle">Tax Invoice on behalf of -</div>
          
          <div class="entity-details">
            <div class="entity-detail"><strong>Legal Entity Name:</strong> ${order.restaurantLegalName || 'Restaurant'}</div>
            <div class="entity-detail"><strong>Restaurant Name:</strong> ${order.restaurantName || 'Restaurant'}</div>
            <div class="entity-detail"><strong>Restaurant Address:</strong> ${order.restaurantAddress || 'Address not available'}</div>
            <div class="entity-detail"><strong>Restaurant GSTIN:</strong> ${order.restaurantGSTNumber || 'GST Number not available'}</div>
            <div class="entity-detail"><strong>Restaurant FSSAI:</strong> ${order.restaurantFSSAINumber || 'FSSAI Number not available'}</div>
          </div>

          <div class="invoice-details">
            <div class="invoice-detail"><strong>Invoice No:</strong> ${order.orderId || 'N/A'}</div>
            <div class="invoice-detail"><strong>Invoice Date:</strong> ${order.dateCreated || 'N/A'}</div>
          </div>

          <div class="customer-info">
            <div class="customer-detail"><strong>Customer:</strong> ${customerName}</div>
            <div class="customer-detail"><strong>State Name & Place of Supply:</strong> ${order.restaurantState || 'State not available'}</div>
          </div>

          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems ? order.orderItems.map((item: any) => `
                <tr>
                  <td>${item.foodName || 'N/A'}</td>
                  <td>${item.quantity || 'N/A'}</td>
                  <td>${item.price || 'N/A'}</td>
                  <td>${item.amount || 'N/A'}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>

          <div class="section-title">Order Summary</div>
          <table style="width: 50%; margin-left: auto;">
            <tr>
              <td><strong>Sub Total:</strong></td>
              <td>${order.preTaxAmount || 'N/A'}</td>
            </tr>
            ${order.deductionAmount && order.deductionAmount !== '₹ 0.00' ? `
            <tr>
              <td><strong>Deduction:</strong></td>
              <td>${order.deductionAmount}</td>
            </tr>
            ` : ''}
            <tr>
              <td><strong>Taxable Amount:</strong></td>
              <td>${order.taxableAmount || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>CGST @ 2.5%:</strong></td>
              <td>${order.primaryTaxAmount || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>SGST @ 2.5%:</strong></td>
              <td>${order.secondaryTaxAmount || 'N/A'}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Grand Total:</strong></td>
              <td><strong>${order.dueAmount || 'N/A'}</strong></td>
            </tr>
          </table>

          <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #000000; margin: 0; font-style: italic;">
              This is a computer generated invoice and does not require signature.
            </p>
          </div>

          <div class="footer">
            <p class="body-text">Thank you for your order!</p>
            <p class="body-text">Generated on: ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Order Invoice',
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.pdfButton, isGeneratingPDF && styles.pdfButtonDisabled]}
      onPress={generatePDF}
      disabled={isGeneratingPDF}
    >
      {isGeneratingPDF ? (
        <>
          <Ionicons name="hourglass" size={20} color={Colors.White} />
          <Text style={[common.text, styles.pdfButtonText]}>Generating...</Text>
        </>
      ) : (
        <>
          <Ionicons name="download" size={15} color={Colors.White} />
          <Text style={[common.text, styles.pdfButtonText]}>Download</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  pdfButtonDisabled: {
    opacity: 0.7,
    backgroundColor: Colors.LightGrey,
  },
  pdfButtonText: {
    color: Colors.White,
    marginLeft: 5,
  },
});
