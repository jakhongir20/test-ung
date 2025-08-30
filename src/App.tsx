import { Outlet } from 'react-router-dom';
import { Header } from "./components";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
