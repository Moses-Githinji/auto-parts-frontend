import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Order } from "../../types/order";

// Register fonts (using default fonts for simplicity)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#2b579a",
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2b579a",
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  documentNumber: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: "#64748b",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2b579a",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
  },
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#2b579a",
  },
  colPart: {
    flex: 3,
  },
  colSku: {
    flex: 1.5,
    textAlign: "center",
  },
  colQty: {
    flex: 1,
    textAlign: "center",
  },
  colPrice: {
    flex: 1.5,
    textAlign: "right",
  },
  colTotal: {
    flex: 1.5,
    textAlign: "right",
  },
  cell: {
    fontSize: 9,
    color: "#475569",
  },
  cellBold: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
  },
  cellCenter: {
    textAlign: "center",
  },
  cellRight: {
    textAlign: "right",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 4,
  },
  totalsLabel: {
    width: 100,
    textAlign: "right",
    fontSize: 9,
    color: "#64748b",
    paddingRight: 10,
  },
  totalsValue: {
    width: 80,
    textAlign: "right",
    fontSize: 9,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  shippingLabel: {
    flexDirection: "row",
    gap: 20,
  },
  shippingFrom: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  shippingTo: {
    flex: 1,
    padding: 15,
    borderWidth: 2,
    borderColor: "#2b579a",
    borderRadius: 4,
  },
  barcode: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8fafc",
    textAlign: "center",
  },
  barcodeText: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 4,
  },
});

