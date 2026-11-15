import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* The design-system NavBar and Footer render plain <a href="/...">. Catch clicks
   on internal links anywhere in the app and route them client-side. */
export default function InternalLinks() {
  const navigate = useNavigate();
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest('a[href^="/"]');
      if (!a || a.target === '_blank') return;
      e.preventDefault();
      navigate(a.getAttribute('href'));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);
  return null;
}
