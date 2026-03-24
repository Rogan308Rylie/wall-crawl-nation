export default function ThankYouPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="border-8 border-black p-12 bg-white shadow-[16px_16px_0_0_#A3FF12] max-w-2xl w-full">
        <h1 className="text-5xl font-black mb-8 uppercase text-black tracking-tighter">Payment Successful 🎉</h1>
        <p className="text-xl font-bold text-black border-4 border-black inline-block px-6 py-4 bg-[#f0f0f0] shadow-[8px_8px_0_0_#000] uppercase">
          Your order has been confirmed. <br className="my-2" />
          We’ll update you soon.
        </p>
      </div>
    </div>
  );
}
