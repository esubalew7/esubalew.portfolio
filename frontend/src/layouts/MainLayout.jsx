import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/nav/Navbar';
import { Footer } from '../components/Footer';
import { useVisitorTracking } from '../hooks/useVisitorTracking';

export const MainLayout = () => {
  useVisitorTracking();

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--void)',
        color: 'var(--text-primary)',
      }}
    >
      <Navbar />
      {/*
        No pt-24 here — HeroSection is full-bleed behind the transparent navbar.
        Each section manages its own spacing.
      */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
