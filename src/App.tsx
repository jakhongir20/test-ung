import { Outlet } from 'react-router-dom';
import { Header } from "./components";

function App() {
  return (
    <div className="min-h-screen">
      <Header/>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet/>
      </main>
    </div>
  );
}

export default App;
