import './i18n';

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast = document.createElement('div');
  const id = `toast-${Date.now()}`;

  const baseClasses = [
    'fixed',
    'top-[-100px]',
    'left-1/2',
    'transform',
    '-translate-x-1/2',
    'z-50',
    'px-6',
    'py-3',
    'rounded',
    'shadow-lg',
    'text-white',
    'text-center',
    'transition-all',
    'duration-500',
    'ease-out',
    'opacity-0',
    'scale-95',
    'border',
  ];

  const typeClasses =
    type === 'success'
      ? 'bg-green-500/20 border-green-500 text-green-600'
      : 'bg-red-500/20 border-red-500 text-red-600';

  toast.className = [...baseClasses, typeClasses].join(' ');
  toast.id = id;
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('top-[-100px]', 'opacity-0', 'scale-95');
    toast.classList.add('top-4', 'opacity-100', 'scale-100');
  });

  setTimeout(() => {
    toast.classList.remove('top-4', 'opacity-100', 'scale-100');
    toast.classList.add('top-[-100px]', 'opacity-0', 'scale-95');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3000);
}
