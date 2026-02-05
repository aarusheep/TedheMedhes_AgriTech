import React from 'react';

// Button
export function Button({ children, className = '', variant = 'default', size = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) {
	const base = 'inline-flex items-center gap-2 rounded-md text-sm font-medium transition';
	const variants: Record<string, string> = {
		default: 'bg-green-600 text-white hover:bg-green-700',
		outline: 'border bg-white text-gray-800 hover:bg-gray-50',
		ghost: 'bg-transparent hover:bg-gray-100',
		link: 'text-green-600 underline',
	};
	const sizes: Record<string, string> = {
		default: 'h-9 px-4',
		sm: 'h-8 px-3 text-sm',
		lg: 'h-10 px-6',
		icon: 'p-2',
	};

	return (
		<button className={`${base} ${variants[variant] ?? variants.default} ${sizes[size] ?? sizes.default} ${className}`} {...props} />
	);
}

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
	return <input ref={ref} className={`border rounded-md px-3 py-2 w-full ${props.className ?? ''}`} {...props} />;
});

// Label
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
	return <label className={`block text-sm font-medium text-gray-700 ${props.className ?? ''}`} {...props} />;
}

// Textarea
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(props, ref) {
	return <textarea ref={ref} className={`border rounded-md px-3 py-2 w-full ${props.className ?? ''}`} {...props} />;
});

// Badge
export function Badge({
  children,
  className = '',
  variant = 'default',
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}) {
  const variants: Record<string, string> = {
    default: 'bg-green-600 text-white',
    outline: 'border border-gray-300 text-gray-700',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-600 text-white',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}


// Card and subcomponents
export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={`bg-white rounded-lg border p-4 shadow-sm ${className}`} {...props}>
			{children}
		</div>
	);
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
	return (
		<div className={`mb-4 ${className}`} {...props}>
			{children}
		</div>
	);
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h3 className={`text-lg font-semibold ${className}`} {...props}>
			{children}
		</h3>
	);
}

export function CardDescription({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p className={`text-sm text-gray-600 ${className}`} {...props}>
			{children}
		</p>
	);
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={`pt-2 ${className}`} {...props}>
			{children}
		</div>
	);
}

// Dialog - simplified: renders children when open
export function Dialog({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
	if (!open) return null;
	return <div className="fixed inset-0 z-50 flex items-center justify-center p-6">{children}</div>;
}

export function DialogContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={`bg-white rounded-lg shadow-lg max-w-3xl w-full ${className}`} {...props}>
			{children}
		</div>
	);
}

export function DialogHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={`px-6 py-4 border-b ${className}`} {...props}>
			{children}
		</div>
	);
}

export function DialogTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2 className={`text-xl font-semibold ${className}`} {...props}>
			{children}
		</h2>
	);
}

// RadioGroup
const RadioContext = React.createContext<null | { value: string; onChange: (v: string) => void }>(null);
export function RadioGroup({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (v: string) => void }) {
	return <RadioContext.Provider value={{ value, onChange: onValueChange }}>{children}</RadioContext.Provider>;
}

export function RadioGroupItem({ value, id }: { value: string; id?: string }) {
	const ctx = React.useContext(RadioContext);
	if (!ctx) return null;
	return (
		<input
			type="radio"
			id={id}
			name="radio-group"
			value={value}
			checked={ctx.value === value}
			onChange={() => ctx.onChange(value)}
			className="form-radio"
		/>
	);
}

// InputOTP: renders a row of inputs and manages focus
// ===== OTP CONTEXT =====
const OTPContext = React.createContext<{
  value: string;
  setValue: (v: string) => void;
  maxLength: number;
} | null>(null);

type InputOTPProps = {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  children: React.ReactNode;
};

export function InputOTP({
  value,
  onChange,
  maxLength = 6,
  children,
}: InputOTPProps) {
  return (
    <OTPContext.Provider
      value={{ value, setValue: onChange, maxLength }}
    >
      <div className="flex gap-2">{children}</div>
    </OTPContext.Provider>
  );
}

// ===== GROUP =====
export function InputOTPGroup({
  children,
  className = '',
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex gap-2 ${className}`}>{children}</div>;
}

// ===== SLOT =====
export function InputOTPSlot({ index }: { index: number }) {
  const ctx = React.useContext(OTPContext);
  if (!ctx) return null;

  const { value, setValue, maxLength } = ctx;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[index] = char;
    setValue(arr.join('').slice(0, maxLength));
  };

  return (
    <input
      value={value[index] ?? ''}
      onChange={handleChange}
      maxLength={1}
      className="w-12 h-12 text-center border rounded-md text-lg"
    />
  );
}


export default {};