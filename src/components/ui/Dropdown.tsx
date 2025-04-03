import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  items: DropdownItem[];
  onSelect: (value: string) => void;
  placeholder?: string;
  selectedValue?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  onSelect,
  placeholder = 'Select an option',
  selectedValue,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedItem ? selectedItem.label : placeholder}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
          <ul className="py-1">
            {items.map((item) => (
              <li
                key={item.value}
                className={`
                  flex items-center px-4 py-2 text-sm cursor-pointer
                  ${selectedValue === item.value ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
                `}
                onClick={() => handleSelect(item.value)}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