// Invoice PDF Document
export const InvoicePDF = ({ order }: { order: Order }) => {
  // Get unique vendors from items
  const getUniqueVendors = () => {
    const vendors = new Map();
    order.items.forEach((item) => {
      if (item.product?.vendor) {
        vendors.set(item.product.vendor.id, item.product.vendor);
      }
    });
    return Array.from(vendors.values());
  };

  const vendors = getUniqueVendors();
  const primaryVendor = vendors[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>Auto Parts Kenya</Text>
            <Text style={styles.date}>Premium Automotive Parts</Text>
            <Text style={styles.date}>Nairobi, Kenya</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>INVOICE</Text>
            <Text style={styles.documentNumber}>#{order.orderNumber}</Text>
            <Text style={styles.date}>
              Date: {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Vendor Details */}
        {primaryVendor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sold By</Text>
            <View style={styles.row}>
              <Text style={styles.cellBold}>{primaryVendor.companyName}</Text>
            </View>
            {primaryVendor.city && (
              <View style={styles.row}>
                <Text style={styles.cell}>{primaryVendor.city}, Kenya</Text>
              </View>
            )}
          </View>
        )}

        {/* Customer & Shipping */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.row}>
            <Text style={styles.cellBold}>{order.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>{order.customerEmail}</Text>
          </View>
          {order.customerPhone && (
            <View style={styles.row}>
              <Text style={styles.cell}>{order.customerPhone}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ship To</Text>
          <View style={styles.row}>
            <Text style={styles.cellBold}>
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>{order.shippingAddress.street}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.rowHeader}>
            <Text style={[styles.colPart, styles.cellBold]}>Description</Text>
            <Text style={[styles.colSku, styles.cellBold]}>SKU</Text>
            <Text style={[styles.colQty, styles.cellBold]}>Qty</Text>
            <Text style={[styles.colPrice, styles.cellBold]}>Unit Price</Text>
            <Text style={[styles.colTotal, styles.cellBold]}>Total</Text>
          </View>
          {order.items.map((item) => (
            <View style={styles.row} key={item.id}>
              <View style={styles.colPart}>
                <Text style={styles.cellBold}>{item.product?.name}</Text>
                {item.product?.vendor && (
                  <Text style={[styles.cell, { fontSize: 8 }]}>
                    Sold by: {item.product.vendor.companyName}
                  </Text>
                )}
              </View>
              <Text style={[styles.colSku, styles.cell, styles.cellCenter]}>
                {item.product?.partNumber || "N/A"}
              </Text>
              <Text style={[styles.colQty, styles.cell, styles.cellCenter]}>
                {item.quantity}
              </Text>
              <Text style={[styles.colPrice, styles.cell, styles.cellRight]}>
                KSh {Number(item.price || 0).toLocaleString()}
              </Text>
              <Text style={[styles.colTotal, styles.cell, styles.cellRight]}>
                KSh{" "}
                {(
                  Number(item.price || 0) * Number(item.quantity)
                ).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal:</Text>
            <Text style={styles.totalsValue}>
              KSh {Number(order.subtotal).toLocaleString()}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping:</Text>
            <Text style={styles.totalsValue}>
              KSh {Number(order.shipping).toLocaleString()}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax:</Text>
            <Text style={styles.totalsValue}>
              KSh {Number(order.tax).toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.totalsRow,
              {
                borderTopWidth: 1,
                borderTopColor: "#2b579a",
                marginTop: 8,
                paddingTop: 8,
              },
            ]}
          >
            <Text style={styles.totalsLabel}>Total:</Text>
            <Text
              style={[styles.totalsValue, { fontSize: 12, color: "#2b579a" }]}
            >
              KSh {Number(order.total).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>
            Payment Status: {order.paymentStatus}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Packing Slip PDF Document
export const PackingSlipPDF = ({ order }: { order: Order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>Auto Parts Kenya</Text>
          <Text style={styles.date}>Order Packing Slip</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.documentTitle}>PACKING SLIP</Text>
          <Text style={styles.documentNumber}>#{order.orderNumber}</Text>
          <Text style={styles.date}>
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Ship To */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ship To</Text>
        <View style={styles.row}>
          <Text style={styles.cellBold}>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>{order.shippingAddress.street}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.zipCode}
          </Text>
        </View>
        {order.customerPhone && (
          <View style={styles.row}>
            <Text style={styles.cell}>Phone: {order.customerPhone}</Text>
          </View>
        )}
      </View>

      {/* Items Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items to Pick</Text>
        <View style={styles.rowHeader}>
          <Text style={[styles.colPart, styles.cellBold]}>Description</Text>
          <Text style={[styles.colSku, styles.cellBold]}>SKU</Text>
          <Text style={[styles.colQty, styles.cellBold]}>Qty</Text>
          <Text style={[styles.colTotal, styles.cellBold]}>Check</Text>
        </View>
        {order.items.map((item) => (
          <View style={styles.row} key={item.id}>
            <View style={styles.colPart}>
              <Text style={styles.cellBold}>{item.product?.name}</Text>
              {item.product?.specifications?.Volume && (
                <Text style={styles.cell}>
                  {item.product.specifications.Volume}
                </Text>
              )}
            </View>
            <Text style={[styles.colSku, styles.cell, styles.cellCenter]}>
              {item.product?.partNumber || "N/A"}
            </Text>
            <Text style={[styles.colQty, styles.cell, styles.cellCenter]}>
              {item.quantity}
            </Text>
            <View style={[styles.colTotal]} />
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.totalsLabel}>Total Items:</Text>
          <Text style={styles.totalsValue}>
            {order.items.reduce((sum, i) => sum + Number(i.quantity), 0)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalsLabel}>Total Weight:</Text>
          <Text style={styles.totalsValue}>--</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Warehouse Use Only</Text>
        <Text style={styles.footerText}>
          Picked by: ___________ Packed by: ___________
        </Text>
      </View>
    </Page>
  </Document>
);

// Shipping Label PDF Document
export const ShippingLabelPDF = ({ order }: { order: Order }) => (
  <Document>
    <Page size="A6" style={[styles.page, { padding: 20 }]}>
      {/* From */}
      <View style={styles.shippingFrom}>
        <Text
          style={[
            styles.cellBold,
            { color: "#64748b", fontSize: 8, marginBottom: 4 },
          ]}
        >
          FROM:
        </Text>
        <Text style={[styles.cellBold, { fontSize: 12, color: "#2b579a" }]}>
          Auto Parts Kenya
        </Text>
        <Text style={styles.cell}>Nairobi, Kenya</Text>
      </View>

      {/* To */}
      <View style={styles.shippingTo}>
        <Text
          style={[
            styles.cellBold,
            { color: "#2b579a", fontSize: 8, marginBottom: 4 },
          ]}
        >
          TO:
        </Text>
        <Text style={[styles.cellBold, { fontSize: 14 }]}>
          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
        </Text>
        <Text style={styles.cell}>{order.shippingAddress.street}</Text>
        <Text style={styles.cell}>
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.zipCode}
        </Text>
        <Text style={styles.cell}>Phone: {order.customerPhone || "N/A"}</Text>
      </View>

      {/* Order Info */}
      <View style={{ marginTop: 15 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cellBold, { fontSize: 8, color: "#64748b" }]}>
              ORDER #
            </Text>
            <Text style={[styles.cellBold, { fontSize: 12 }]}>
              {order.orderNumber}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cellBold, { fontSize: 8, color: "#64748b" }]}>
              DATE
            </Text>
            <Text style={styles.cell}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Barcode */}
      <View style={styles.barcode}>
        <Text style={styles.barcodeText}>{order.orderNumber}</Text>
        <Text style={[styles.cell, { fontSize: 8, marginTop: 5 }]}>
          (Scan for tracking)
        </Text>
      </View>
    </Page>
  </Document>
);
