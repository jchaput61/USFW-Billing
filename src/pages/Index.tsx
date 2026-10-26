export default function Index() {
  return (
    <iframe
      title="USFW Invoicing Master"
      src={`${import.meta.env.BASE_URL}recovered-invoicing/index.html`}
      className="recovered-invoice-frame"
    />
  );
}
