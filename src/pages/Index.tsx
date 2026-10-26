import RecoveredInvoiceApp from "../components/recovered/InvoiceApp.js";
import { readStoredInvoiceBackup } from "../components/recovered/invoice-data";

export default function Index() {
  try {
    readStoredInvoiceBackup();
  } catch {
    return (
      <main className="max-w-2xl mx-auto p-8 space-y-4">
        <h1 className="text-xl font-bold">Your stored invoices could not be opened</h1>
        <p>No records have been changed. Keep your backup and do not clear browser storage. Please share the error so we can recover the saved data safely.</p>
      </main>
    );
  }

  return <RecoveredInvoiceApp />;
}
