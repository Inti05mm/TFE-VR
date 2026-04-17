export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LOGO */}
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <a className="block text-teal-600 dark:text-teal-300" href="#">
              <span className="sr-only">Home</span>
              <svg
                className="h-8"
                viewBox="0 0 28 24"
                fill="none"
              >
                <path
                  d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424C24.5336 4.7861 26.2422 7.4194 26.98 10.3847H25.78..."
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>

          {/* NAV */}
          <div className="md:flex md:items-center md:gap-12">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <li><a className="text-gray-500 hover:text-gray-700 dark:text-white">About</a></li>
                <li><a className="text-gray-500 hover:text-gray-700 dark:text-white">Careers</a></li>
                <li><a className="text-gray-500 hover:text-gray-700 dark:text-white">Services</a></li>
                <li><a className="text-gray-500 hover:text-gray-700 dark:text-white">Projects</a></li>
              </ul>
            </nav>

            {/* PROFILE */}
            <div className="relative hidden md:block">
              <button className="overflow-hidden rounded-full border border-gray-300 dark:border-gray-600">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
                  alt="profile"
                  className="w-10 h-10 object-cover"
                />
              </button>
            </div>

            {/* MOBILE MENU */}
            <div className="block md:hidden">
              <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                ☰
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}