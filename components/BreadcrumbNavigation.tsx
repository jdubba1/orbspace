// * Breadcrumb Navigation Component
// ? Provides hierarchical navigation through manifestation levels
// ! Important for user orientation and navigation

// * Interface Definitions
// ? Define the shape of breadcrumb items and component props
interface Breadcrumb {
  name: string;
  onClick: () => void;
}

interface BreadcrumbNavigationProps {
  breadcrumbs: Breadcrumb[];
}

// * Main BreadcrumbNavigation Component
// ? Renders a chain of clickable breadcrumbs showing the current navigation path
export function BreadcrumbNavigation({
  breadcrumbs,
}: BreadcrumbNavigationProps) {
  return (
    // * Navigation Container
    // ? Fixed position with backdrop blur for better readability
    <nav className="fixed top-16 left-0 right-0 z-10 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Breadcrumb List */}
        <div className="flex items-center space-x-2 text-sm text-white/70">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {/* Separator between breadcrumbs */}
              {index > 0 && <span className="mx-2 text-white/40">→</span>}

              {/* Breadcrumb Item */}
              {/* ? Last item is current location (non-clickable) */}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-white font-medium">{crumb.name}</span>
              ) : (
                // * Clickable Navigation Link
                // ? Includes hover effect for better UX
                <button
                  onClick={crumb.onClick}
                  className="hover:text-white transition-colors duration-200"
                >
                  {crumb.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
