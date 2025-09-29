import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NewCustomAlert = ({
  openAlert,
  message,
  type = 'error', // 'success', 'error', 'warning', 'info'
  onClose,
  language = 'EN',
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (openAlert) {
      setIsVisible(true);
      setIsAnimating(true);

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [openAlert, autoClose, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-300 dark:border-green-700',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-800 dark:text-green-200',
          textColor: 'text-green-700 dark:text-green-300',
          title: language === 'EN' ? 'Success' : 'نجاح',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-300 dark:border-yellow-700',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-800 dark:text-yellow-200',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          title: language === 'EN' ? 'Warning' : 'تحذير',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-300 dark:border-blue-700',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-200',
          textColor: 'text-blue-700 dark:text-blue-300',
          title: language === 'EN' ? 'Information' : 'معلومات',
        };
      default: // error
        return {
          icon: XCircle,
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-300 dark:border-red-700',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-800 dark:text-red-200',
          textColor: 'text-red-700 dark:text-red-300',
          title: language === 'EN' ? 'Error' : 'خطأ',
        };
    }
  };

  if (!isVisible) return null;

  const config = getAlertConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Alert Container */}
      <div
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        <div
          className={`
            ${config.bgColor} ${config.borderColor}
            border-2 rounded-xl shadow-2xl p-6
            backdrop-blur-sm
            font-cairo
          `}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`
              absolute top-4 ${language === 'EN' ? 'right-4' : 'left-4'}
              p-1 rounded-full transition-colors duration-200
              hover:bg-gray-200 dark:hover:bg-gray-700
              ${config.textColor}
            `}
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="flex items-start space-x-4 rtl:space-x-reverse">
            {/* Icon */}
            <div className="flex-shrink-0">
              <IconComponent
                size={36}
                className={`${config.iconColor} drop-shadow-sm`}
              />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3
                className={`
                text-xl font-bold mb-2 ${config.titleColor}
                ${language === 'AR' ? 'text-right' : 'text-left'}
              `}
              >
                {config.title}
              </h3>

              <p
                className={`
                text-base leading-relaxed ${config.textColor}
                ${language === 'AR' ? 'text-right' : 'text-left'}
              `}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Progress Bar for Auto Close */}
          {autoClose && (
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ease-linear ${
                  type === 'success'
                    ? 'bg-green-500'
                    : type === 'warning'
                    ? 'bg-yellow-500'
                    : type === 'info'
                    ? 'bg-blue-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: '100%',
                  animation: `shrink ${duration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default NewCustomAlert;