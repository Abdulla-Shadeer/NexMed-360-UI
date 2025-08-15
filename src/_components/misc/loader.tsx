export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-primary opacity-40">
      <div className="relative w-16 h-16 opacity-100">
        <div className="absolute inset-0 border-4 border-border-primary rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
