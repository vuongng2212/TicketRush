'use client';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-hairline bg-ink mt-24">
      <div className="px-6 lg:px-12 py-16 lg:py-24">
        {/* Massive wordmark */}
        <h2
          className="font-display uppercase text-coral leading-[0.85] tracking-[-0.03em] break-all"
          style={{
            fontSize: 'clamp(120px, 22vw, 320px)',
            fontWeight: 400,
          }}
        >
          TICKETRUSH
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Newsletter */}
          <div className="md:col-span-2">
            <p className="font-mono text-label uppercase text-muted tracking-[0.2em] mb-4">
              Nhận thông báo concert mới
            </p>
            <form
              className="flex border-b border-paper"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="email@cuaban.vn"
                aria-label="Email đăng ký nhận thông báo"
                className="flex-1 bg-transparent text-paper placeholder:text-muted font-body text-body py-3 focus:outline-none"
              />
              <button
                type="submit"
                className="font-label uppercase text-coral tracking-[0.2em] text-label py-3 px-4 hover:text-paper transition-none"
              >
                Đăng ký →
              </button>
            </form>
          </div>

          {/* Links */}
          <div>
            <p className="font-mono text-label uppercase text-muted tracking-[0.2em] mb-4">
              Liên kết
            </p>
            <ul className="space-y-2">
              {['Về chúng tôi', 'Điều khoản', 'Liên hệ', 'Báo chí'].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="font-body text-small text-paper hover:text-coral"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-hairline flex flex-col md:flex-row justify-between gap-4">
          <p className="font-mono text-[11px] uppercase text-muted tracking-[0.15em]">
            © 2026 TicketRush · Hà Nội / Sài Gòn / Đà Nẵng
          </p>
          <p className="font-mono text-[11px] uppercase text-muted tracking-[0.15em]">
            v2.0.0 · editorial build
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
