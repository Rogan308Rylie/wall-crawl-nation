export default function Footer() {
  return (
    <footer className="mt-24 border-t-8 border-black bg-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="text-black font-black uppercase text-xl sm:text-2xl tracking-widest text-center sm:text-left">
          Wall Crawl Nation <br/>
          <span className="text-sm font-bold opacity-50">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
